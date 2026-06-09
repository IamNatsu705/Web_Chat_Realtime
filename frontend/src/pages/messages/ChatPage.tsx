import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../components/layout/Header';
import { useAuth } from '../../providers/AuthProvider';
import { useConversation } from '../../features/chat/hooks/useConversation';
import { useGroupChat } from '../../features/chat/hooks/useGroupChat';
import { useTyping } from '../../features/chat/hooks/useTyping';

import type { Conversation } from '../../features/chat/types';
import { useQueryClient } from '@tanstack/react-query';
import { useConversationsQuery, CHAT_QUERIES } from '../../features/chat/hooks/queries';
import { useFriendsQuery } from '../../features/network/hooks/queries';
import { useSearchParams } from 'react-router-dom';
import { chatApi } from '../../features/chat/api/chatApi';

import ConversationList from '../../features/chat/components/ConversationList';
import ChatHeader from '../../features/chat/components/ChatHeader';
import ChatInput from '../../features/chat/components/ChatInput';
import MessageBubble from '../../features/chat/components/MessageBubble';
import CreateGroupModal from '../../features/chat/components/CreateGroupModal';
import GroupInfoPanel from '../../features/chat/components/GroupInfoPanel';
import ResourcePanel from '../../features/chat/components/ResourcePanel';
import ConfirmDialog from '../../components/ConfirmDialog';
import TypingIndicator from '../../features/chat/components/TypingIndicator';

// ─────────────────────────────────────────────────────────────────────────────

export default function ChatPage() {

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: conversations = [], isLoading: isLoadingConvs } = useConversationsQuery();
  const { data: friends = [] } = useFriendsQuery();

  const initialConvId = searchParams.get('conversationId')
    ? parseInt(searchParams.get('conversationId')!, 10)
    : null;

  const [activeConversationId, setActiveConversationId] = useState<number | null>(initialConvId);
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showResourcePanel, setShowResourcePanel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // ── Confirm Dialog state ────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showConfirm = useCallback(
    (opts: { title: string; message: string; confirmLabel?: string; variant?: 'danger' | 'warning' | 'info'; onConfirm: () => void }) => {
      setConfirmDialog({ isOpen: true, ...opts });
    },
    []
  );

  // ── Refs ─────────────────────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef(0);

  // ── Chat & Group hooks ────────────────────────────────────────────────────
  const {
    messages: allMessages,
    isLoading: isLoadingMsgs,
    isLoadingMore,
    hasMore,
    error: msgError,
    sendMessage,
    sendImageMessage,
    sendFileMessage,
    loadMore,
    markRead,
    handleLocalRecall,
    handleLocalDelete,
  } = useConversation(activeConversation);

  const {
    isProcessing: isGroupProcessing,
    createGroup,
    updateGroup,
    addMember,
    kickMember,
    leaveGroup,
    dissolveGroup,
  } = useGroupChat();

  // ── WebSocket: Tập trung toàn bộ sidebar WS logic trong 1 hook ──────────
  // Dùng activeConversationId và unread_count để tự động đánh dấu đã đọc
  // khi có tin nhắn mới tới mà user đang mở đoạn chat này.
  useEffect(() => {
    if (!activeConversationId || !activeConversation) return;
    if (activeConversation.my_status === 'pending') return; // Do NOT mark read for stranger chats!

    const handleMarkRead = () => {
      if ((activeConversation.unread_count ?? 0) > 0 && document.visibilityState === 'visible') {
        markRead();
        queryClient.setQueryData<Conversation[]>(CHAT_QUERIES.conversations(), (oldData = []) =>
          oldData.map(c => c.id === activeConversationId ? { ...c, unread_count: 0 } : c)
        );
      }
    };

    handleMarkRead();

    // Lắng nghe sự kiện tab visible lại (user chuyển tab rồi quay lại)
    document.addEventListener('visibilitychange', handleMarkRead);
    return () => {
      document.removeEventListener('visibilitychange', handleMarkRead);
    };
  }, [activeConversation, activeConversationId, activeConversation?.my_status, activeConversation?.unread_count, markRead, queryClient]);

  // ── BUG-15 FIX: Xử lý khi nhóm bị giải tán hoặc user bị kick từ WebSocket ──
  useEffect(() => {
    const handleGroupAction = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || !activeConversationId) return;

      // Nếu conversation đang mở bị dissolved hoặc bị kick
      if (detail.conversationId === activeConversationId) {
        setActiveConversationId(null);
        setSearchParams({});
        setShowGroupInfo(false);
      }
    };

    window.addEventListener('group-action', handleGroupAction);
    return () => {
      window.removeEventListener('group-action', handleGroupAction);
    };
  }, [activeConversationId, setSearchParams]);

  // ── NOTE: Global WebSocket logic is handled by WebSocketProvider.
  //    useConversation handles per-conversation state, and cacheUtils handles cache.

  // ── Auto-scroll to bottom on new messages ────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (isLoadingMore) {
      // Preserve scroll position when loading older messages
      prevScrollHeight.current = el.scrollHeight;
      return;
    }

    // After loading older messages, restore position
    if (prevScrollHeight.current > 0) {
      el.scrollTop = el.scrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = 0;
      return;
    }

    // For new messages, scroll to bottom
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, isLoadingMore]);

  // ── Auto-scroll when images load ─────────────────────────────────────────
  useEffect(() => {
    const handleImageLoaded = () => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    window.addEventListener('chat-image-loaded', handleImageLoaded as EventListener);
    return () => {
      window.removeEventListener('chat-image-loaded', handleImageLoaded as EventListener);
    };
  }, []);

  // ── Infinite scroll: load more when scrolled to top ──────────────────────
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop === 0 && hasMore && !isLoadingMore) {
      prevScrollHeight.current = el.scrollHeight;
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  // ── Select conversation ──────────────────────────────────────────────────
  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversationId(conv.id);
    setSearchParams({ conversationId: conv.id.toString() });
    setShowGroupInfo(false);
    setShowResourcePanel(false);
  };

  // ── Group actions ─────────────────────────────────────────────────────────
  const handleCreateGroup = async (data: Parameters<typeof createGroup>[0]) => {
    const newConv = await createGroup(data);
    if (newConv) {
      setActiveConversationId(newConv.id);
      setShowCreateGroup(false);
    }
  };

  const handleUpdateGroup = async (data: Parameters<typeof updateGroup>[1]) => {
    if (!activeConversation) return;
    await updateGroup(activeConversation.id, data);
  };

  const handleAddMember = async (userId: number) => {
    if (!activeConversation) return;
    await addMember(activeConversation.id, userId);
  };

  const handleKickMember = async (userId: number) => {
    if (!activeConversation) return;
    await kickMember(activeConversation.id, userId);
  };

  const handleLeaveGroup = async () => {
    if (!activeConversation) return;
    const ok = await leaveGroup(activeConversation.id);
    if (ok) {
      setActiveConversationId(null);
      setSearchParams({});
    }
  };

  const handleDissolveGroup = async () => {
    if (!activeConversation) return;
    showConfirm({
      title: 'Giải tán nhóm',
      message: 'Bạn có chắc muốn giải tán nhóm này? Tất cả tin nhắn và thành viên sẽ bị xóa vĩnh viễn.',
      confirmLabel: 'Giải tán',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirmDialog();
        const ok = await dissolveGroup(activeConversation.id);
        if (ok) {
          setActiveConversationId(null);
          setSearchParams({});
        }
      },
    });
  };

  const handleClearChat = async () => {
    if (!activeConversation) return;
    showConfirm({
      title: 'Xóa lịch sử chat',
      message: 'Toàn bộ lịch sử chat phía bạn sẽ bị xóa. Hành động này không thể hoàn tác.',
      confirmLabel: 'Xóa',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirmDialog();
        try {
          await chatApi.clearConversation(activeConversation.id);
          
          // Clear messages from cache entirely so it refetches from API
          // (API will respect cleared_at and return only newer messages)
          queryClient.removeQueries({ queryKey: CHAT_QUERIES.messages(activeConversation.id) });
          queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() });

          // Kicked out if stranger, otherwise stay in chat
          if (activeConversation.my_status === 'pending') {
            setActiveConversationId(null);
            setSearchParams({});
          }
        } catch {
          // silently fail
        }
      },
    });
  };

  const handleAcceptStranger = async () => {
    if(!activeConversation) return;
    try {
        await chatApi.acceptStranger(activeConversation.id);
        queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() });
    } catch { /* silently fail */ }
  };

  const handleRejectStranger = async () => {
    if(!activeConversation) return;
    showConfirm({
      title: 'Từ chối tin nhắn',
      message: 'Bạn có chắc muốn từ chối nhận tin nhắn từ người này?',
      confirmLabel: 'Từ chối',
      variant: 'warning',
      onConfirm: async () => {
        closeConfirmDialog();
        try {
          await chatApi.rejectStranger(activeConversation.id);
          queryClient.invalidateQueries({ queryKey: CHAT_QUERIES.conversations() });
        } catch { /* silently fail */ }
      },
    });
  };

  const handleSendFile = async (file: File, meta?: { title: string; category: string; description: string }) => {
    if (!activeConversation) return;
    try {
      setUploadProgress(0);
      await sendFileMessage(file, meta, (progress) => {
        setUploadProgress(progress);
      });
    } finally {
      setUploadProgress(null);
    }
  };

  // ── Group panel check ─────────────────────────────────────────────────────
  const isGroup = activeConversation?.is_group ?? false;

  // ── Typing indicator ─────────────────────────────────────────────────────
  const { emitTyping, typingText, isTyping } = useTyping(
    activeConversationId,
    isGroup
  );

  if (!user) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="grow flex overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex">
          <div className="grow bg-white rounded-2xl shadow border border-gray-200 flex overflow-hidden h-full">

            {/* ── LEFT: Conversation List ────────────────────────────────── */}
            <div className="w-80 shrink-0 border-r border-gray-200 flex flex-col">
              <ConversationList
                conversations={conversations}
                activeId={activeConversation?.id ?? null}
                currentUser={user}
                isLoading={isLoadingConvs}
                onSelect={handleSelectConversation}
                onNewGroup={() => setShowCreateGroup(true)}
              />
            </div>

            {/* ── RIGHT: Chat Window ────────────────────────────────────── */}
            <div className="grow flex flex-col min-w-0 relative">
              {activeConversation ? (
                <>
                  {/* Header */}
                  <ChatHeader
                    conversation={activeConversation}
                    currentUser={user}
                    onInfoClick={() => {
                      if (isGroup) {
                        setShowGroupInfo((v) => !v);
                        setShowResourcePanel(false);
                      } else {
                        setShowResourcePanel((v) => !v);
                      }
                    }}
                    onResourceClick={() => {
                      setShowResourcePanel((v) => !v);
                      setShowGroupInfo(false);
                    }}
                    onLeaveGroup={handleLeaveGroup}
                    onDissolveGroup={handleDissolveGroup}
                    onClearChat={handleClearChat}
                  />

                  {/* Messages area */}
                  <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="grow overflow-y-auto px-4 py-4 bg-gray-50 flex flex-col"
                  >
                    {/* Load more indicator */}
                    {isLoadingMore && (
                      <div className="flex justify-center mb-3">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 150}ms` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No more messages indicator */}
                    {!hasMore && allMessages.length > 0 && (
                      <div className="flex justify-center mb-4">
                        <span className="text-[10px] text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1">
                          Đây là tin nhắn đầu tiên
                        </span>
                      </div>
                    )}

                    {/* Loading skeleton */}
                    {isLoadingMsgs ? (
                      <div className="space-y-4 grow">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`flex items-end space-x-2 ${i % 2 === 0 ? 'justify-end' : ''}`}
                          >
                            {i % 2 !== 0 && (
                              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
                            )}
                            <div
                              className={`rounded-2xl animate-pulse ${i % 2 === 0 ? 'bg-indigo-200' : 'bg-gray-200'
                                }`}
                              style={{
                                height: `${32 + (i * 7) % 20}px`,
                                width: `${120 + (i * 31) % 140}px`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : msgError ? (
                      <div className="grow flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-sm">{msgError}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Date separator logic */}
                        {allMessages.map((msg, idx) => {
                          const prevMsg = allMessages[idx - 1];
                          const showDateSep =
                            !prevMsg ||
                            new Date(msg.created_at).toDateString() !==
                            new Date(prevMsg.created_at).toDateString();

                          const isOwn = msg.sender_id === user.id;
                          // Show avatar for received messages when consecutive sender changes
                          const nextMsg = allMessages[idx + 1];
                          const showAvatar =
                            !isOwn &&
                            msg.type !== 'system' &&
                            (!nextMsg || nextMsg.sender_id !== msg.sender_id || nextMsg.type === 'system');

                          return (
                            <div key={String(msg.id)}>
                              {showDateSep && (
                                <div className="flex justify-center my-4">
                                  <span className="text-[11px] text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1">
                                    {new Date(msg.created_at).toLocaleDateString('vi-VN', {
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long',
                                    })}
                                  </span>
                                </div>
                              )}
                              <MessageBubble
                                message={msg}
                                isOwn={isOwn}
                                showAvatar={showAvatar}
                                showSenderName={isGroup && !isOwn && msg.type !== 'system'}
                                onRecall={async (id) => {
                                  if (typeof id !== 'number') return;
                                  showConfirm({
                                    title: 'Thu hồi tin nhắn',
                                    message: 'Tin nhắn sẽ bị thu hồi với tất cả mọi người trong cuộc trò chuyện.',
                                    confirmLabel: 'Thu hồi',
                                    variant: 'warning',
                                    onConfirm: async () => {
                                      closeConfirmDialog();
                                      try {
                                        const res = await chatApi.recallMessage(id);
                                        handleLocalRecall(id, res.data.message);
                                      } catch { /* silently fail */ }
                                    },
                                  });
                                }}
                                onDeleteForMe={async (id) => {
                                  if (typeof id !== 'number') return;
                                  showConfirm({
                                    title: 'Xóa tin nhắn',
                                    message: 'Tin nhắn sẽ bị xóa ở phía bạn. Người khác vẫn thấy tin nhắn này.',
                                    confirmLabel: 'Xóa',
                                    variant: 'danger',
                                    onConfirm: async () => {
                                      closeConfirmDialog();
                                      try {
                                        await chatApi.deleteMessageForMe(id);
                                        handleLocalDelete(id);
                                      } catch { /* silently fail */ }
                                    },
                                  });
                                }}
                              />
                            </div>
                          );
                        })}
                        <div ref={bottomRef} />
                      </>
                    )}
                  </div>

                  {/* Input or Stranger Actions */}
                  {activeConversation.my_status === 'pending' ? (
                     <div className="py-5 px-4 bg-white border-t border-gray-200 flex flex-col items-center">
                        <p className="text-sm font-medium text-gray-700 mb-3">Người lạ này muốn nhắn tin cho bạn. Bạn có đồng ý không?</p>
                        <div className="flex space-x-3 w-full max-w-xs">
                           <button onClick={handleRejectStranger} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors">Từ chối</button>
                           <button onClick={handleAcceptStranger} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-sm">Chấp nhận</button>
                        </div>
                     </div>
                  ) : activeConversation.my_status === 'rejected' ? (
                     <div className="py-4 px-4 bg-gray-50 border-t border-gray-200 text-center">
                        <p className="text-sm font-medium text-red-500">Bạn đã từ chối nhận tin nhắn từ người này.</p>
                     </div>
                  ) : (
                    <>
                      {/* Typing indicator — shown above input */}
                      {isTyping && typingText && (
                        <div className="px-4 py-1 bg-white border-t border-gray-100">
                          <TypingIndicator text={typingText} />
                        </div>
                      )}
                      
                      {/* Upload progress */}
                      {uploadProgress !== null && (
                        <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between">
                          <span className="text-xs font-medium text-indigo-700">Đang tải tài liệu lên...</span>
                          <span className="text-xs font-bold text-indigo-700">{uploadProgress}%</span>
                          <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      )}

                      <ChatInput
                        onSend={sendMessage}
                        onSendImage={sendImageMessage}
                        onSendFile={handleSendFile}
                        onTyping={emitTyping}
                        disabled={isLoadingMsgs || uploadProgress !== null}
                      />
                    </>
                  )}

                  {/* Group info panel */}
                  {showGroupInfo && isGroup && (
                    <div className="absolute inset-y-0 right-0 w-72 z-10">
                      <GroupInfoPanel
                        conversation={activeConversation}
                        currentUser={user}
                        friends={friends}
                        isProcessing={isGroupProcessing}
                        onClose={() => setShowGroupInfo(false)}
                        onRenameGroup={handleUpdateGroup}
                        onAddMember={handleAddMember}
                        onKickMember={handleKickMember}
                      />
                    </div>
                  )}

                  {/* Resource panel — dùng cho cả DM và Group (khi không mở GroupInfoPanel) */}
                  {showResourcePanel && !showGroupInfo && (
                    <div className="absolute inset-y-0 right-0 w-72 z-10 flex flex-col bg-white border-l border-gray-200 shadow-xl">
                      {/* Panel header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                        <h3 className="font-bold text-gray-900 text-sm">Tài liệu</h3>
                        <button onClick={() => setShowResourcePanel(false)} className="text-gray-400 hover:text-gray-600 p-1">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <ResourcePanel
                          conversationId={activeConversation.id}
                          currentUser={user}
                          myRole={activeConversation.my_role ?? (activeConversation.admin_id === user.id ? 'owner' : 'member')}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Empty state */
                <div className="grow flex flex-col items-center justify-center text-center px-8 bg-gray-50">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Chào mừng đến PTIT Social</h3>
                  <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                    Chọn một cuộc trò chuyện hoặc khám phá <strong>Cộng đồng</strong> trong tab bên trái để bắt đầu.
                  </p>
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Tạo nhóm mới
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create group modal */}
      {showCreateGroup && (
        <CreateGroupModal
          friends={friends}
          isProcessing={isGroupProcessing}
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
      />
    </div>
  );
}

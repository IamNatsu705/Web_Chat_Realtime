import { useState } from 'react';
import type { Message } from '../types';
import type { User } from '../../auth/types';
import MessageStatus from './MessageStatus';
import SystemMessage from './SystemMessage';
import { getImageUrl } from '@/utils/getImageUrl';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  /** For groups: always show sender name above bubble */
  showSenderName?: boolean;
  onRecall?: (messageId: number | string) => void;
  onDeleteForMe?: (messageId: number | string) => void;
}

function Avatar({ user, size = 8 }: { user?: User; size?: number }) {
  // Use static classes — Tailwind JIT cannot detect dynamically constructed class names
  const dim = size === 8 ? 'h-8 w-8' : 'h-6 w-6';
  if (!user) {
    return (
      <div className={`${dim} rounded-full bg-indigo-100 shrink-0 flex items-center justify-center text-indigo-700 text-xs font-bold`}>
        ?
      </div>
    );
  }
  return user.avatar ? (
    <img
      src={getImageUrl(user.avatar)}
      alt={user.name}
      className={`${dim} rounded-full object-cover shrink-0 border border-gray-200`}
    />
  ) : (
    <div className={`${dim} rounded-full bg-indigo-100 shrink-0 flex items-center justify-center text-indigo-700 text-xs font-bold`}>
      {user.name?.charAt(0).toUpperCase()}
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * ImageContent — renders an image message with lightbox on click
 */
function ImageContent({ src, isOwn }: { src: string; isOwn: boolean }) {
  const [showFull, setShowFull] = useState(false);
  // If content starts with 'blob:' it's a local preview, otherwise resolve via getImageUrl
  const imageUrl = src.startsWith('blob:') ? src : getImageUrl(src);

  return (
    <>
      <img
        src={imageUrl}
        alt="Hình ảnh"
        className={`max-w-[240px] max-h-[240px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity ${isOwn ? 'shadow-sm' : 'border border-gray-200'}`}
        onClick={() => setShowFull(true)}
        onLoad={() => window.dispatchEvent(new CustomEvent('chat-image-loaded'))}
        loading="lazy"
      />
      {showFull && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowFull(false)}
        >
          <img
            src={imageUrl}
            alt="Hình ảnh"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={() => setShowFull(false)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

/**
 * FileContent — renders a document file message with download button
 */
function FileContent({ content, isOwn }: { content: string; isOwn: boolean }) {
  let fileData;
  try {
    fileData = JSON.parse(content);
    if (!fileData || typeof fileData !== 'object') throw new Error('Invalid format');
  } catch {
    return <div className="p-3 bg-red-50 text-red-500 rounded-xl text-sm">Lỗi định dạng file</div>;
  }
  
  const sizeMb = fileData.size ? (fileData.size / 1024 / 1024).toFixed(2) : '0.00';
  const fileUrl = getImageUrl(fileData.url);
  
  const icons: Record<string, string> = {
    pdf: 'text-red-600 bg-red-100',
    doc: 'text-blue-600 bg-blue-100',
    excel: 'text-green-600 bg-green-100',
    ppt: 'text-orange-600 bg-orange-100',
    archive: 'text-yellow-600 bg-yellow-100',
    image: 'text-purple-600 bg-purple-100',
    other: 'text-gray-600 bg-gray-100'
  };
  const iconClass = icons[fileData.type] || icons.other;

  return (
    <div className={`flex items-center space-x-3 p-2 pr-3 rounded-2xl min-w-[220px] max-w-[280px] shadow-sm ${isOwn ? 'bg-indigo-600/95 border border-indigo-500' : 'bg-white border border-gray-200'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/20 ${iconClass}`}>
         <span className="text-[10px] font-bold uppercase">{fileData.type === 'other' ? 'FILE' : fileData.type}</span>
      </div>
      <div className="flex-1 min-w-0">
         <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-800'}`}>{fileData.name}</p>
         <p className={`text-[11px] mt-0.5 ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>{sizeMb} MB</p>
      </div>
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full shrink-0 transition-colors ${isOwn ? 'hover:bg-indigo-500 text-indigo-100 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-indigo-600'}`} title="Tải xuống">
        <HiOutlineDocumentArrowDown className="w-5 h-5" />
      </a>
    </div>
  );
}

/**
 * MessageBubble — renders a single chat message.
 *
 * - Own messages: indigo bubble on the right + status ticks
 * - Others: white bubble on the left + sender avatar
 * - System messages: delegated to <SystemMessage>
 * - Image messages: rendered as clickable thumbnails
 */
export default function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  showSenderName = false,
  onRecall,
  onDeleteForMe,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  // System messages get centered treatment
  if (message.type === 'system') {
    return <SystemMessage content={message.content} />;
  }

  const isImage = message.type === 'image';
  const isFile = message.type === 'file';

  if (isOwn) {
    return (
      <div className="flex flex-col items-end mb-1 group relative">
        <div className="flex items-center">
          {/* Menu button */}
          {!message.is_recalled && (
            <div className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>
                </button>
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 top-6 w-36 bg-white border border-gray-200 shadow-lg rounded-lg z-20 py-1 text-sm">
                            <button onClick={() => { onRecall?.(message.id); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Thu hồi</button>
                            <button onClick={() => { onDeleteForMe?.(message.id); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500">Xóa phía tôi</button>
                        </div>
                    </>
                )}
            </div>
          )}
          {isImage && !message.is_recalled ? (
            <ImageContent src={message.content} isOwn={true} />
          ) : isFile && !message.is_recalled ? (
            <FileContent content={message.content} isOwn={true} />
          ) : (
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm transition-opacity ${message.is_optimistic ? 'opacity-70' : 'opacity-100'} ${message.is_recalled ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-indigo-600 text-white'}`}
            >
              <p className={`text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${message.is_recalled ? 'italic' : ''}`}>
                {message.is_recalled ? 'Tin nhắn đã bị thu hồi' : message.content}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center mt-0.5 space-x-1 pr-1">
          <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.created_at)}
          </span>
          <MessageStatus status={message.status} />
        </div>
      </div>
    );
  }

  // Received message
  return (
    <div className="flex items-end mb-1 space-x-2 group relative">
      {showAvatar ? (
        <Avatar user={message.sender} size={8} />
      ) : (
        <div className="w-8 shrink-0" />
      )}
      <div className="flex flex-col max-w-[70%]">
        {showSenderName && message.sender && (
          <span className="text-[11px] text-gray-500 font-medium mb-0.5 ml-1">
            {message.sender.name}
          </span>
        )}
        <div className="flex items-center">
            {isImage && !message.is_recalled ? (
              <ImageContent src={message.content} isOwn={false} />
            ) : isFile && !message.is_recalled ? (
              <FileContent content={message.content} isOwn={false} />
            ) : (
              <div className={`border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm ${message.is_recalled ? 'bg-gray-50' : 'bg-white'}`}>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${message.is_recalled ? 'italic text-gray-400' : 'text-gray-800'}`}>
                  {message.is_recalled ? 'Tin nhắn đã bị thu hồi' : message.content}
                </p>
              </div>
            )}
            {/* Menu button */}
            {!message.is_recalled && (
              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity relative">
                  <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>
                  </button>
                  {showMenu && (
                      <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                          <div className="absolute left-0 top-6 w-36 bg-white border border-gray-200 shadow-lg rounded-lg z-20 py-1 text-sm">
                              <button onClick={() => { onDeleteForMe?.(message.id); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500">Xóa phía tôi</button>
                          </div>
                      </>
                  )}
              </div>
            )}
        </div>
        <span className="text-[10px] text-gray-400 mt-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}

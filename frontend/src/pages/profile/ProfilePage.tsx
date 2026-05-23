import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../providers/AuthProvider';
import EditProfileForm from '../../features/profile/components/EditProfileForm';
import ChangePasswordForm from '../../features/profile/components/ChangePasswordForm';
import CreatePost from '@/features/post/components/CreatePost';
import PostCard from '@/features/post/components/PostCard';
import { useUserPostsQuery } from '@/features/post/hooks/queries';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { networkApi } from '../../features/network/api/networkApi';
import { useProfileActions } from '../../features/network/hooks/useProfileActions';
import { RELATIONSHIP_STATUS } from '../../features/network/constants';
import { HiOutlineChatBubbleLeftRight, HiOutlineUserPlus, HiOutlineXMark, HiOutlineCheck, HiOutlineClock, HiOutlineUserMinus } from 'react-icons/hi2';

export default function ProfilePage() {
    const { user: authUser } = useAuth();
    const { userId } = useParams<{ userId: string }>();

    const isOtherUser = userId !== undefined && userId !== String(authUser?.id);
    const targetUserId = isOtherUser ? parseInt(userId!) : authUser?.id ?? null;

    const { data: networkResp, isLoading } = useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => networkApi.getUser(parseInt(userId!)),
        enabled: isOtherUser,
    });

    const displayUser = isOtherUser ? networkResp?.data : authUser;

    // Network actions cho profile người khác
    const profileActions = useProfileActions(isOtherUser ? targetUserId : null);

    // Bài viết: dùng chung PostCard
    const { data: userPostsData, isLoading: isPostsLoading } = useUserPostsQuery(
        isOtherUser ? targetUserId : null
    );

    // Bài viết của chính mình: lấy từ feed (lọc) hoặc từ userPosts API
    const { data: myPostsData, isLoading: isMyPostsLoading } = useUserPostsQuery(
        !isOtherUser ? authUser?.id ?? null : null
    );

    const posts = isOtherUser
        ? (userPostsData?.posts ?? [])
        : (myPostsData?.posts ?? []);

    const postsLoading = isOtherUser ? isPostsLoading : isMyPostsLoading;

    // Relationship status helpers
    const networkData = networkResp?.data as { relationship_status?: string, is_sender?: boolean, friend_request_id?: number } | undefined;
    const relStatus = networkData?.relationship_status ?? 'none';
    const isSender = networkData?.is_sender;
    const friendRequestId = networkData?.friend_request_id;

    if (isOtherUser && isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow flex items-center justify-center">Đang tải...</main>
                <Footer />
            </div>
        );
    }

    if (isOtherUser && !displayUser) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow flex items-center justify-center text-gray-500">
                    Người dùng không tồn tại.
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow pt-6 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Top banner / header banner */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                        <div className="h-32 md:h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                            {/* Decorative overlay */}
                            <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-sm"></div>
                        </div>
                        <div className="px-6 pb-6 relative flex flex-col md:flex-row items-center md:items-end gap-4">
                            <div className="h-28 w-28 md:h-36 md:w-36 -mt-14 md:-mt-20 rounded-full bg-white p-1.5 shadow-lg flex-shrink-0 relative z-10 transition-transform hover:scale-105 duration-300">
                                <div className="h-full w-full rounded-full bg-indigo-50 overflow-hidden flex items-center justify-center border border-indigo-100">
                                    {displayUser?.avatar ? (
                                        <img src={displayUser.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl md:text-5xl font-bold text-indigo-400">
                                            {displayUser?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-center md:text-left md:mb-2 flex-grow z-10">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 drop-shadow-sm">{displayUser?.name}</h1>
                                {!isOtherUser && (
                                    <p className="text-gray-500 font-medium">{displayUser?.email}</p>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="md:mb-2 w-full md:w-auto flex justify-center gap-2 mt-4 md:mt-0 flex-wrap">
                                {!isOtherUser ? (
                                    <button className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm">
                                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Thêm bài viết
                                    </button>
                                ) : (
                                    <>
                                        {/* Network action buttons based on relationship */}
                                        {relStatus === 'none' && (
                                            <button
                                                onClick={profileActions.sendRequest}
                                                disabled={profileActions.isProcessing}
                                                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                                            >
                                                <HiOutlineUserPlus className="w-4 h-4 mr-2" />
                                                Kết bạn
                                            </button>
                                        )}

                                        {relStatus === RELATIONSHIP_STATUS.PENDING && isSender === true && (
                                            <button
                                                onClick={profileActions.cancelRequest}
                                                disabled={profileActions.isProcessing}
                                                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 shadow-sm disabled:opacity-50"
                                            >
                                                <HiOutlineXMark className="w-4 h-4 mr-2" />
                                                Hủy lời mời
                                            </button>
                                        )}

                                        {relStatus === RELATIONSHIP_STATUS.PENDING && isSender === false && (
                                            <>
                                                <button
                                                    onClick={() => profileActions.acceptRequest(friendRequestId)}
                                                    disabled={profileActions.isProcessing}
                                                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                                                >
                                                    <HiOutlineCheck className="w-4 h-4 mr-2" />
                                                    Chấp nhận
                                                </button>
                                                <button
                                                    onClick={() => profileActions.rejectRequest(friendRequestId)}
                                                    disabled={profileActions.isProcessing}
                                                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm disabled:opacity-50"
                                                >
                                                    <HiOutlineXMark className="w-4 h-4 mr-2" />
                                                    Từ chối
                                                </button>
                                            </>
                                        )}

                                        {relStatus === RELATIONSHIP_STATUS.PENDING && isSender === undefined && (
                                            <button
                                                disabled
                                                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gray-50 text-gray-500 border border-gray-200 shadow-sm cursor-not-allowed"
                                            >
                                                <HiOutlineClock className="w-4 h-4 mr-2" />
                                                Đang chờ
                                            </button>
                                        )}

                                        {relStatus === RELATIONSHIP_STATUS.ACCEPTED && (
                                            <button
                                                onClick={profileActions.unfriend}
                                                disabled={profileActions.isProcessing}
                                                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 shadow-sm disabled:opacity-50"
                                            >
                                                <HiOutlineUserMinus className="w-4 h-4 mr-2" />
                                                Hủy kết bạn
                                            </button>
                                        )}

                                        {/* Nhắn tin button — always visible for other users */}
                                        <button
                                            onClick={profileActions.handleMessage}
                                            disabled={profileActions.isProcessing}
                                            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            <HiOutlineChatBubbleLeftRight className="w-4 h-4 mr-2" />
                                            Nhắn tin
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Forms or User Info */}
                        <div className="col-span-1 lg:col-span-1 space-y-6">
                            {!isOtherUser && (
                                <>
                                    <EditProfileForm />
                                    <ChangePasswordForm />
                                </>
                            )}
                            {isOtherUser && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Giới thiệu</h3>
                                    <p className="text-gray-500 text-sm">Chưa có thông tin giới thiệu.</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Right Column: Feed — dùng chung PostCard */}
                        <div className="col-span-1 lg:col-span-2 space-y-4">
                            {!isOtherUser && <CreatePost />}

                            {postsLoading && (
                                <div className="text-center py-8">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                                    <p className="mt-2 text-sm text-gray-500">Đang tải bài viết...</p>
                                </div>
                            )}

                            {posts.map((post) => (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                <PostCard key={post.id} post={post as any} />
                            ))}

                            {posts.length === 0 && !postsLoading && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Chưa có bài đăng nào</h3>
                                    <p className="text-sm text-gray-500">
                                        {isOtherUser ? 'Người dùng này chưa có bài viết nào.' : 'Những bài viết bạn chia sẻ sẽ xuất hiện ở đây.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

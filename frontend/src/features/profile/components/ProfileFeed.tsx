import { useEffect, useState } from 'react';
import { profileApi } from '../api/profileApi';
import type { Post } from '../types';

export default function ProfileFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await profileApi.getMyPosts();
                setPosts(res.data.posts || []);
            } catch (err) {
                console.error("Failed to fetch posts", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-center">
                <span className="text-gray-400 font-medium">Đang tải bài viết...</span>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Chưa có bài đăng nào</h3>
                <p className="text-sm text-gray-500">Những bài viết bạn chia sẻ sẽ xuất hiện ở đây.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 px-1">Hoạt động của bạn</h3>
            {posts.map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-50">
                            {post.user?.avatar ? (
                                <img src={post.user.avatar} alt={post.user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-indigo-800 font-bold">{post.user?.name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">{post.user?.name}</h4>
                            <p className="text-xs text-gray-500">
                                {new Date(post.created_at).toLocaleDateString('vi-VN')} • Công khai
                            </p>
                        </div>
                    </div>
                    
                    <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </p>
                    
                    {post.media_url && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
                            {/* Assuming media_url is an image for now */}
                            <img src={post.media_url} alt="Post media" className="w-full h-auto object-cover max-h-96" />
                        </div>
                    )}
                    
                    <div className="border-t border-gray-50 mt-4 pt-3 flex items-center justify-between text-gray-500">
                        <div className="flex gap-4">
                            <span className="text-xs font-medium hover:text-indigo-600 cursor-pointer transition-colors">👍 Thích</span>
                            <span className="text-xs font-medium hover:text-indigo-600 cursor-pointer transition-colors">💬 Bình luận</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

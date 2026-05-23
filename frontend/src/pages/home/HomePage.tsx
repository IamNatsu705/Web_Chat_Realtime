import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import CreatePost from '@/features/post/components/CreatePost';
import PostCard from '@/features/post/components/PostCard';
import { useFeedQuery } from '@/features/post/hooks/queries';
import { HiOutlineDocumentText } from 'react-icons/hi2';

export default function HomePage() {
  const { data: feedData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeedQuery();

  const allPosts = feedData?.pages.flatMap(page => page.posts) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="grow pt-6 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-4">
          <CreatePost />

          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="mt-2 text-sm text-gray-500">Đang tải bài viết...</p>
            </div>
          )}

          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {allPosts.length === 0 && !isLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <HiOutlineDocumentText className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!</p>
            </div>
          )}

          {hasNextPage && (
            <div className="text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm bài viết'}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

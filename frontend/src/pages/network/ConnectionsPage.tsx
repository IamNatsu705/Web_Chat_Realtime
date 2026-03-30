import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import FriendCard from '../../features/network/components/FriendCard';
import { useNetwork } from '../../features/network/hooks/useNetwork';

export default function ConnectionsPage() {
  const { friends, isFriendsLoading, handleUnfriend } = useNetwork();
  const [filterQuery, setFilterQuery] = useState('');

  const filteredFriends = useMemo(() => {
    if (!filterQuery.trim()) return friends;
    const lowerQuery = filterQuery.toLowerCase();
    return friends.filter(f => 
      f.friend?.name.toLowerCase().includes(lowerQuery) || 
      f.friend?.email.toLowerCase().includes(lowerQuery)
    );
  }, [friends, filterQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="grow pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb / Back Navigation */}
          <div className="mb-6">
            <Link to="/network" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Network
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Connections</h1>
                <p className="text-sm text-gray-500 mt-1">{friends.length} connections</p>
              </div>

              {/* Local Search Filter */}
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="p-6">
              {isFriendsLoading ? (
                <div className="text-center py-12 text-gray-500">Loading your connections...</div>
              ) : friends.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No connections yet</h3>
                  <p className="mt-1 text-gray-500">Search for people to build your network.</p>
                  <Link to="/network" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    Find People
                  </Link>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No connections found matching "{filterQuery}"
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredFriends.map(friendship => (
                    <FriendCard
                      key={friendship.id}
                      friendship={friendship}
                      onUnfriend={handleUnfriend}
                    />
                  ))}
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

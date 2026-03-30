import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import UserCard from '../../features/network/components/UserCard';
import RequestCard from '../../features/network/components/RequestCard';
import FriendCard from '../../features/network/components/FriendCard';
import { useNetwork } from '../../features/network/hooks/useNetwork';
import { NETWORK_UI_CONSTANTS } from '../../features/network/constants';
import { Link } from 'react-router-dom';

export default function NetworkPage() {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    processingUserIds,
    requests,
    isRequestsLoading,
    friends,
    isFriendsLoading,
    handleAddFriend,
    handleCancelRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleUnfriend,
  } = useNetwork();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="grow pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Left Sidebar - Manage Network & Friends List */}
            <div className="lg:col-span-1 space-y-6">

              {/* Friends List Widget */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-base font-bold text-gray-900">Connections</h2>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {friends.length}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {isFriendsLoading ? (
                    <div className="text-center py-4 text-sm text-gray-500">Loading connections...</div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-6">
                      <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">No connections yet.</p>
                    </div>
                  ) : (
                    <>
                      {friends.slice(0, NETWORK_UI_CONSTANTS.MAX_SIDEBAR_FRIENDS).map(friendship => (
                        <FriendCard
                          key={friendship.id}
                          friendship={friendship}
                          onUnfriend={handleUnfriend}
                        />
                      ))}
                      {friends.length > NETWORK_UI_CONSTANTS.MAX_SIDEBAR_FRIENDS && (
                        <Link to="/network/connections" className="block mt-4 pt-4 border-t border-gray-100 italic text-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                          View all {friends.length} connections
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Main Area - Invitations & Search */}
            <div className="lg:col-span-3 space-y-6">

              {/* Search Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="relative flex items-center w-full h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden border border-gray-300 transition-shadow">
                  <div className="grid place-items-center h-full w-12 text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <input
                    className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                    type="text"
                    id="search"
                    placeholder="Search people by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Search Results Display */}
                {searchQuery && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Search Results</h3>
                    {isSearching ? (
                      <div className="text-center py-8 text-gray-500">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {searchResults.map(user => (
                          <UserCard
                            key={user.id}
                            user={user}
                            onAddFriend={handleAddFriend}
                            onCancelRequest={handleCancelRequest}
                            onAcceptRequest={(reqId) => handleAcceptRequest(reqId, user.id)}
                            onRejectRequest={(reqId) => handleRejectRequest(reqId, user.id)}
                            onUnfriend={handleUnfriend}
                            isProcessing={processingUserIds.includes(user.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        No users found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Invitations Section */}
              {!searchQuery && (requests.length > 0 || isRequestsLoading) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-base font-bold text-gray-900">Invitations</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {isRequestsLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">Loading invitations...</div>
                    ) : (
                      requests.map((request) => (
                        <RequestCard
                          key={request.id}
                          request={request}
                          onAccept={handleAcceptRequest}
                          onReject={handleRejectRequest}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Find More People (Only shown if not searching) */}
              {!searchQuery && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Grow your network</h2>
                  <p className="text-gray-500 max-w-md">Search for people you know using the search bar above to connect and start chatting.</p>
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

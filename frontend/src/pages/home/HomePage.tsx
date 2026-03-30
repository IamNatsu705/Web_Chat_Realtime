import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../providers/AuthProvider';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-grow pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Left Sidebar - Profile & Navigation */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="px-4 pb-4 relative text-center">
                  <div className="h-16 w-16 mx-auto -mt-8 rounded-full bg-white p-1">
                    <div className="h-full w-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold text-xl">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-3">
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-500 font-medium">Connections</span>
                    <span className="text-indigo-600 font-bold">142</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hidden md:block">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Chats</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                       <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                       <div className="overflow-hidden">
                         <p className="text-sm font-medium text-gray-900 truncate">Jane Doe {i}</p>
                         <p className="text-xs text-gray-500 truncate">Hey, are we still on for...</p>
                       </div>
                    </div>
                  ))}
                  <button className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors w-full text-left pt-2">
                    View all messages
                  </button>
                </div>
              </div>
            </div>

            {/* Main Feed / Content Area */}
            <div className="md:col-span-2 space-y-6">
              {/* Post Creation Box */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-800 font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <button className="flex-grow bg-white border border-gray-300 text-left px-4 py-3 rounded-full text-gray-500 font-medium hover:bg-gray-50 transition-colors">
                    Start a conversation...
                  </button>
                </div>
                <div className="flex justify-between mt-4 px-2">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                    <span className="text-sm font-medium">Photo</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    <span className="text-sm font-medium">Video</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                    <span className="text-sm font-medium">Event</span>
                  </button>
                </div>
              </div>

              {/* Sample Feed Item */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">System Admin</h4>
                    <p className="text-xs text-gray-500">1h • Public</p>
                  </div>
                </div>
                <p className="text-gray-800 mb-4">
                  Welcome to Chatify! This is your new dashboard. The authentication flow is fully functional and secure. You can now chat in real-time, connect with colleagues, and share updates. 🚀
                </p>
                <div className="h-64 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 font-medium">[Image Placeholder]</span>
                </div>
                <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between px-4">
                  <button className="text-gray-500 hover:text-indigo-600 font-medium text-sm flex items-center space-x-1 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                    <span>Like</span>
                  </button>
                  <button className="text-gray-500 hover:text-indigo-600 font-medium text-sm flex items-center space-x-1 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <span>Comment</span>
                  </button>
                  <button className="text-gray-500 hover:text-indigo-600 font-medium text-sm flex items-center space-x-1 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Suggestions/News */}
            <div className="md:col-span-1 space-y-6 hidden md:block">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Chatify News</h3>
                <ul className="space-y-3">
                  <li className="text-sm">
                    <p className="font-bold text-gray-800 hover:text-indigo-600 cursor-pointer">Real-time chats enabled</p>
                    <p className="text-xs text-gray-500">Top news • 10,432 readers</p>
                  </li>
                  <li className="text-sm">
                    <p className="font-bold text-gray-800 hover:text-indigo-600 cursor-pointer">Security updates shipped</p>
                    <p className="text-xs text-gray-500">1d ago • 5,214 readers</p>
                  </li>
                  <li className="text-sm">
                    <p className="font-bold text-gray-800 hover:text-indigo-600 cursor-pointer">New UI released</p>
                    <p className="text-xs text-gray-500">2d ago • 14,098 readers</p>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-xs text-gray-500 text-center mb-2 font-medium uppercase tracking-wider">Ad</p>
                <div className="text-center">
                  <p className="text-sm text-gray-800 font-medium mb-3">Get Premium to see who viewed your profile</p>
                  <div className="flex justify-center flex-row space-x-2 items-center mb-4">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold border border-indigo-200">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                    </div>
                  </div>
                  <button className="w-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-medium py-1.5 px-4 rounded-full transition-colors text-sm">
                    Try Premium for free
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap text-xs text-gray-500 justify-center gap-x-4 gap-y-2">
                <a href="#" className="hover:text-indigo-600 hover:underline">About</a>
                <a href="#" className="hover:text-indigo-600 hover:underline">Accessibility</a>
                <a href="#" className="hover:text-indigo-600 hover:underline">Help Center</a>
                <a href="#" className="hover:text-indigo-600 hover:underline">Privacy & Terms</a>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

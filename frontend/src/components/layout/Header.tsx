import { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import { networkApi } from '../../features/network/api/networkApi';

export default function Header() {
  const { user, logout } = useAuth();
  const [requestCount, setRequestCount] = useState(0);

  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    if (user) {
      const fetchRequests = async () => {
        try {
          const res = await networkApi.getFriendRequests();
          setRequestCount(res.data.length);
        } catch (error) {
          console.error("Failed to fetch friend requests", error);
        }
      };
      // Fetch immediately
      fetchRequests();
      // Optionally could poll or rely on real-time sockets
      // const interval = setInterval(fetchRequests, 30000);
      // return () => clearInterval(interval);
    }
  }, [user]);

  const navLinkClass = (path: string) => {
    return isActive(path)
      ? "border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
                Chatify
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={navLinkClass("/")}>
                Home
              </Link>
              <Link to="/messages" className={navLinkClass("/messages")}>
                Messages
              </Link>
              <Link to="/network" className={`${navLinkClass("/network")} relative`}>
                My Network
                {requestCount > 0 && (
                  <span className="absolute top-2 -right-4 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                    {requestCount > 99 ? '99+' : requestCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-sm font-medium text-gray-700 hidden md:block">
                  {user.name}
                </Link>
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold border border-indigo-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="ml-4 px-3 py-1.5 border border-transparent text-sm font-medium rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Sign In
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

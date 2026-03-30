import type { Friendship } from '../types';
import { Link } from 'react-router-dom';

interface FriendCardProps {
  friendship: Friendship;
  onUnfriend: (friendId: number) => void;
  isProcessing?: boolean;
}

export default function FriendCard({ friendship, onUnfriend, isProcessing = false }: FriendCardProps) {
  const friend = friendship.friend;
  if (!friend) return null;

  const getAvatarLetter = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:shadow-sm hover:border-gray-200 transition-all bg-white group">
      <div className="flex items-center space-x-4">
        {friend.avatar ? (
          <img src={friend.avatar} alt={friend.name} className="h-12 w-12 rounded-full object-cover border border-indigo-100" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">
            {getAvatarLetter(friend.name)}
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{friend.name}</h3>
          <p className="text-xs text-gray-500">{friend.email}</p>
        </div>
      </div>

      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          to={`/messages`} // Link to specific chat if possible, or just messages
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          title="Message"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </Link>
        <button
          onClick={() => onUnfriend(friend.id)}
          disabled={isProcessing}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
          title="Remove Connection"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

import type { FriendRequest } from '../types';
import { USER_CARD_TEXTS } from '../constants';

interface RequestCardProps {
  request: FriendRequest;
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
  isProcessing?: boolean;
}

export default function RequestCard({ request, onAccept, onReject, isProcessing = false }: RequestCardProps) {
  const sender = request.sender;
  if (!sender) return null;

  const getAvatarLetter = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-4 cursor-pointer">
        {sender.avatar ? (
          <img src={sender.avatar} alt={sender.name} className="h-16 w-16 rounded-full shrink-0 object-cover border border-indigo-200" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-indigo-100 shrink-0 flex items-center justify-center text-indigo-800 text-xl font-bold border border-indigo-200">
            {getAvatarLetter(sender.name)}
          </div>
        )}
        <div>
          <h3 className="text-base font-bold text-gray-900 hover:text-indigo-600">{sender.name}</h3>
          <p className="text-sm text-gray-500">{sender.email}</p>
          <p className="text-xs text-gray-400 mt-1 flex items-center">
            Sent you a friend request
          </p>
        </div>
      </div>
      <div className="flex space-x-2 w-full sm:w-auto">
        <button
          onClick={() => onReject(request.id)}
          disabled={isProcessing}
          className="flex-1 sm:flex-none px-4 py-1.5 border border-gray-500 text-gray-600 font-medium rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {USER_CARD_TEXTS.REJECT}
        </button>
        <button
          onClick={() => onAccept(request.id)}
          disabled={isProcessing}
          className="flex-1 sm:flex-none px-4 py-1.5 border border-transparent text-white font-medium rounded-full bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          {USER_CARD_TEXTS.ACCEPT}
        </button>
      </div>
    </div>
  );
}

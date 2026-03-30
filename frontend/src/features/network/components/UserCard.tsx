import type { NetworkUser } from '../types';
import { RELATIONSHIP_STATUS, USER_CARD_TEXTS } from '../constants';

interface UserCardProps {
  user: NetworkUser;
  onAddFriend: (userId: number) => void;
  onCancelRequest?: (userId: number) => void;
  onAcceptRequest?: (requestId: number) => void;
  onRejectRequest?: (requestId: number) => void;
  onUnfriend?: (userId: number) => void;
  isProcessing?: boolean;
}

export default function UserCard({ 
  user, 
  onAddFriend, 
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
  onUnfriend,
  isProcessing = false 
}: UserCardProps) {
  const getAvatarLetter = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white flex flex-col relative group">
      <div className="h-16 bg-gradient-to-r rounded-t-xl from-indigo-100 to-indigo-200 w-full relative"></div>

      <div className="flex flex-col items-center px-4 -mt-10 pb-4 flex-grow">
        <div className="h-20 w-20 rounded-full relative z-10 bg-white p-1 mb-2">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover border border-indigo-100 shadow-sm" />
          ) : (
            <div className="h-full w-full rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 text-2xl font-bold border border-indigo-100 shadow-sm">
              {getAvatarLetter(user.name)}
            </div>
          )}
        </div>

        <h3 className="text-base font-bold text-gray-900 text-center hover:underline cursor-pointer">{user.name}</h3>
        <p className="text-xs text-gray-500 text-center mb-4 line-clamp-1">{user.email}</p>

        <div className="mt-auto w-full">
          {user.relationship_status === 'none' && (
            <button
              onClick={() => onAddFriend(user.id)}
              disabled={isProcessing}
              className="w-full py-1.5 border border-indigo-600 text-indigo-600 font-medium rounded-full hover:bg-indigo-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {isProcessing ? USER_CARD_TEXTS.PROCESSING : USER_CARD_TEXTS.ADD_FRIEND}
            </button>
          )}

          {user.relationship_status === RELATIONSHIP_STATUS.PENDING && user.is_sender === true && (
            <button
              onClick={() => onCancelRequest?.(user.id)}
              disabled={isProcessing}
              className="w-full py-1.5 border border-red-400 text-red-500 font-medium rounded-full hover:bg-red-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {isProcessing ? USER_CARD_TEXTS.PROCESSING : USER_CARD_TEXTS.CANCEL_REQUEST}
            </button>
          )}

          {user.relationship_status === RELATIONSHIP_STATUS.PENDING && user.is_sender === false && (
            <div className="flex space-x-2 w-full">
              <button
                onClick={() => onRejectRequest?.(user.friend_request_id!)}
                disabled={isProcessing}
                className="flex-1 py-1.5 border border-gray-400 text-gray-500 font-medium rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {USER_CARD_TEXTS.REJECT}
              </button>
              <button
                onClick={() => onAcceptRequest?.(user.friend_request_id!)}
                disabled={isProcessing}
                className="flex-1 py-1.5 border border-indigo-600 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {USER_CARD_TEXTS.ACCEPT}
              </button>
            </div>
          )}

          {user.relationship_status === RELATIONSHIP_STATUS.PENDING && user.is_sender === undefined && (
             <button
              disabled
              className="w-full py-1.5 border border-gray-400 text-gray-500 font-medium rounded-full bg-gray-50 flex items-center justify-center cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {USER_CARD_TEXTS.PENDING}
            </button>
          )}

          {user.relationship_status === RELATIONSHIP_STATUS.ACCEPTED && (
            <button
              onClick={() => onUnfriend?.(user.id)}
              disabled={isProcessing}
              className="w-full py-1.5 border border-red-200 text-red-500 font-medium rounded-full hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group-hover:text-red-600"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
              </svg>
              {isProcessing ? USER_CARD_TEXTS.PROCESSING : USER_CARD_TEXTS.UNFRIEND}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

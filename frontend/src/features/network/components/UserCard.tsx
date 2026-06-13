import { Link } from 'react-router-dom';
import type { NetworkUser } from '../types';
import { RELATIONSHIP_STATUS, USER_CARD_TEXTS } from '../constants';
import { usePresence } from '../../chat/hooks/usePresence';

interface UserCardProps {
  user: NetworkUser & { mutual_friends_count?: number };
  onAddFriend: (userId: number) => void;
  onMessage?: (userId: number) => void;
  onCancelRequest?: (userId: number) => void;
  onAcceptRequest?: (requestId: number) => void;
  onRejectRequest?: (requestId: number) => void;
  onUnfriend?: (userId: number) => void;
  isProcessing?: boolean;
}

export default function UserCard({ 
  user, 
  onAddFriend, 
  onMessage,
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
  onUnfriend,
  isProcessing = false 
}: UserCardProps) {
  const getAvatarLetter = (name: string) => name ? name.charAt(0).toUpperCase() : '?';
  const { isOnline } = usePresence();
  const userIsOnline = isOnline(user.id);

  return (
    <div className="border border-gray-200 rounded-xl hover:shadow-md transition-all bg-white flex flex-col relative group overflow-hidden">
      {/* Banner nền văn bản */}
      <div className="h-14 bg-[#FFF1F2] rounded-t-xl w-full relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#D70038 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-[28px] font-black text-[#D70038]/15 whitespace-nowrap select-none rotate-[-5deg] tracking-tighter">
            I LOVE PTIT I LOVE PTIT
          </h1>
        </div>
      </div>

      <div className="flex flex-col items-center px-4 -mt-9 pb-4 flex-grow">
        <Link to={`/profile/${user.id}`} className="h-[72px] w-[72px] rounded-full relative z-10 bg-white p-1 mb-2 hover:opacity-90 transition-opacity">
          {user.avatar ? (
             <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover border border-red-100 shadow-sm" />
          ) : (
            <div className="h-full w-full rounded-full bg-red-50 flex items-center justify-center text-[#D70038] text-xl font-bold border border-red-100 shadow-sm">
              {getAvatarLetter(user.name)}
            </div>
          )}
          {/* Chấm chỉ báo online */}
          <span className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white transition-colors ${
            userIsOnline ? 'bg-green-500' : 'bg-gray-300'
          }`} />
        </Link>

        <Link to={`/profile/${user.id}`} className="text-sm font-bold text-gray-900 text-center hover:underline hover:text-[#D70038] truncate max-w-full">
          {user.name}
        </Link>
        
        <div className="mb-4">
           {user.mutual_friends_count !== undefined && (
             <div className="flex items-center mt-1">
               <svg className="w-3.5 h-3.5 text-[#D70038] mr-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                   d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
               <span className="text-xs text-[#D70038] font-bold">
                 {user.mutual_friends_count} bạn chung
               </span>
             </div>
           )}
        </div>

        <div className="mt-auto w-full space-y-2">
          {user.relationship_status === 'none' && (
            <button
              onClick={() => onAddFriend(user.id)}
              disabled={isProcessing}
              className="w-full py-2 bg-[#D70038] text-white font-bold rounded-full hover:bg-[#990028] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {isProcessing ? USER_CARD_TEXTS.PROCESSING : USER_CARD_TEXTS.ADD_FRIEND}
            </button>
          )}

          {user.relationship_status === RELATIONSHIP_STATUS.PENDING && user.is_sender === true && (
            <button
              onClick={() => onCancelRequest?.(user.id)}
              disabled={isProcessing}
              className="w-full py-2 border border-red-400 text-red-500 font-bold rounded-full hover:bg-red-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="flex-1 py-2 border border-gray-400 text-gray-500 font-bold rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {USER_CARD_TEXTS.REJECT}
              </button>
              <button
                onClick={() => onAcceptRequest?.(user.friend_request_id!)}
                disabled={isProcessing}
                className="flex-1 py-2 bg-[#D70038] text-white font-bold rounded-full hover:bg-[#990028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
              >
                {USER_CARD_TEXTS.ACCEPT}
              </button>
            </div>
          )}

          {user.relationship_status === RELATIONSHIP_STATUS.PENDING && user.is_sender === undefined && (
             <button
              disabled
              className="w-full py-2 border border-gray-400 text-gray-500 font-bold rounded-full bg-gray-50 flex items-center justify-center cursor-not-allowed text-sm"
            >
              <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {USER_CARD_TEXTS.PENDING}
            </button>
          )}

          {user.relationship_status === RELATIONSHIP_STATUS.ACCEPTED && (
            <div className="flex space-x-2 w-full">
              <button
                onClick={() => onMessage?.(user.id)}
                disabled={isProcessing}
                className="flex-[2] py-2 border border-[#D70038] text-[#D70038] font-bold rounded-full hover:bg-red-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm group-hover:bg-[#D70038] group-hover:text-white"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Nhắn tin
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn hủy kết bạn với người này?')) {
                    onUnfriend?.(user.id);
                  }
                }}
                disabled={isProcessing}
                className="flex-1 py-2 border border-red-200 text-red-500 font-bold rounded-full hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm group-hover:text-red-600"
                title="Hủy kết bạn"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

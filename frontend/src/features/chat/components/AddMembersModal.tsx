import type { Friendship } from '../../network/types';

interface AddMembersModalProps {
  /** All friends of the admin */
  friends: Friendship[];
  /** Currently existing member IDs to exclude */
  existingMemberIds: number[];
  isProcessing: boolean;
  onClose: () => void;
  onAdd: (userId: number) => void;
}

/**
 * AddMembersModal — lets the group admin pick a friend (not already in the group)
 * and add them.
 */
export default function AddMembersModal({
  friends,
  existingMemberIds,
  isProcessing,
  onClose,
  onAdd,
}: AddMembersModalProps) {
  const eligible = friends.filter(
    (f) => f.friend && !existingMemberIds.includes(f.friend.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Thêm thành viên</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="grow overflow-y-auto">
          {eligible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm px-4 text-center">
              <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Tất cả bạn bè đã trong nhóm rồi
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {eligible.map(({ friend }) => {
                if (!friend) return null;
                return (
                  <li key={friend.id} className="flex items-center px-5 py-3 hover:bg-gray-50">
                    {friend.avatar ? (
                      <img src={friend.avatar} alt={friend.name}
                        className="h-9 w-9 rounded-full object-cover mr-3 shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3 shrink-0">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="grow text-sm text-gray-800">{friend.name}</span>
                    <button
                      onClick={() => onAdd(friend.id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Thêm
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

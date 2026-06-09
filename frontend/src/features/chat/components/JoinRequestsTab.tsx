import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../api/communityApi';

import { HiCheck, HiXMark } from 'react-icons/hi2';
import { getImageUrl } from '@/utils/getImageUrl';

interface JoinRequestsTabProps {
  conversationId: number;
}

export default function JoinRequestsTab({ conversationId }: JoinRequestsTabProps) {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['group-requests', conversationId],
    queryFn: () => communityApi.getJoinRequests(conversationId),
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, action }: { requestId: number; action: 'approve' | 'reject' }) =>
      communityApi.respondToJoinRequest(conversationId, requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-requests', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] }); // Refresh members
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        Không có yêu cầu tham gia nào.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-grow px-3 py-2">
      <h5 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Đang chờ duyệt</h5>
      <ul className="space-y-1">
        {requests.map((req) => (
          <li key={req.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
            <div className="flex items-center min-w-0">
              {req.user?.avatar ? (
                <img
                  src={getImageUrl(req.user.avatar)}
                  alt={req.user.name}
                  className="h-8 w-8 rounded-full object-cover mr-2 shrink-0 border border-gray-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold mr-2 shrink-0">
                  {req.user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 pr-2">
                <p className="text-sm font-medium text-gray-900 truncate">{req.user?.name}</p>
                <p className="text-[10px] text-gray-400 truncate">
                  {new Date(req.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={() => respondMutation.mutate({ requestId: req.id, action: 'approve' })}
                disabled={respondMutation.isPending}
                className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                title="Chấp thuận"
              >
                <HiCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => respondMutation.mutate({ requestId: req.id, action: 'reject' })}
                disabled={respondMutation.isPending}
                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                title="Từ chối"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

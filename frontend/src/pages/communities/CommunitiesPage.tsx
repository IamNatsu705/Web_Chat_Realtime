import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { communityApi } from '@/features/chat/api/communityApi';
import { useAuth } from '@/providers/AuthProvider';
import type { Conversation, CommunityCategory } from '@/features/chat/types';
import { HiOutlineMagnifyingGlass, HiOutlineUserGroup, HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineInformationCircle } from 'react-icons/hi2';
import { useDebounce } from '@/hooks/useDebounce';

// Label tiếng Việt cho từng danh mục cộng đồng
const CATEGORY_LABELS: Record<string, string> = {
  all: 'Tất cả',
  subject: 'Môn học',
  department: 'Chuyên ngành',
  project: 'Đồ án',
  research: 'NCKH',
  club: 'CLB',
  other: 'Khác',
};

export default function CommunitiesPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['communities', debouncedSearch, categoryFilter],
    queryFn: () => communityApi.getCommunities(
      debouncedSearch || undefined,
      categoryFilter !== 'all' ? categoryFilter : undefined
    ),
  });

  const joinMutation = useMutation({
    mutationFn: (groupId: number) => communityApi.joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (groupId: number) => communityApi.cancelJoinRequest(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });

  const [selectedCommunity, setSelectedCommunity] = useState<Conversation | null>(null);

  const communities = data?.communities ?? [];
  const totalCommunities = data?.pagination?.total ?? communities.length;

  // Kiểm tra trạng thái tham gia của user
  const getJoinStatus = (community: Conversation) => {
    if (!user) return 'none';
    if (community.my_status === 'active') return 'joined';
    return 'none';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-[#111827]">
      <Header />

      <main className="grow pb-20">
        {/* 1. HERO - Modern PTIT Themed */}
        <div className="bg-gradient-to-br from-[#FFF5F6] via-white to-[#FFF5F6] border-b border-[#FEE2E2]">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF1F2] border border-[#FECDD3] text-[#D70038] text-[13px] font-semibold mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#D70038] animate-pulse"></span>
                PTIT Social Hub
              </div>
              <h1 className="text-[36px] sm:text-[48px] leading-[1.15] font-extrabold tracking-tight text-[#111827] mb-4">
                Khám phá cộng đồng <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D70038] to-[#990028]">PTIT</span>
              </h1>
              <p className="text-[17px] text-[#4B5563] font-medium leading-relaxed mb-8 max-w-[540px]">
                Nơi sinh viên Bưu chính Viễn thông kết nối, chia sẻ kiến thức, cùng nhau học tập, nghiên cứu khoa học và phát triển dự án.
              </p>

              {/* Search Wrapper with Glassmorphism */}
              <div className="relative group max-w-[600px] shadow-[0_8px_30px_rgb(215,0,56,0.08)] rounded-2xl bg-white/80 backdrop-blur-md border border-[#FECDD3]/50 p-2 transition-all hover:shadow-[0_8px_30px_rgb(215,0,56,0.12)]">
                <HiOutlineMagnifyingGlass className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D70038] w-6 h-6 transition-transform group-focus-within:scale-110" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhóm học tập, câu lạc bộ, dự án..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 bg-transparent outline-none text-[16px] text-[#111827] placeholder:text-[#9CA3AF] rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-[20px] font-bold text-[#111827]">
              Danh sách cộng đồng
            </h2>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-[#F3F4F6]">
              <div className="text-[14px] text-[#6B7280] font-medium">
                Hiện có <strong className="text-[#D70038] text-[16px]">{totalCommunities}</strong> cộng đồng đang hoạt động
              </div>
            </div>
          </div>

          {/* 2. FILTERS - Modern Tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-300 shrink-0 ${
                  categoryFilter === key
                    ? 'bg-[#D70038] text-white shadow-[0_4px_12px_rgba(215,0,56,0.25)] scale-[1.02]'
                    : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-[#D70038]/30 hover:bg-[#FFF5F6] hover:text-[#D70038]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-[#D70038]"></div>
            </div>
          )}

          {/* 3. GRID - Card Grid */}
          {!isLoading && communities.length > 0 && (
            <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
              {communities.map((community) => {
                const joinStatus = getJoinStatus(community);
                
                return (
                  <div
                    key={community.id}
                    onClick={() => setSelectedCommunity(community)}
                    className="group flex flex-col justify-between bg-white border border-[#F3F4F6] rounded-[16px] p-6 shadow-sm hover:shadow-[0_12px_32px_rgb(215,0,56,0.12)] hover:border-[#FECDD3] hover:-translate-y-1 transition-all duration-300 cursor-pointer h-[250px] relative overflow-hidden"
                  >
                    {/* Decorative gradient blob on hover */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10">
                      {/* Top Row: Avatar + Title + Meta */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFF5F6] to-[#FFF1F2] text-[#D70038] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#FFE4E6] shadow-[0_2px_8px_rgba(215,0,56,0.08)]">
                          {community.avatar ? (
                            <img src={community.avatar} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <HiOutlineUserGroup className="w-7 h-7" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h3 className="font-bold text-[18px] text-[#111827] truncate pr-2 group-hover:text-[#D70038] transition-colors leading-tight mb-1.5">
                            {community.name}
                          </h3>
                          <div className="flex items-center gap-3 text-[13px] text-[#6B7280] font-medium">
                            <span className="flex items-center gap-1.5 bg-[#F9FAFB] px-2 py-0.5 rounded-md border border-[#F3F4F6]">
                              <HiOutlineUserGroup className="w-4 h-4 text-[#9CA3AF]" />
                              {community.member_count ?? 0}
                            </span>
                            <span className="flex items-center gap-1 bg-[#F9FAFB] px-2 py-0.5 rounded-md border border-[#F3F4F6]" title={community.join_type === 'open' ? 'Công khai' : 'Riêng tư'}>
                              {community.join_type === 'open' ? (
                                <HiOutlineLockOpen className="w-3.5 h-3.5 text-[#10B981]" />
                              ) : (
                                <HiOutlineLockClosed className="w-3.5 h-3.5 text-[#F59E0B]" />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Description (Max 2 lines) */}
                      <p className="text-[14.5px] text-[#4B5563] line-clamp-2 leading-relaxed">
                        {community.description || <span className="italic text-[#9CA3AF]">Chưa có giới thiệu.</span>}
                      </p>
                    </div>

                    {/* Bottom: Tag & CTA Button */}
                    <div className="relative z-10 flex items-center justify-between pt-4 mt-2 border-t border-[#F3F4F6]">
                      <span className="text-[12px] font-bold text-[#D70038] bg-[#FFF1F2] px-3 py-1.5 rounded-lg truncate max-w-[120px] uppercase tracking-wide">
                        {CATEGORY_LABELS[community.category || 'other'] ?? community.category}
                      </span>
                      
                      <div onClick={(e) => e.stopPropagation()}>
                        {joinStatus === 'joined' ? (
                          <button
                            onClick={() => navigate(`/messages?conversationId=${community.id}`)}
                            className="px-4 py-2 text-[14px] font-semibold text-[#111827] bg-white border-2 border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] hover:border-[#D70038] hover:text-[#D70038] transition-all"
                          >
                            Vào nhóm
                          </button>
                        ) : community.my_join_request_status === 'pending' ? (
                          <button
                            onClick={() => {
                              if (window.confirm('Hủy yêu cầu tham gia?')) cancelMutation.mutate(community.id);
                            }}
                            disabled={cancelMutation.isPending}
                            className="px-4 py-2 text-[14px] font-semibold text-[#D70038] bg-[#FFF1F2] border border-[#FECDD3] rounded-xl hover:bg-[#FFE4E6] transition-all"
                          >
                            Đang chờ duyệt
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              joinMutation.mutate(community.id, {
                                onSuccess: () => {
                                  if (community.join_type === 'open') navigate(`/messages?conversationId=${community.id}`);
                                }
                              });
                            }}
                            disabled={joinMutation.isPending}
                            className="px-5 py-2 text-[14px] font-semibold text-white bg-gradient-to-r from-[#D70038] to-[#E6003C] rounded-xl hover:shadow-[0_4px_12px_rgba(215,0,56,0.3)] transition-all disabled:opacity-50"
                          >
                            Tham gia
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && communities.length === 0 && (
            <div className="text-center py-20 bg-transparent">
              <HiOutlineUserGroup className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
              <h3 className="text-[16px] font-semibold text-[#111827] mb-1">Không tìm thấy nhóm</h3>
              <p className="text-[14px] text-[#6B7280]">
                Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* 4. MODAL - Modern Overlay */}
      {selectedCommunity && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/60 backdrop-blur-md"
          onClick={() => setSelectedCommunity(null)}
        >
          <div 
            className="bg-white rounded-[24px] shadow-[0_24px_48px_rgba(0,0,0,0.2)] w-full max-w-[420px] overflow-hidden flex flex-col transform transition-all scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with red top bar */}
            <div className="h-2 bg-gradient-to-r from-[#D70038] to-[#990028] w-full"></div>
            
            <div className="p-7">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#FFF5F6] to-[#FFF1F2] text-[#D70038] flex items-center justify-center border border-[#FFE4E6] shadow-sm overflow-hidden shrink-0">
                    {selectedCommunity.avatar ? (
                      <img src={selectedCommunity.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <HiOutlineUserGroup className="w-8 h-8 text-[#D70038]" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-[22px] font-extrabold text-[#111827] leading-tight mb-1">{selectedCommunity.name}</h2>
                    <div className="text-[14px] text-[#6B7280] font-medium flex items-center gap-1.5">
                      <HiOutlineUserGroup className="w-4 h-4" />
                      {selectedCommunity.member_count ?? 0} thành viên
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCommunity(null)}
                  className="p-2 text-[#9CA3AF] hover:text-[#D70038] hover:bg-[#FFF1F2] rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#F9FAFB] p-3.5 rounded-2xl border border-[#F3F4F6]">
                  <div className="text-[12px] text-[#6B7280] font-semibold uppercase tracking-wider mb-1">Loại nhóm</div>
                  <div className="text-[15px] font-bold text-[#111827] flex items-center gap-1.5">
                    {selectedCommunity.join_type === 'open' ? (
                      <><HiOutlineLockOpen className="w-4 h-4 text-[#10B981]" /> Công khai</>
                    ) : (
                      <><HiOutlineLockClosed className="w-4 h-4 text-[#F59E0B]" /> Riêng tư</>
                    )}
                  </div>
                </div>
                <div className="bg-[#F9FAFB] p-3.5 rounded-2xl border border-[#F3F4F6]">
                  <div className="text-[12px] text-[#6B7280] font-semibold uppercase tracking-wider mb-1">Thành lập</div>
                  <div className="text-[15px] font-bold text-[#111827]">
                    {new Date(selectedCommunity.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Desc */}
              <div className="mb-2">
                <h3 className="text-[13px] font-bold text-[#D70038] uppercase tracking-wider mb-2">Giới thiệu</h3>
                <p className="text-[15px] text-[#4B5563] leading-relaxed bg-[#F9FAFB] p-4 rounded-2xl border border-[#F3F4F6]">
                  {selectedCommunity.description || <span className="italic text-[#9CA3AF]">Chưa có mô tả chi tiết.</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

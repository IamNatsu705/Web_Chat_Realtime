import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceApi } from '../api/resourceApi';
import type { GroupResource } from '../types';
import type { User } from '../../auth/types';

interface ResourcePanelProps {
  conversationId: number;
  currentUser: User;
  /** Quyền của user trong conversation: owner/moderator có thể ghim/xóa của người khác */
  myRole?: 'owner' | 'moderator' | 'member' | null;
}

// ── Helper: icon theo loại file ────────────────────────────────────────────────
function FileTypeIcon({ type }: { type: string }) {
  const icons: Record<string, { bg: string; text: string; label: string }> = {
    pdf:     { bg: 'bg-red-100',    text: 'text-red-600',    label: 'PDF' },
    doc:     { bg: 'bg-blue-100',   text: 'text-blue-600',   label: 'DOC' },
    excel:   { bg: 'bg-green-100',  text: 'text-green-600',  label: 'XLS' },
    ppt:     { bg: 'bg-orange-100', text: 'text-orange-600', label: 'PPT' },
    image:   { bg: 'bg-purple-100', text: 'text-purple-600', label: 'IMG' },
    archive: { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'ZIP' },
    other:   { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'FILE' },
  };
  const cfg = icons[type] ?? icons.other;
  return (
    <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
      <span className={`text-[10px] font-bold ${cfg.text}`}>{cfg.label}</span>
    </div>
  );
}

// ── Helper: format bytes ────────────────────────────────────────────────────────
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Danh mục tài liệu ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: '',         label: 'Tất cả' },
  { value: 'exam',     label: 'Đề thi' },
  { value: 'lecture',  label: 'Bài giảng' },
  { value: 'exercise', label: 'Bài tập' },
  { value: 'note',     label: 'Ghi chú' },
  { value: 'other',    label: 'Khác' },
];

function getCategoryLabel(val: string) {
  return CATEGORIES.find(c => c.value === val)?.label || 'Khác';
}

/**
 * ResourcePanel — panel tài liệu tích hợp vào mọi loại chat.
 * Tính năng: xem/upload/download/xóa/ghim tài liệu.
 * Upload sử dụng progress tracking để tránh UX lag.
 */
export default function ResourcePanel({ conversationId, currentUser, myRole }: ResourcePanelProps) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Form upload
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCat, setUploadCat] = useState('other');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnerOrMod = myRole === 'owner' || myRole === 'moderator';

  // ── Query: danh sách tài liệu ─────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['resources', conversationId, category, search],
    queryFn: () => resourceApi.getResources(conversationId, {
      category: category || undefined,
      search: search || undefined,
      per_page: 20,
    }),
    enabled: !!conversationId,
  });

  const resources = data?.resources ?? [];

  // ── Mutation: upload ─────────────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: (vars: { title: string; description?: string; category: string; file: File }) =>
      resourceApi.uploadResource(conversationId, vars, setUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', conversationId] });
      setShowUpload(false);
      setUploadTitle('');
      setUploadDesc('');
      setUploadFile(null);
      setUploadProgress(null);
    },
    onError: () => setUploadProgress(null),
  });

  // ── Mutation: xóa ────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (resourceId: number) => resourceApi.deleteResource(conversationId, resourceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resources', conversationId] }),
  });

  const handleUploadSubmit = () => {
    if (!uploadTitle.trim() || !uploadFile) return;
    uploadMutation.mutate({
      title: uploadTitle.trim(),
      description: uploadDesc.trim() || undefined,
      category: uploadCat,
      file: uploadFile,
    });
  };

  const handleDownload = async (resource: GroupResource) => {
    try {
      // Lấy phần mở rộng từ file_url (ví dụ /storage/resources/abc.pdf -> pdf)
      const parts = resource.file_url.split('.');
      const ext = parts.length > 1 ? parts.pop() : '';
      const filename = resource.title + (ext ? `.${ext}` : '');
      
      await resourceApi.downloadResourceFile(conversationId, resource.id, filename);
    } catch (err) {
      console.error('Lỗi khi tải tài liệu:', err);
      alert('Không thể tải tài liệu này về máy. Vui lòng thử lại sau.');
    }
  };

  // owner/mod có thể xóa mọi tài liệu, member chỉ xóa được tài liệu của mình
  const canDelete = (resource: GroupResource) => {
    if (isOwnerOrMod) return true;
    return resource.uploader?.id === currentUser.id;
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Thanh công cụ ─────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-100 flex-shrink-0 space-y-2">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm tài liệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                category === cat.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Danh sách tài liệu ─────────────────────────────────────────── */}
      <div className="flex-grow overflow-y-auto px-3 py-2 space-y-2">
        {isLoading ? (
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-xs text-center">
            <svg className="w-8 h-8 mb-1.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Chưa có tài liệu nào.</p>
            <p className="mt-0.5 text-gray-300">Bấm "Upload" để thêm.</p>
          </div>
        ) : (
          resources.map((resource) => (
            <div
              key={resource.id}
              className="flex items-start gap-2.5 p-2 rounded-lg border border-gray-100 bg-white transition-colors hover:bg-gray-50"
            >
              <FileTypeIcon type={resource.file_type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-medium text-gray-800 truncate">{resource.title}</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  <span className="font-semibold text-indigo-500 mr-1">{getCategoryLabel(resource.category)}</span>
                  · {formatSize(resource.file_size)} · {resource.download_count} lượt tải
                  {resource.uploader && ` · ${resource.uploader.name}`}
                </p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {/* Download */}
                <button
                  onClick={() => handleDownload(resource)}
                  title="Tải xuống"
                  className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>

                {/* Delete */}
                {canDelete(resource) && (
                  <button
                    onClick={() => deleteMutation.mutate(resource.id)}
                    title="Xóa"
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Form Upload ─────────────────────────────────────────────────── */}
      {showUpload ? (
        <div className="flex-shrink-0 border-t border-gray-100 p-3 space-y-2 bg-white">
          <p className="text-xs font-semibold text-gray-700">Thêm tài liệu mới</p>
          <input
            type="text"
            placeholder="Tên tài liệu *"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <textarea
            placeholder="Mô tả (tùy chọn)"
            value={uploadDesc}
            onChange={(e) => setUploadDesc(e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
          />
          <select
            value={uploadCat}
            onChange={(e) => setUploadCat(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
          >
            <option value="other">Khác</option>
            <option value="exam">Đề thi</option>
            <option value="lecture">Bài giảng</option>
            <option value="exercise">Bài tập</option>
            <option value="note">Ghi chú</option>
          </select>
          {/* File picker */}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-1.5 text-xs text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {uploadFile ? `📎 ${uploadFile.name}` : 'Chọn file (tối đa 50MB)'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif,.txt,.odt,.ods,.odp"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Progress bar */}
          {uploadProgress !== null && (
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => { setShowUpload(false); setUploadProgress(null); }}
              className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleUploadSubmit}
              disabled={!uploadTitle.trim() || !uploadFile || uploadMutation.isPending}
              className="flex-1 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {uploadMutation.isPending ? `Đang tải (${uploadProgress ?? 0}%)` : 'Upload'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 border-t border-gray-100 p-3">
          <button
            onClick={() => setShowUpload(true)}
            className="w-full py-2 text-xs font-medium text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload tài liệu
          </button>
        </div>
      )}
    </div>
  );
}

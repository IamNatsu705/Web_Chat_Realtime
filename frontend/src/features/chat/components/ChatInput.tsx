import { useState, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { HiOutlinePhoto, HiOutlineDocumentText, HiPaperAirplane, HiXMark } from 'react-icons/hi2';

interface ChatInputProps {
  onSend: (content: string) => void;
  onSendImage?: (file: File) => void;
  onSendFile?: (file: File, meta?: { title: string; category: string; description: string }) => void;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * ChatInput — message composer
 *
 * - Auto-resizing textarea
 * - Enter = send, Shift+Enter = newline
 * - Image attachment button with preview
 */
export default function ChatInput({
  onSend,
  onSendImage,
  onSendFile,
  onTyping,
  disabled = false,
  placeholder = 'Nhập tin nhắn...',
}: ChatInputProps) {
  const [content, setContent] = useState('');
  const [filePreview, setFilePreview] = useState<{ file: File; url?: string; type: 'image' | 'file' } | null>(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileCat, setFileCat] = useState('other');
  const [fileDesc, setFileDesc] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`; // max ~5 lines
  }, []);

  const handleSend = useCallback(() => {
    let hasSent = false;

    if (filePreview) {
      if (filePreview.type === 'image' && filePreview.url) {
        onSendImage?.(filePreview.file);
        URL.revokeObjectURL(filePreview.url);
      } else if (filePreview.type === 'file') {
        onSendFile?.(filePreview.file, { title: fileTitle || filePreview.file.name, category: fileCat, description: fileDesc });
      }
      setFilePreview(null);
      setFileTitle('');
      setFileCat('other');
      setFileDesc('');
      hasSent = true;
    }

    const trimmed = content.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      hasSent = true;
    }

    if (!hasSent) return;
  }, [content, disabled, onSend, onSendImage, onSendFile, filePreview, fileTitle, fileCat, fileDesc]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleImageSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Hình ảnh không được vượt quá 10MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setFilePreview({ file, url, type: 'image' });

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, []);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      alert('Tài liệu không được vượt quá 30MB');
      return;
    }

    setFilePreview({ file, type: 'file' });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const cancelPreview = useCallback(() => {
    if (filePreview?.url) {
      URL.revokeObjectURL(filePreview.url);
    }
    setFilePreview(null);
    setFileTitle('');
    setFileCat('other');
    setFileDesc('');
  }, [filePreview]);

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
      {/* File Preview */}
      {filePreview && (
        <div className="mb-2 relative inline-block">
          {filePreview.type === 'image' && filePreview.url ? (
            <img
              src={filePreview.url}
              alt="Preview"
              className="h-24 w-auto rounded-lg border border-gray-200 object-cover shadow-sm"
            />
          ) : (
            <div className="flex flex-col space-y-3 bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-100 shadow-sm min-w-[280px]">
              <div className="flex items-center space-x-3 pr-6">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <HiOutlineDocumentText className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{filePreview.file.name}</p>
                  <p className="text-[10px] text-gray-500">{(filePreview.file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Tên tài liệu (mặc định lấy tên file)"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-indigo-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                />
                <select
                  value={fileCat}
                  onChange={(e) => setFileCat(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-indigo-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                >
                  <option value="other">Khác</option>
                  <option value="exam">Đề thi</option>
                  <option value="lecture">Bài giảng</option>
                  <option value="exercise">Bài tập</option>
                  <option value="note">Ghi chú</option>
                </select>
                <textarea
                  placeholder="Mô tả (tùy chọn)"
                  value={fileDesc}
                  onChange={(e) => setFileDesc(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-xs border border-indigo-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white resize-none"
                />
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={cancelPreview}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
          >
            <HiXMark className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-end space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 transition-shadow">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => { setContent(e.target.value); adjustHeight(); onTyping?.(); }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={filePreview ? 'Nhập tin nhắn kèm tệp đính kèm...' : placeholder}
          className="flex-grow bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400 leading-relaxed max-h-36 py-1"
        />

        {/* Image attachment button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="text-gray-400 hover:text-indigo-500 transition-colors flex-shrink-0 p-1"
          disabled={disabled}
          title="Gửi hình ảnh"
        >
          <HiOutlinePhoto className="w-6 h-6" />
        </button>

        {/* Document attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-indigo-500 transition-colors flex-shrink-0 p-1"
          disabled={disabled}
          title="Gửi tài liệu"
        >
          <HiOutlineDocumentText className="w-6 h-6" />
        </button>

        {/* Hidden inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!content.trim() && !filePreview) || disabled}
          className="flex-shrink-0 bg-indigo-600 text-white rounded-lg p-2 ml-1 hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <HiPaperAirplane className="w-5 h-5 -rotate-45 ml-0.5 mt-0.5" />
        </button>
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5 pl-1">
        Enter để gửi · Shift+Enter để xuống dòng
      </p>
    </div>
  );
}

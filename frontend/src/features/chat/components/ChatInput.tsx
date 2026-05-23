import { useState, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';

interface ChatInputProps {
  onSend: (content: string) => void;
  onSendImage?: (file: File) => void;
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
  onTyping,
  disabled = false,
  placeholder = 'Nhập tin nhắn...',
}: ChatInputProps) {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`; // max ~5 lines
  }, []);

  const handleSend = useCallback(() => {
    let hasSent = false;

    if (imagePreview) {
      onSendImage?.(imagePreview.file);
      URL.revokeObjectURL(imagePreview.url);
      setImagePreview(null);
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
  }, [content, disabled, onSend, onSendImage, imagePreview]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Hình ảnh không được vượt quá 5MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setImagePreview({ file, url });

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const cancelImagePreview = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview.url);
      setImagePreview(null);
    }
  }, [imagePreview]);

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img
            src={imagePreview.url}
            alt="Preview"
            className="h-24 w-auto rounded-lg border border-gray-200 object-cover shadow-sm"
          />
          <button
            type="button"
            onClick={cancelImagePreview}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
          placeholder={imagePreview ? 'Nhập tin nhắn kèm hình ảnh...' : placeholder}
          className="flex-grow bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400 leading-relaxed max-h-36 py-0.5"
        />

        {/* Image attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-indigo-500 transition-colors flex-shrink-0 pb-0.5"
          disabled={disabled}
          title="Gửi hình ảnh"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!content.trim() && !imagePreview) || disabled}
          className="flex-shrink-0 bg-indigo-600 text-white rounded-lg p-2 hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5 pl-1">
        Enter để gửi · Shift+Enter để xuống dòng
      </p>
    </div>
  );
}

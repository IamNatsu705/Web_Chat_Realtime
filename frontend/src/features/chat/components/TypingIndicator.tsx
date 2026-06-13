/**
 * TypingIndicator — Biểu tượng các dấu chấm nhấp nháy khi có người đang nhập.
 *
 * - Chat cá nhân / Người lạ: Hiện tên (ví dụ: "Minh đang soạn tin...")
 * - Chat nhóm: Hiện chung ("Có người đang soạn tin...")
 */
export default function TypingIndicator({ text }: { text: string }) {
  return (
    <div className="flex items-end mb-1 px-1 animate-fade-in">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-100 px-3 py-2 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
        <span className="flex space-x-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
        <span className="text-xs text-gray-500 italic">{text}</span>
      </div>
    </div>
  );
}

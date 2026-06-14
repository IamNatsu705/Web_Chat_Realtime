/**
 * TypingIndicator — Biểu tượng các dấu chấm nhấp nháy khi có người đang nhập.
 *
 * - Chat cá nhân / Người lạ: Hiện tên (ví dụ: "Minh đang soạn tin...")
 * - Chat nhóm: Hiện chung ("Có người đang soạn tin...")
 */
export default function TypingIndicator({ text }: { text: string }) {
  return (
    <div className="flex items-center space-x-2 animate-fade-in py-0.5 px-2">
      <div className="flex space-x-1 items-center bg-gray-100/80 px-2 py-1.5 rounded-full">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium text-gray-400">{text}</span>
    </div>
  );
}

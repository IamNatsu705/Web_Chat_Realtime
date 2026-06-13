/**
 * Chuyển đổi đường dẫn ảnh tương đối từ Backend thành URL đầy đủ.
 *
 * - Nếu path rỗng/null → trả về chuỗi rỗng.
 * - Nếu path đã là URL đầy đủ (http/https) → trả về nguyên.
 * - Nếu path là đường dẫn tương đối → nối với VITE_IMAGE_URL + /storage/.
 *
 * @param path Đường dẫn ảnh từ API Backend.
 * @returns URL đầy đủ của ảnh.
 */
export const getImageUrl = (path?: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    return `${import.meta.env.VITE_IMAGE_URL}/storage/${path}`;
};

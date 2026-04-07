export const getImageUrl = (path?: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    return `${import.meta.env.VITE_IMAGE_URL}/storage/${path}`;
};

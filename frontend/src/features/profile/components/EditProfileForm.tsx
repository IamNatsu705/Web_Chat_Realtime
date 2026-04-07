import React, { useState, useRef } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { profileApi } from '../api/profileApi';

export default function EditProfileForm() {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setError('');

        try {
            // Using base64 for mock, or actual file for real API
            const avatarData = avatarFile ? (import.meta.env.VITE_USE_MOCK_API === 'true' ? avatarPreview : avatarFile) : null;
            
            const reqData = {
                name,
                ...(avatarData && { avatar: avatarData })
            };

            const res = await profileApi.updateProfile(reqData);
            updateUser(res.data.user);
            setMessage('Thông tin cá nhân đã được cập nhật!');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Thông tin cơ bản</h3>
            
            {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">{message}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative h-24 w-24 rounded-full bg-gray-100 border-2 border-indigo-100 overflow-hidden flex items-center justify-center">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-indigo-400">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                            Đổi ảnh đại diện
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* Name Input */}
                    <div className="flex-grow space-y-4 w-full">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Nhập họ tên của bạn..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 text-xs">(Không thể thay đổi)</span></label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}

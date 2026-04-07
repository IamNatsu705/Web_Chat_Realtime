import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../providers/AuthProvider';
import EditProfileForm from '../../features/profile/components/EditProfileForm';
import ChangePasswordForm from '../../features/profile/components/ChangePasswordForm';
import ProfileFeed from '../../features/profile/components/ProfileFeed';

export default function ProfilePage() {
    const { user } = useAuth();
    
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow pt-6 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Top banner / header banner */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                        <div className="h-32 md:h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                            {/* Decorative overlay */}
                            <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-sm"></div>
                        </div>
                        <div className="px-6 pb-6 relative flex flex-col md:flex-row items-center md:items-end gap-4">
                            <div className="h-28 w-28 md:h-36 md:w-36 -mt-14 md:-mt-20 rounded-full bg-white p-1.5 shadow-lg flex-shrink-0 relative z-10 transition-transform hover:scale-105 duration-300">
                                <div className="h-full w-full rounded-full bg-indigo-50 overflow-hidden flex items-center justify-center border border-indigo-100">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl md:text-5xl font-bold text-indigo-400">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-center md:text-left md:mb-2 flex-grow z-10">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 drop-shadow-sm">{user?.name}</h1>
                                <p className="text-gray-500 font-medium">{user?.email}</p>
                            </div>
                            <div className="md:mb-2 w-full md:w-auto flex justify-center mt-4 md:mt-0">
                                <button className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm w-full md:w-auto justify-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Post
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Forms */}
                        <div className="col-span-1 lg:col-span-1 space-y-6">
                            <EditProfileForm />
                            <ChangePasswordForm />
                        </div>
                        
                        {/* Right Column: Feed */}
                        <div className="col-span-1 lg:col-span-2 space-y-6">
                            <ProfileFeed />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

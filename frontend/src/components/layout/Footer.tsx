import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-xl font-bold text-indigo-600 tracking-tight">Chatify</span>
          <span className="ml-2 text-sm text-gray-500">© 2026 Chatify Inc.</span>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">About</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Accessibility</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">User Agreement</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}

import Header from '../../components/layout/Header';

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-grow pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-8rem)]">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex overflow-hidden">
            
            {/* Left Sidebar - Conversation List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Messaging</h2>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                    placeholder="Search messages"
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-grow">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${i === 1 ? 'border-indigo-600 bg-indigo-50' : 'border-transparent'}`}>
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-800 font-bold border border-indigo-200">
                      U{i}
                    </div>
                    <div className="ml-3 flex-grow overflow-hidden">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-sm font-bold text-gray-900 truncate">User {i}</h3>
                        <span className="text-xs text-gray-500">Mar {10 + i}</span>
                      </div>
                      <p className={`text-sm truncate ${i === 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {i === 1 ? 'Yes, I think that design looks great! Let\'s go with it.' : 'Hello, are you available for a quick sync?'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="w-2/3 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
                <div className="flex items-center">
                  <h2 className="text-lg font-bold text-gray-900">User 1</h2>
                  <div className="ml-3 flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-xs text-gray-500 font-medium">Active now</span>
                  </div>
                </div>
                <div className="flex space-x-3 text-gray-400">
                  <button className="hover:text-indigo-600 transition-colors p-1"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-4 flex flex-col space-y-4 bg-gray-50">
                {/* Message items */}
                <div className="flex flex-col space-y-4">
                  <div className="flex items-end">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-800 text-xs font-bold mr-2 mb-1">U1</div>
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-none max-w-md shadow-sm">
                      <p className="text-sm text-gray-800">Hi there! Could you send me the latest demo link?</p>
                      <p className="text-xs text-gray-400 mt-1 mt-1 text-right">10:42 AM</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-end">
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-br-none max-w-md shadow-sm">
                      <p className="text-sm">Of course! I just deployed the new version. Here it is: https://demo.example.com</p>
                      <p className="text-xs text-indigo-200 mt-1 text-right">10:45 AM</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-end">
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-br-none max-w-md shadow-sm">
                      <p className="text-sm">Let me know what you think about the new layout!</p>
                      <p className="text-xs text-indigo-200 mt-1 text-right">10:45 AM</p>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-800 text-xs font-bold mr-2 mb-1">U1</div>
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-none max-w-md shadow-sm">
                      <p className="text-sm text-gray-800">Checking it out right now!</p>
                      <p className="text-xs text-gray-400 mt-1 text-right">10:46 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">Today</span>
                  </div>

                  <div className="flex items-end">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-800 text-xs font-bold mr-2 mb-1">U1</div>
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-none max-w-md shadow-sm">
                      <p className="text-sm text-gray-800">Yes, I think that design looks great! Let's go with it.</p>
                      <p className="text-xs text-gray-400 mt-1 text-right">11:30 AM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <textarea 
                       className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                       placeholder="Write a message..."
                       rows={1}
                    ></textarea>
                    <div className="absolute right-2 top-2 flex space-x-1">
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                  </div>
                  <button className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 transition-colors shadow-sm flex-shrink-0">
                    <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}

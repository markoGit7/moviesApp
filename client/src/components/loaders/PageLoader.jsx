import React from 'react'

function PageLoader() {
    return (
        <div className="fixed inset-0 w-screen h-screen bg-black flex flex-col items-center justify-center z-[9999]">
            
            {/* Spinner */}
            <div className="w-16 h-16 border-4 border-white/20 border-t-red-500 rounded-full animate-spin"></div>

            {/* Text */}
            <h2 className="mt-6 text-xl font-semibold text-white">
                Loading...
            </h2>

            <p className="mt-2 text-sm text-gray-400">
                Please wait while we connect to the server
            </p>

        </div>
    );
}

export default PageLoader
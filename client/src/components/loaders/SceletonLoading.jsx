import React from 'react'

function SceletonLoading({contnetAmount}) {
    return (

        <div className={`flex -mx-3 order-2 flex-wrap gap-y-6 transition-opacity duration-500`}>
            {Array.from({ length: contnetAmount }).map((_, i) => (
                <div
                key={i}
                className="px-3 w-1/4 flex-none h-[500px]"
                >
                    <div className='w-full h-full aspect-[2/3] bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse '></div>
                </div>
            ))}
        </div>
    )
}

export default SceletonLoading
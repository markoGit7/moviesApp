import React from 'react'


const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';



function Episodes({selected_season, episodes, selected_episode}) {

    const oneEpisode = episodes.episodes.find(col => col.episode_number === selected_episode);

    function truncateText(text, maxLength = 120) {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }


    if(selected_season !== episodes.season_number) return(<div className='w-full text-center mt-auto mb-auto text-2xl'>Loading...</div>);
    if(episodes.episodes.length === 0) return(<div className='mt-auto mb-auto text-2xl w-full text-center'>No Results</div>)
    
    

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2">

            {
                oneEpisode ?

                    (
                        <div className="flex flex-col rounded-lg overflow-hidden">

                            {/* Image */}
                            <div className="relative w-full">
                                {
                                    oneEpisode.still_path ?
                                        (
                                            <img
                                                src={`${IMAGE_PATH}${oneEpisode.still_path}`}
                                                alt=""
                                                className="w-full aspect-video object-cover object-center rounded-t-lg"
                                            />
                                        )
                                        :
                                        (
                                            <div className="w-full aspect-video rounded-t-lg bg-gray-500 flex items-center justify-center">
                                                No image available
                                            </div>
                                        )
                                }
                            </div>

                            {/* Text */}
                            <div className="bg-gray-900 w-full flex-1 rounded-b-lg">
                                <div className="p-3 sm:p-4">
                                    <span className="block text-sm">
                                        S{selected_season} E{oneEpisode.episode_number}
                                    </span>

                                    <h3 className="text-lg sm:text-2xl font-semibold">
                                        {oneEpisode.name}
                                    </h3>

                                    <p className="text-sm sm:text-base">
                                        {truncateText(oneEpisode.overview, 120)}
                                    </p>
                                </div>
                            </div>

                        </div>
                    )

                    :

                    episodes.episodes.map(row => (
                        <div
                            key={row.id}
                            className="flex flex-col rounded-lg overflow-hidden"
                        >

                            {/* Image */}
                            <div className="relative w-full">
                                {
                                    row.still_path ?
                                        (
                                            <img
                                                src={`${IMAGE_PATH}${row.still_path}`}
                                                alt=""
                                                className="w-full aspect-video object-cover object-center rounded-t-lg"
                                            />
                                        )
                                        :
                                        (
                                            <div className="w-full aspect-video rounded-t-lg bg-gray-500 flex items-center justify-center">
                                                No image available
                                            </div>
                                        )
                                }
                            </div>

                            {/* Text */}
                            <div className="bg-gray-900 w-full flex-1 rounded-b-lg">
                                <div className="p-3 sm:p-4">

                                    <span className="block text-sm">
                                        S{selected_season} E{row.episode_number}
                                    </span>

                                    <h3 className="text-lg sm:text-2xl font-semibold">
                                        {row.name}
                                    </h3>

                                    <p className="text-sm sm:text-base">
                                        {truncateText(row.overview, 120)}
                                    </p>

                                </div>
                            </div>

                        </div>
                    ))
            }

        </div>
    );
}

export default Episodes
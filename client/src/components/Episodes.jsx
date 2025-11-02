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
        <div className="grid grid-cols-12 grow-1 gap-y-4 -mx-2">
            

            {
                oneEpisode ? 
                (
                    <div className="col-span-4 flex px-2 flex-col rounded-lg overflow-hidden">
                        {/* Image */}
                        <div className="relative w-full rounded-t-lg">
                            {
                                oneEpisode.still_path ? 
                                (
                                    <img src={`${IMAGE_PATH}${oneEpisode.still_path}`} alt="" className='w-full h-50 object-cover object-center rounded-t-lg'/>
                                )
                                :
                                (
                                    <div className='w-full h-50 rounded-t-lg bg-gray-500 flex items-center justify-center'>No image available</div>
                                )
                            }

                        </div>
                        {/* Text */}
                        <div className="bg-gray-900 w-full h-[calc(100%-200px)] rounded-b-lg">
                            <div className='p-2 pb-4'>
                                <span className='block '>S{selected_season} E{oneEpisode.episode_number}</span>
                                <h3 className='text-2xl font-semibold'>{oneEpisode.name}</h3>
                                <p>{truncateText(oneEpisode.overview, 120)}</p>
                            </div>
                        </div>
                    </div>
                )
                
                :

                // Episodes
                episodes.episodes.map(row => (
                    <>
                        {/* Episode */}
                        <div className="col-span-4 flex px-2 flex-col rounded-lg overflow-hidden">
                            {/* Image */}
                            <div className="relative w-full rounded-t-lg">
                                {
                                    row.still_path ? 
                                    (
                                        <img src={`${IMAGE_PATH}${row.still_path}`} alt="" className='w-full h-50 object-cover object-center rounded-t-lg'/>
                                    )
                                    :
                                    (
                                        <div className='w-full h-50 rounded-t-lg bg-gray-500 flex items-center justify-center'>No image available</div>
                                    )
                                }

                            </div>
                            {/* Text */}
                            <div className="bg-gray-900 w-full h-[calc(100%-200px)] rounded-b-lg">
                                <div className='p-2 pb-4'>
                                    <span className='block '>S{selected_season} E{row.episode_number}</span>
                                    <h3 className='text-2xl font-semibold'>{row.name}</h3>
                                    <p>{truncateText(row.overview, 120)}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ))
               
               
            }
            
        </div>
    )
}

export default Episodes
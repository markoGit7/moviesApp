import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {movieByID} from '../api/movies.js'

//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlay, faImages, faX, faChevronCircleLeft, faChevronCircleRight  } from "@fortawesome/free-solid-svg-icons";

//components
import {Header} from '../components/Components_collection.js'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';
function MovieDetails() {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);

    const movieId = location.state?.id;
    const [trailerKey, setTrailerKey] = useState(null);

    const [zoomedPhotos, setZoomedPhotos] = useState(null);
    const [zoomedVideos, setZoomedVideos] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0); 

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const handleZoomedContent = (type) => {
        if(type === 'photos') {

            setZoomedPhotos(movie.images.posters.length > 0 ? movie.images.posters : null);
            console.log('Photos selected ', movie.images.posters);
        } else {

            setZoomedVideos(movie.videos.results.length > 0 ? movie.videos.results : null);
            console.log('Videos selected ', movie.videos.results);
        }
    }

    const handleCloseZoomed = () => {
        //Reset everything to deafult
        setZoomedPhotos(null);
        setZoomedVideos(null);
        setCurrentIndex(0);
    }


    useEffect(() => {
        
        (async () => {
            const result = await movieByID(movieId);

            setMovie(result);
            console.log('moviesArr', result);

            const video = result.videos.results.find(row => row.type === 'Trailer' && row.site === 'YouTube');
            
            if (video) setTrailerKey(video.key);
        })();
    
        
    }, [])


    useEffect(() => {
        
        console.log('index ', currentIndex)
    
      
    }, [currentIndex])
    
    
    if(!movieId) return <div>No Results</div>
    if(!movie) return <div>Loading...</div>

    return (
       <>
            <Header />
            <section className='w-full relative py-5'>
                <div className='w-[1200px] max-w-full px-5 mx-auto'>
                    <h1 className="text-4xl">{movie.title}</h1>
                    <span className="text-sm italic">{formatDate(movie.release_date)} • {movie.runtime}min</span>

                    {/* 3 Rows */}
                    <div className="grid  grid-cols-12 -mx-1">
                        {/* Poster */}
                        <div className="col-span-3 px-1">
                            <img src={`${IMAGE_PATH}${movie.poster_path}`} className="w-full h-[400px] object-cover object-center"/>
                        </div>
                        {/* Video */}
                        <div className="col-span-6 px-1">
                            {trailerKey ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${trailerKey}?mute=1&controls=1`}
                                    title="Movie Trailer"
                                    className="w-full h-full border-0"
                                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                ></iframe>
                            ) : (
                                <p className="text-center text-gray-400">No trailer available.</p>
                            )}
                        </div>
                        {/* Phosts/Videos */}
                        <div className="col-span-3 px-1">
                            {/* Videos Collection */}
                            <div className="h-[50%] p-2 rounded-lg overflow-hidden">
                                <div className="w-full h-full bg-gray-400 flex justify-center items-center rounded-lg flex-col" onClick={() => handleZoomedContent('videos')}>
                                    <FontAwesomeIcon icon={faPlay} className="text-4xl cursor-pointer"/>
                                    <div className="block">{movie.videos.results.length} Videos</div>
                                </div>
                            </div>
                            {/* Photos Collection */}
                            <div className="h-[50%] p-2 rounded-lg overflow-hidden">
                                <div className="w-full h-full bg-gray-400 flex justify-center items-center rounded-lg flex-col" onClick={() => handleZoomedContent('photos')}>
                                    <FontAwesomeIcon icon={faImages } className="text-4xl cursor-pointer"/>
                                    <div className="block">{movie.images.posters.length} Photos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className='w-full relative py-5'>
                <div className='w-[1200px] max-w-full px-5 mx-auto'>
                    <ul className="flex items-center -mx-2">
                        {
                            movie.genres.map(row => (
                                <li className="after:content-['•'] after:absolute relative after:right-0 after:top-1/2 after:-translate-y-1/2 pr-3 last:pr-2 last:after:content-none px-2">{row.name}</li>
                            ))
                        }
                    </ul>

                    <div className="grid grid-cols-12 -mx-3">
                        <div className="col-span-8 px-3">
                            Plot...
                            Director... 
                            Ratings... 
                        </div>
                        <div className="col-span-4 px-3">
                            Providers... 

                            <div>
                                Like... 
                                Share... 
                                Comment... 
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Zoom View Photos Content */}
            {
                zoomedPhotos &&
                (

                    <div className='absolute w-full h-[100dvh] bg-black top-0 left-0 z-20'>
                        <div className='w-full h-full relative flex'>
                            
                            <FontAwesomeIcon icon={faX} className="text-2xl absolute top-6 right-6 cursor-pointer" onClick={() => handleCloseZoomed()}/>
                            
                            {/* Back Arror */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-6">
                                <FontAwesomeIcon icon={faChevronCircleLeft} className='text-4xl cursor-pointer' onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : zoomedPhotos.length - 1)}/>
                            </div>

                            {/* Content */}
                            <div className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain m-auto">
                                    
                                <img src={`${IMAGE_PATH}${zoomedPhotos[currentIndex]?.file_path}`} className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain"/>
                                    
                            </div>

                            {/* Slides Counter*/}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">{currentIndex + 1} / {zoomedPhotos.length}</div>

                            {/* Forward Arror */}
                            <div className="absolute top-1/2 -translate-y-1/2 right-6">
                                <FontAwesomeIcon icon={faChevronCircleRight} className='text-4xl cursor-pointer' onClick={() => setCurrentIndex(prev => prev < zoomedPhotos.length - 1 ? prev + 1 : 0)}/>
                            </div>
                               
                            
                        </div>
                    </div> 

                )
            }

            {/* Zoom View Videos Content */}
            {
                zoomedVideos &&
                (

                    <div className='absolute w-full h-[100dvh] bg-black top-0 left-0 z-20'>
                        <div className='w-full h-full relative flex'>
                            
                            <FontAwesomeIcon icon={faX} className="text-2xl absolute top-6 right-6 cursor-pointer" onClick={() => handleCloseZoomed()}/>
                            
                            {/* Back Arror */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-6">
                                <FontAwesomeIcon icon={faChevronCircleLeft} className='text-4xl cursor-pointer' onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : zoomedVideos.length - 1)}/>
                            </div>

                            {/* Content */}
                            <div className="w-[90vw] max-w-4xl aspect-video rounded-xl overflow-hidden shadow-lg m-auto">
                                <iframe
                                    src={`https://www.youtube.com/embed/${zoomedVideos[currentIndex].key}?mute=1&controls=1`}
                                    title="Movie Trailer"
                                    className="w-full h-full border-0"
                                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* Slides Counter*/}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">{currentIndex + 1} / {zoomedVideos.length}</div>

                            {/* Forward Arror */}
                            <div className="absolute top-1/2 -translate-y-1/2 right-6">
                                <FontAwesomeIcon icon={faChevronCircleRight} className='text-4xl cursor-pointer' onClick={() => setCurrentIndex(prev => prev < zoomedVideos.length - 1 ? prev + 1 : 0)}/>
                            </div>
                               
                            
                        </div>
                    </div> 

                )
            }
            
       </>
    )
}

export default MovieDetails
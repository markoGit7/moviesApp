import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import {contentByID} from '../api/movies.js'
//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlay, faImages, faX, faChevronCircleLeft, faChevronCircleRight, faHeart, faShare, faCommentDots, faUserTie, faThumbsUp, faThumbsDown, faReply, faAngleDown  } from "@fortawesome/free-solid-svg-icons";

//components
import {Header, RecomendedMovies, Comments} from '../components/Components_collection.js'

//slider
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'


// FUNCTION: force logout 
async function forceLog_out() {
    localStorage.removeItem('access_token');

    // Remove cookie
    const response_s = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        
        credentials: 'include',
    });

    window.location.reload(); // 🔄 refresh the page
}

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';
function MovieDetails() {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const swiperRef = useRef(null);
    const [RETURN, setRETURN] = useState(false);

    const movieId = location.state?.id;
    const [trailerKey, setTrailerKey] = useState(null);

    const [zoomedPhotos, setZoomedPhotos] = useState(null);
    const [zoomedVideos, setZoomedVideos] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0); 

    //user
    const token = Boolean(localStorage.getItem('access_token'));

    // checking if token exists
    useEffect(() => {
        
        console.table([{question: "Does Token Exists? ", answer: token ? "YES" : "NO"}], ['question', 'answer']);
      
    }, [token]);
    

    //like const
    const [Like, setLike] = useState(null);

    const formatDate = (dateStr) => {//making the date to be ex:01-Jan-2025
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const handleZoomedContent = (type) => {//collecting photos/videos from selected type
        let result = null;

        if(type === 'photos') {
            
            result = movie.images.posters.length > 0 ? movie.images.posters : null;
            setZoomedPhotos(result);
            
        } else {
            
            result = movie.videos.results.length > 0 ? movie.videos.results : null;
            setZoomedVideos(result);
            
        }

        if(result) document.body.classList.add("overflow-hidden");
    }

    const handleCloseZoomed = () => { //reseting zoomed content to default
        //Reset everything to deafult
        setZoomedPhotos(null);
        setZoomedVideos(null);
        setCurrentIndex(0);

        document.body.classList.remove("overflow-hidden");
    }

    const movieDirector = () => {//Function for finding the movie director
        if(!movie?.credits?.crew) return 'Unknown Director';
        const Director = movie.credits.crew.find(row => row.known_for_department === 'Directing') || 'Unknown Director';
        return Director.name;
    } 
    



    useEffect(() => {
        if(!movieId) return;


        (async () => {
            const result = await contentByID(movieId, 'movie');

            setMovie(result);
            console.log('moviesArr', result);
            
            if(result?.success === false) setRETURN(true); 

            

            const video = result?.videos?.results.find(row => row.type === 'Trailer' && row.site === 'YouTube');
            
            if (video) setTrailerKey(video.key);

            console.log('movie_id', movieId)
        })();
        
    }, [movieId])
    


    useEffect(() => {//setting Slider to slide 0
        if (swiperRef.current) {
            swiperRef.current.slideTo(0, 0); // slideTo(index, speed)
        }
    }, [movie]);


    // USEFFECT: Liking System

    
    useEffect(() => {
        
        if(!token) return;

        const isAlreadyLiked = async() => {
            const response = await fetch('http://localhost:3000/like/verify',{
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },

                credentials: "include",

                body: JSON.stringify({
                    post_id: movieId,
                    media_type: "movie"
                }),
            });
            
            // when refresh token expires, detect
            if(response.status === 401) {
                forceLog_out();
                return;
            }

            const isLiked = await response.json();

            // EXPIRED ACCESS TOKEN
            const newToken = response.headers.get("x-new-access-token");
            if(newToken) {
                localStorage.setItem('access_token', newToken);
            }

            setLike(isLiked.liked);

        };

        isAlreadyLiked();
        
    }, []);
    
    const handleLike = async() => {
        if(!token) {
            alert(`You need to log in to Like this post`);
            return;
        }

        const response = await fetch('http://localhost:3000/like',{
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },

            credentials: "include",

            body: JSON.stringify({
                post_id: movieId,
                media_type: "movie"
            }),
        }); 

        // when refresh token expires, detect
        if(response.status === 401) {
            forceLog_out();
            return;
        }

        const isLiked = await response.json();
        
        setLike(isLiked.liked);

        // EXPIRED ACCESS TOKEN
        const newToken = response.headers.get("x-new-access-token");
        if(newToken) {
            localStorage.setItem('access_token', newToken);
        }


        // recall likes count
        window.dispatchEvent(new Event("storageUpdate"));

    };

    
    
    if(!movieId) return <div>No Results</div>
    if(!movie) return <div>Loading...</div>
    if(RETURN) return(<div className="flex w-full h-[100dvh] overflow-hidden justify-center items-center text-4xl">No Data Found. ------ Go Back</div>);

    const countryCode = navigator.language.split('-')[1];
    const LINK = movie['watch/providers']?.results[countryCode]?.link || "";


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
                            <p>{movie.overview}</p>
                            <p>Director <span className="text-red-500">{movieDirector()}</span></p>
                            <h3>Ratings</h3>
                            <div className="flex flex-row items-center gap-x-2">
                                <FontAwesomeIcon icon={faStar} className="text-2xl text-yellow-400"/>
                                <div>
                                    {/* Ratings */}
                                    <p className="font-semibold text-lg">{movie.vote_average.toFixed(1)} <span className="text-white/80 text-base">/ 10</span></p>
                                    {/* Votes */}
                                    <p className="text-sm text-white/80">{JSON.stringify(movie.vote_count)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-4 px-3">
                            <button onClick={() => LINK && window.open(LINK, '_blank')} className={`${LINK ? 'bg-red-500 cursor-pointer' : 'bg-red-300 cursor-default pointer-events-none'} min-w-32 p-[12px_4px] rounded-lg`}>Watch</button>

                            <div className="flex gap-x-5 mt-4">
                                <FontAwesomeIcon onClick={handleLike} icon={faHeart} className={`text-2xl cursor-pointer ${Like ? 'text-red-500' : 'text-white'} `}/>
                                
                                <FontAwesomeIcon 
                                    onClick={() => {
                                        document.getElementById("commentsSection")?.scrollIntoView({
                                            behavior: "smooth",
                                        })
                                    }}

                                    icon={faCommentDots} 
                                    className="text-2xl cursor-pointer"
                                 />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='w-full relative py-5'>
                <div className='w-[1200px] max-w-full px-5 mx-auto'>
                    <h2>Cast</h2>
                    
                    <div className='w-full h-auto relative'>
                        <button className="custom-prev-movie absolute -left-10 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow">
                            ←
                        </button>
                        <button className="custom-next-movie absolute -right-10 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow">
                            →
                        </button>
                        <Swiper
                            modules={[Navigation, Pagination]}
                            onSwiper={(swiper) => (swiperRef.current = swiper)}
                            navigation={{
                            nextEl: '.custom-next-movie',
                            prevEl: '.custom-prev-movie',
                            }}
                            
                            spaceBetween={30}
                            slidesPerView={4}
                            className=""
                        >
                            {
                                movie.credits.cast.map(row => (
                                    <SwiperSlide>
                                        <div>
                                            <img src={`${IMAGE_PATH}${row.profile_path}`} alt={`${row.name}`}/>
                                            <h3>{row.name}</h3>
                                            <span className="block">{row.character}</span>
                                        </div>
                                    </SwiperSlide>
                                ))
                            }

                        </Swiper>
                    </div>

                </div>
            </section>

            {/* Recommendations Block */}
            <RecomendedMovies movie_id={movieId} />

            {/* Comments Block */}
            <Comments post={movieId} media_type={'movie'} token={token} forceLog_out={forceLog_out}/>

            {/* Zoom View Photos Content */}
            {
                zoomedPhotos &&
                (

                    <div className='fixed w-full h-[100dvh] bg-black inset-0 z-20 overflow-hidden'>
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

                    <div className='fixed w-full h-[100dvh] bg-black inset-0 z-20'>
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
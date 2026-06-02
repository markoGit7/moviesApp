import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import {contentByID, episodesBySeason} from '../api/movies.js'
//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlay, faImages, faX, faChevronCircleLeft, faChevronCircleRight, faHeart,  faCommentDots, faChevronLeft, faChevronRight  } from "@fortawesome/free-solid-svg-icons";


//components
import {Header, RecomendedShows, Episodes, Comments} from '../components/Components_collection.js'

//slider
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'


// Import image for actors without image
import missing_actor from '../assets/actors/missing_actor.jpg'

// FUNCTION: force logout 
async function forceLog_out() {
    localStorage.removeItem('access_token');

    // Remove cookie
    const response_s = await fetch(`${import.meta.env.VITE_REQUEST_PATH}auth/logout`, {
        method: 'POST',
        
        credentials: 'include',
    });

    window.location.reload(); // 🔄 refresh the page
}

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';
function ShowsDetails() {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [show, setShow] = useState(null);
    const [episodes, setEpisodes] = useState(null);
    const [selected_season, setSelectedSeason] = useState(null);
    const [selected_episode, setSelectedEpisode] = useState(null);
    const [allActors, setAllActors] = useState(null);
    const swiperRef = useRef(null);

    const showId = location.state?.id;

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
    

    const Released_Ended = (start, end) => {//function for returning release-end date of a tv show
        const release = start?.split('-')[0];
        const ended = end?.split('-')[0];

        if(!release) return '/';

        let str = release !== ended && ended ? `${release}–${ended}` : release;
        
        return str;
    };

    const handleZoomedContent = (type) => {//collecting photos/videos from selected type
        let result = null;

        if(type === 'photos') {
            
            result = show.images.posters.length > 0 ? show.images.posters : null;
            setZoomedPhotos(result);
            
        } else {
            
            result = show.videos.results.length > 0 ? show.videos.results : null;
            setZoomedVideos(result);
            
        }

        if(result) document.body.classList.add("overflow-hidden");
    };

    const handleCloseZoomed = () => { //reseting zoomed content to default
        //Reset everything to deafult
        setZoomedPhotos(null);
        setZoomedVideos(null);
        setCurrentIndex(0);

        document.body.classList.remove("overflow-hidden");
    };

    const handleSelectedEpisode = (ep) => {

        console.log('Episode Number: ',ep)

        if(ep === "") {//When I select none show all the episodes
            setSelectedEpisode(null);
            return;
        }

        setSelectedEpisode(ep);
    };

    function reset() {
        setShow(null);
        setEpisodes(null);
        setTrailerKey(null);
        setAllActors(null);
    }



    useEffect(() => {//fetching a show arr from api
        
        reset();

        (async () => {
            const result = await contentByID(showId, 'tv');

            setShow(result);
            console.log('showsArr', result);

            //get trailers
            const video = result.videos.results.find(row => row.type === 'Trailer' && row.site === 'YouTube') || null;
            
            console.log("Video: ", video);
            if (video) setTrailerKey(video.key);

            //get acters
            const theCast = [...result.credits.cast];
            console.log('From the Cast', theCast);
            //remove 2x Member form crew
            const singleMemberCrew = [];
            result.credits.crew.forEach(col => {

                const isActor = col.known_for_department === 'Acting';

                const double = singleMemberCrew.find(member => member?.id === col.id);

                if(!double && isActor) singleMemberCrew.push(col);
            });
            
            //remove 2x Member of crew from cast
            const theCrew = singleMemberCrew.filter(col => col.known_for_department === 'Acting' &&  !theCast.some(castMember => castMember.id === col.id));
            setAllActors([...theCast, ...theCrew]);

            // set selected_season to latest
            const latest_season = result.seasons.sort((a, b) => b.season_number - a.season_number).find(row => row.episode_count !== 0).season_number;

            setSelectedSeason(latest_season);
            
        })();
    
        
    }, [location.state?.id])

    useEffect(() => {//Get the episodes of the selected season
        if(selected_season === null) return;
       
        (async() => {//fetching episodes
            const result = await episodesBySeason(showId, selected_season);
            console.log(`Season ${selected_season}: `, result);
            setEpisodes(result);

            //set the selected episode to none
            setSelectedEpisode(null);
        })();
       
        
    }, [selected_season]);
    


    useEffect(() => {//setting Slider to slide 0
        if (swiperRef.current) {
            swiperRef.current.slideTo(0, 0); // slideTo(index, speed)
        }
    }, [show]);


    // USEFFECT: Liking System
    const [like, setLike] = useState(null);

    
    // SHOW IF LIKED ON LOAD
    useEffect(() => {
        
        if(!token) return;

        const isAlreadyLiked = async() => {
            const response = await fetch(`${import.meta.env.VITE_REQUEST_PATH}like/verify`,{
                method: 'POST',
                
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },

                credentials: "include", 

                body: JSON.stringify({
                    post_id: showId,
                    media_type: "tv"
                }),
                
            });


            // when refresh token expires, detect
            if(response.status === 401) {
                forceLog_out();
                return;
            }

            const isLiked = await response.json();
            console.log("VERIFYING LIKED? ", isLiked.liked ? "LIKED" : "NOT LIKED");

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

        const response = await fetch(`${import.meta.env.VITE_REQUEST_PATH}like`,{
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },

            credentials: "include", 
            
            body: JSON.stringify({
                post_id: showId,
                media_type: "tv"
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
    }
    
    

    
    if(!showId) return <div>No Results</div>
    if(!show) return <div>Loading...</div>

    const countryCode = navigator.language.split('-')[1];
    const LINK = show['watch/providers']?.results[countryCode]?.link || "";

    
    return (
       <>
            <Header />

            {/* HERO */}
            <section className='w-full relative py-5'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl">
                        {show.name}
                    </h1>

                    <span className="text-xs sm:text-sm italic">
                        TV • {Released_Ended(show.first_air_date, show.last_air_date)} • {show.episode_run_time[0] || 0}min
                    </span>

                    {/* TOP GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">

                        {/* POSTER */}
                        <div className="lg:col-span-3">
                            <img
                                src={`${IMAGE_PATH}${show.poster_path}`}
                                className="w-full aspect-[2/3] object-cover object-center rounded-lg"
                            />
                        </div>

                        {/* VIDEO */}
                        <div className="lg:col-span-6 aspect-video">
                            {trailerKey ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${trailerKey}?mute=1&controls=1`}
                                    title="show Trailer"
                                    className="w-full h-full border-0 rounded-lg"
                                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            ) : (
                                <div className="text-white bg-gray-500 h-full rounded-lg flex items-center justify-center">
                                    No trailer available.
                                </div>
                            )}
                        </div>

                        {/* MEDIA BOXES */}
                        <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3">

                            <div className="p-2 rounded-lg overflow-hidden min-h-[140px]">
                                <div
                                    className="w-full h-full bg-gray-400 flex cursor-pointer justify-center items-center rounded-lg flex-col"
                                    onClick={() => handleZoomedContent('videos')}
                                >
                                    <FontAwesomeIcon icon={faPlay} className="text-3xl sm:text-4xl" />
                                    <div>{show.videos.results.length} Videos</div>
                                </div>
                            </div>

                            <div className="p-2 rounded-lg overflow-hidden min-h-[140px]">
                                <div
                                    className="w-full h-full bg-gray-400 flex cursor-pointer justify-center items-center rounded-lg flex-col"
                                    onClick={() => handleZoomedContent('photos')}
                                >
                                    <FontAwesomeIcon icon={faImages} className="text-3xl sm:text-4xl" />
                                    <div>{show.images.posters.length} Photos</div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* OVERVIEW */}
            <section className='w-full relative py-5'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

                    <ul className="flex flex-wrap gap-2">
                        {
                            show.genres.map(row => (
                                <li key={row.id}>
                                    {row.name}
                                </li>
                            ))
                        }
                    </ul>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">

                        <div className="lg:col-span-8">
                            <p>{show.overview}</p>

                            <p>
                                Director:&nbsp;
                                {show.created_by.map((row, index) => (
                                    <>
                                        <span className="text-red-500">{row.name}</span>
                                        {index < show.created_by.length - 1 && <span> • </span>}
                                    </>
                                ))}
                            </p>

                            <h3>Ratings</h3>

                            <div className="flex items-center gap-x-2">
                                <FontAwesomeIcon icon={faStar} className="text-2xl text-yellow-400" />
                                <div>
                                    <p className="font-semibold text-lg">
                                        {show.vote_average.toFixed(1)} / 10
                                    </p>
                                    <p className="text-sm text-white/80">
                                        {show.vote_count}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4">
                            <button
                                onClick={() => LINK && window.open(LINK, '_blank')}
                                className={`${LINK ? 'bg-red-500 cursor-pointer' : 'bg-red-300 cursor-default pointer-events-none'} min-w-32 p-3 rounded-lg w-full`}
                            >
                                Watch
                            </button>

                            <div className="flex gap-x-5 mt-4">
                                <FontAwesomeIcon onClick={handleLike} icon={faHeart} className={`text-2xl cursor-pointer ${like ? 'text-red-500' : 'text-white'}`} />

                                <FontAwesomeIcon
                                    onClick={() =>
                                        document.getElementById("commentsSection")?.scrollIntoView({
                                            behavior: "smooth",
                                        })
                                    }
                                    icon={faCommentDots}
                                    className="text-2xl cursor-pointer"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SEASONS */}
            <section className='w-full relative py-5'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

                    <div className="text-right mb-5">
                        <select
                            onChange={(e) =>
                                handleSelectedEpisode(
                                    episodes?.episodes[e.target.value - 1]?.episode_number || ""
                                )
                            }
                            value={selected_episode || ""}
                            className="bg-gray-800 text-white rounded px-2 py-1"
                        >
                            <option value="">None</option>
                            {episodes?.episodes.map((col) => (
                                <option key={col.episode_number} value={col.episode_number}>
                                    Episode {col.episode_number}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                        {/* SEASONS */}
                        <div className="lg:col-span-1 flex lg:flex-col flex-row flex-wrap gap-2 justify-center bg-gray-900 p-2 rounded-2xl">

                            <h3 className="w-full text-center text-white/75 mb-2">
                                Seasons
                            </h3>

                            {
                                show.seasons
                                    .sort((a, b) => b.season_number - a.season_number)
                                    .map(row => (
                                        <div
                                            key={row.season_number}
                                            className={`${selected_season === row.season_number ? "bg-red-500" : "bg-gray-400"} w-9 h-9 rounded-full flex items-center justify-center cursor-pointer`}
                                            onClick={() => setSelectedSeason(row.season_number)}
                                        >
                                            {row.season_number}
                                        </div>
                                    ))
                            }

                        </div>

                        {/* EPISODES */}
                        <div className="lg:col-span-11">
                            {
                                selected_season !== null && episodes
                                    ? (
                                        <Episodes
                                            selected_season={selected_season}
                                            selected_episode={selected_episode}
                                            episodes={episodes}
                                        />
                                    )
                                    : (
                                        <div className="text-center text-2xl">
                                            No Results
                                        </div>
                                    )
                            }
                        </div>

                    </div>
                </div>
            </section>

            {/* CAST */}
            <section className='w-full relative py-5'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

                    <h2 className="text-xl mb-4">Cast</h2>

                    <div className="relative px-4 sm:px-6 lg:px-10">

                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation={{
                                nextEl: '.custom-next-show',
                                prevEl: '.custom-prev-show',
                            }}
                            spaceBetween={30}
                            breakpoints={{
                                0: { slidesPerView: 2 },
                                640: { slidesPerView: 3 },
                                1024: { slidesPerView: 4 }
                            }}
                        >
                            {
                                allActors.map(row => (
                                    <SwiperSlide key={row.id}>
                                        <div>
                                            <img
                                                src={
                                                    row.profile_path
                                                        ? `${IMAGE_PATH}${row.profile_path}`
                                                        : missing_actor
                                                }
                                                className="aspect-[2/3] w-full object-cover"
                                            />
                                            <h3>{row.name}</h3>
                                            <span>{row.character}</span>
                                        </div>
                                    </SwiperSlide>
                                ))
                            }
                        </Swiper>

                    </div>
                </div>
            </section>

            {/* Recommendations Block */}
            <RecomendedShows show_id={showId} />

            {/* Comments Block */}
            <Comments post={showId} media_type={'tv'} token={token} forceLog_out={forceLog_out}/>

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
                                    title="show Trailer"
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

export default ShowsDetails
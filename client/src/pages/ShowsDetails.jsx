import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import {contentByID, episodesBySeason} from '../api/movies.js'
//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlay, faImages, faX, faChevronCircleLeft, faChevronCircleRight, faHeart, faShare, faCommentDots, faUserTie, faThumbsUp, faThumbsDown, faReply, faAngleDown  } from "@fortawesome/free-solid-svg-icons";

//components
import {Header, RecomendedShows, Episodes, Comments} from '../components/Components_collection.js'

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
            const video = result.videos.results.find(row => row.type === 'Trailer' && row.site === 'YouTube');
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
            const response = await fetch('http://localhost:3000/like/verify',{
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

        const response = await fetch('http://localhost:3000/like',{
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
            <section className='w-full relative py-5'>
                <div className='w-[1200px] max-w-full px-5 mx-auto'>
                    <h1 className="text-4xl">{show.name}</h1>
                    <span className="text-sm italic">TV • {Released_Ended(show.first_air_date, show.last_air_date)} • {show.episode_run_time[0] || 0}min</span>

                    {/* 3 Rows */}
                    <div className="grid  grid-cols-12 -mx-1">
                        {/* Poster */}
                        <div className="col-span-3 px-1">
                            <img src={`${IMAGE_PATH}${show.poster_path}`} className="w-full h-[400px] object-cover object-center"/>
                        </div>
                        {/* Video */}
                        <div className="col-span-6 px-1">
                            {trailerKey ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${trailerKey}?mute=1&controls=1`}
                                    title="show Trailer"
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
                                    <div className="block">{show.videos.results.length} Videos</div>
                                </div>
                            </div>
                            {/* Photos Collection */}
                            <div className="h-[50%] p-2 rounded-lg overflow-hidden">
                                <div className="w-full h-full bg-gray-400 flex justify-center items-center rounded-lg flex-col" onClick={() => handleZoomedContent('photos')}>
                                    <FontAwesomeIcon icon={faImages } className="text-4xl cursor-pointer"/>
                                    <div className="block">{show.images.posters.length} Photos</div>
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
                            show.genres.map(row => (
                                <li className="after:content-['•'] after:absolute relative after:right-0 after:top-1/2 after:-translate-y-1/2 pr-3 last:pr-2 last:after:content-none px-2">{row.name}</li>
                            ))
                        }
                    </ul>

                    <div className="grid grid-cols-12 -mx-3">
                        <div className="col-span-8 px-3">
                            <p>{show.overview}</p>
                            <p>Director: &nbsp;
                                {show.created_by.map((row, index) => (
                                    <>
                                        <span className="text-red-500">{row.name}</span>
                                        
                                        {index < show.created_by.length - 1 && <span> • </span>}
                                    </>
                                ))}
                            </p>
                            <h3>Ratings</h3>
                            <div className="flex flex-row items-center gap-x-2">
                                <FontAwesomeIcon icon={faStar} className="text-2xl text-yellow-400"/>
                                <div>
                                    {/* Ratings */}
                                    <p className="font-semibold text-lg">{show.vote_average.toFixed(1)} <span className="text-white/80 text-base">/ 10</span></p>
                                    {/* Votes */}
                                    <p className="text-sm text-white/80">{JSON.stringify(show.vote_count)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-4 px-3">
                            <button onClick={() => LINK && window.open(LINK, '_blank')} className={`${LINK ? 'bg-red-500 cursor-pointer' : 'bg-red-300 cursor-default pointer-events-none'} min-w-32 p-[12px_4px] rounded-lg`}>Watch</button>

                            <div className="flex gap-x-5 mt-4">
                                <FontAwesomeIcon onClick={handleLike} icon={faHeart} className={`text-2xl cursor-pointer ${like ? 'text-red-500' : 'text-white'}`}/>
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
                    
                        
                    {/* Episodes Selector */}
                    <div className="w-full text-right mb-5">

                        <select
                            onChange={(e) => handleSelectedEpisode(episodes?.episodes[e.target.value - 1]?.episode_number || "")}
                            className="bg-gray-800 text-white rounded px-2 py-1 ml-3"
                            value={selected_episode || ""}
                            >

                            <option value="" >None</option>

                            {episodes?.episodes.map((col) => (
                                <option key={col.episode_number} value={col.episode_number}>
                                Episode {col.episode_number}
                                </option>
                            ))}
                        </select>
                        
                    </div>

                    <div className="grid grid-cols-12 -mx-2">    

                        {/* Vertical */}
                        <div className="px-2 col-span-1">
                            <div className="bg-gray-900 h-auto w-full flex flex-col items-center rounded-2xl p-[5px_10px_10px]">
                                <h3 className="mb-5 text-center text-white/75 text-[20px] tracking-tight">Seasons</h3>

                                {
                                    show.seasons.sort((a,b) => b.season_number - a.season_number).map(row => (
                                        <div className={`${selected_season === row.season_number ? "bg-red-500 font-semibold" : "bg-gray-400 font-normal"} w-9 h-9 rounded-full inline-flex items-center justify-center text-white mb-3 [&:last-of-type]:mb-0 cursor-pointer`} onClick={() => setSelectedSeason(row.season_number)}>{row.season_number}</div>
                                    ))
                                }
                                
                            </div>
                        </div>

                        <div className="px-2 col-span-11 flex flex-row h-max">
                           
                            {/* Content */}

                            {
                                selected_season !== null && episodes ? 
                                ( <Episodes selected_season={selected_season} selected_episode={selected_episode} episodes={episodes}/> ) 
                                : 
                                (<div className="w-full mt-auto mb-auto text-center text-2xl">No Results</div>)
                            }
                           
                        </div>
                    </div>
                </div>
            </section>

            <section className='w-full relative py-5'>
                <div className='w-[1200px] max-w-full px-5 mx-auto'>
                    <h2>Cast</h2>
                    
                    <div className='w-full h-auto relative'>
                        <button className="custom-prev-show absolute -left-10 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow">
                            ←
                        </button>
                        <button className="custom-next-show absolute -right-10 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow">
                            →
                        </button>
                        <Swiper
                            modules={[Navigation, Pagination]}
                            onSwiper={(swiper) => (swiperRef.current = swiper)}
                            navigation={{
                            nextEl: '.custom-next-show',
                            prevEl: '.custom-prev-show',
                            }}
                            
                            spaceBetween={30}
                            slidesPerView={4}
                            className=""
                        >
                            {
                                allActors.map(row => (
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
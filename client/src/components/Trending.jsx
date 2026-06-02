import React, {useState, useEffect} from 'react'
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight  } from "@fortawesome/free-solid-svg-icons";

//Api
import {popularMovies_or_Shows, Genres} from '../api/movies.js'
const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';

//function for slugifying
function slugify(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

//function for fetching genres
async function Fetch_Genres() {

    const { movieGenres, showsGenres } = await Genres();

    const merge = [...movieGenres, ...showsGenres];
    
    const removeDuplicates = {};
    
    merge.forEach(elm => {
        removeDuplicates[elm.id] = elm.name;
    });

    
    
    return removeDuplicates;
}

function Trending() {

    const [displayMovies, setMovies] = useState([]);
    const [displayShows, setShows] = useState([]);
    const [genres, setGenres] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        
       (async () => {
            const resultMovie = await popularMovies_or_Shows('movie', 1);
            const resultShows = await popularMovies_or_Shows('tv', 1);
            const dataMovies = resultMovie.results.sort((a, b) => b.popularity - a.popularity).filter(row => row.poster_path !== null).slice(0, 7);
            const dataShows = resultShows.results.sort((a, b) => b.popularity - a.popularity).filter(row => row.poster_path !== null).slice(0,7);
            
            setMovies(dataMovies);
            setShows(dataShows);

            //set genres
            setGenres(await Fetch_Genres());
        })();
      
    }, [])
    

    return (
        
       <section className='w-full relative py-5'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

                <div className='px-0 sm:px-4 md:px-8'>
                    <h2 className='text-xl sm:text-2xl font-medium'>Trending</h2>
                </div>

                <div className="w-full py-8">

                    {/* Movies */}
                    <div className='w-full h-auto relative px-8 sm:px-10 md:px-12 mb-10'>

                        {/* Custom arrows */}
                        <FontAwesomeIcon
                            icon={faChevronLeft}
                            className="custom-prev-movie absolute left-0 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl md:text-[40px] text-white shadow cursor-pointer z-10"
                        />

                        <FontAwesomeIcon
                            icon={faChevronRight}
                            className="custom-next-movie absolute right-0 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl md:text-[40px] text-white shadow cursor-pointer z-10"
                        />

                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation={{
                                nextEl: '.custom-next-movie',
                                prevEl: '.custom-prev-movie',
                            }}
                            spaceBetween={20}
                            allowTouchMove={true}
                            breakpoints={{
                                0: {
                                    slidesPerView: 1,
                                },
                                480: {
                                    slidesPerView: 2,
                                },
                                768: {
                                    slidesPerView: 3,
                                },
                                1024: {
                                    slidesPerView: 4,
                                },
                            }}
                        >
                            {
                                displayMovies.map(row => (
                                    <SwiperSlide key={row.id}>
                                        <div>
                                            <span
                                                onClick={() =>
                                                    navigate(
                                                        `/movie/${slugify(row.title)}`,
                                                        { state: { id: row.id } }
                                                    )
                                                }
                                                className='cursor-pointer block'
                                            >
                                                <img
                                                    src={`${IMAGE_PATH}${row.poster_path}`}
                                                    className="w-full aspect-[2/3] object-cover rounded-lg"
                                                    alt={row.title}
                                                />

                                                <h3 className='mt-2 text-sm sm:text-base font-medium'>
                                                    {row.title}
                                                </h3>
                                            </span>

                                            <p className="text-gray-400 text-xs mt-1">
                                                {row.genre_ids
                                                    .slice(0, 3)
                                                    .map(id => genres[id])
                                                    .filter(Boolean)
                                                    .join(" • ")
                                                }
                                            </p>
                                        </div>
                                    </SwiperSlide>
                                ))
                            }

                            {/* Last Slide */}
                            <SwiperSlide>
                                <div
                                    className="
                                        aspect-[2/3]
                                        flex
                                        justify-center
                                        items-center
                                        bg-gray-100
                                        hover:bg-gray-300
                                        transition-colors
                                        duration-300
                                        ease-in-out
                                        rounded-lg
                                        cursor-pointer
                                    "
                                    onClick={() =>
                                        navigate(`/all`, {
                                            state: { type: "movie" }
                                        })
                                    }
                                >
                                    <h2 className='text-black font-medium'>
                                        See All
                                    </h2>
                                </div>
                            </SwiperSlide>
                        </Swiper>

                    </div>

                    {/* Shows */}
                    <div className='w-full h-auto relative px-8 sm:px-10 md:px-12'>

                        {/* Custom arrows */}
                        <FontAwesomeIcon
                            icon={faChevronLeft}
                            className="custom-prev-show absolute left-0 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl md:text-[40px] text-white shadow cursor-pointer z-10"
                        />

                        <FontAwesomeIcon
                            icon={faChevronRight}
                            className="custom-next-show absolute right-0 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl md:text-[40px] text-white shadow cursor-pointer z-10"
                        />

                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation={{
                                nextEl: '.custom-next-show',
                                prevEl: '.custom-prev-show',
                            }}
                            spaceBetween={20}
                            allowTouchMove={true}
                            breakpoints={{
                                0: {
                                    slidesPerView: 1,
                                },
                                480: {
                                    slidesPerView: 2,
                                },
                                768: {
                                    slidesPerView: 3,
                                },
                                1024: {
                                    slidesPerView: 4,
                                },
                            }}
                        >
                            {
                                displayShows.map(row => (
                                    <SwiperSlide key={row.id}>
                                        <div>
                                            <span
                                                onClick={() =>
                                                    navigate(
                                                        `/tv/${slugify(row.name)}`,
                                                        { state: { id: row.id } }
                                                    )
                                                }
                                                className='cursor-pointer block'
                                            >
                                                <img
                                                    src={`${IMAGE_PATH}${row.poster_path}`}
                                                    className="w-full aspect-[2/3] object-cover rounded-lg"
                                                    alt={row.name}
                                                />

                                                <h3 className='mt-2 text-sm sm:text-base font-medium'>
                                                    {row.name}
                                                </h3>
                                            </span>

                                            <p className="text-gray-400 text-xs mt-1">
                                                {row.genre_ids
                                                    .slice(0, 3)
                                                    .map(id => genres[id])
                                                    .filter(Boolean)
                                                    .join(" • ")
                                                }
                                            </p>
                                        </div>
                                    </SwiperSlide>
                                ))
                            }

                            {/* Last Slide */}
                            <SwiperSlide>
                                <div
                                    className="
                                        aspect-[2/3]
                                        flex
                                        justify-center
                                        items-center
                                        bg-gray-100
                                        hover:bg-gray-300
                                        transition-colors
                                        duration-300
                                        ease-in-out
                                        rounded-lg
                                        cursor-pointer
                                    "
                                    onClick={() =>
                                        navigate(`/all`, {
                                            state: { type: "tv" }
                                        })
                                    }
                                >
                                    <h2 className='text-black font-medium'>
                                        See All
                                    </h2>
                                </div>
                            </SwiperSlide>

                        </Swiper>
                    </div>

                </div>
            </div>
        </section>
        
        
    )
}

export default Trending
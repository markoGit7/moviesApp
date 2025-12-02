import React, {useState, useEffect} from 'react'
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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
            <div className='w-[1200px] max-w-full px-5 mx-auto'>
                <div className='px-[50px]'>
                    <h2 className='text-2xl font-medium'>Trending</h2>
                </div>


                <div className="w-full py-8">
                    <div className='w-full h-auto relative px-[50px] mb-10'>
                        {/* Custom arrows */}
                        <FontAwesomeIcon icon={faChevronLeft} className="custom-prev-movie absolute left-0 top-1/2 -translate-y-1/2 text-white shadow text-[40px]" ></FontAwesomeIcon>
                        <FontAwesomeIcon icon={faChevronRight} className="custom-next-movie absolute right-0 top-1/2 -translate-y-1/2 text-white shadow text-[40px]"></FontAwesomeIcon>

                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation={{
                            nextEl: '.custom-next-movie',
                            prevEl: '.custom-prev-movie',
                            }}
                            
                            spaceBetween={30}
                            slidesPerView={4}
                            allowTouchMove={false}
                            className=""
                        >
                            {
                                displayMovies.map(row => (
                                    <SwiperSlide>
                                        <div>
                                            <span onClick={() => navigate(`/movie/${slugify(row.title)}`, { state: { id: row.id } })} className='cursor-pointer'>
                                                <img src={`${IMAGE_PATH}${row.poster_path}`} className="w-full h-64 object-cover"/>
                                                <h3>{row.title}</h3>
                                            </span>
                                            
                                            <p className="text-gray-400 text-xs">
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
                                <div className="h-64 flex justify-center items-center bg-gray-100 hover:bg-gray-300 transition-colors duration-300 ease-in-out rounded cursor-pointer" onClick={() => navigate(`/all`, { state: { type: "movie" } })}>
                                    <h2 className='text-black font-medium'>
                                        See All
                                    </h2>
                                </div>
                            </SwiperSlide>
                        </Swiper>

                    </div>
                    
                    <div className='w-full h-auto relative px-[50px]'>
                        {/* Custom arrows */}
                        <FontAwesomeIcon icon={faChevronLeft} className="custom-prev-show absolute left-0 top-1/2 -translate-y-1/2 text-white shadow text-[40px]"></FontAwesomeIcon>
                        <FontAwesomeIcon icon={faChevronRight} className="custom-next-show absolute right-0 top-1/2 -translate-y-1/2 text-white shadow text-[40px]"></FontAwesomeIcon>

                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation={{
                            nextEl: '.custom-next-show',
                            prevEl: '.custom-prev-show',
                            }}
                            
                            spaceBetween={30}
                            slidesPerView={4}
                            allowTouchMove={false}
                            className=""
                        >
                            {
                                displayShows.map(row => (
                                    <SwiperSlide>
                                        <div>
                                            <span onClick={() => navigate(`/tv/${slugify(row.name)}`, { state: { id: row.id } })} className='cursor-pointer'> 
                                                <img src={`${IMAGE_PATH}${row.poster_path}`} className="w-full h-64 object-cover"/>
                                                <h3>{row.name}</h3>
                                            </span>
                                            
                                            <p className="text-gray-400 text-xs">
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
                                <div className="h-64 flex justify-center items-center bg-gray-100 hover:bg-gray-300 transition-colors duration-300 ease-in-out rounded cursor-pointer" onClick={() => navigate(`/all`, { state: { type: "tv" } })}>
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
import React, {useState, useEffect} from 'react'
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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
                <h2>Trending</h2>


                <div className="w-full py-8">
                    <div className='w-full h-auto relative'>
                        {/* Custom arrows */}
                        <button className="custom-prev-movie absolute -left-10 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow">
                            ←
                        </button>
                        <button className="custom-next-movie absolute -right-10 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow">
                            →
                        </button>

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
                                            <span onClick={() => navigate(`/movie/${slugify(row.title)}`, { state: { id: row.id } })}>
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
                                <h2 className='w-full h-full flex justify-center items-center' onClick={() => navigate(`/all`, { state: { type: "movie" } })}>
                                    See All
                                </h2>
                            </SwiperSlide>
                        </Swiper>

                    </div>
                    
                    <div className='w-full h-auto relative'>
                        {/* Custom arrows */}
                        <button className="custom-prev-show absolute -left-10 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow">
                            ←
                        </button>
                        <button className="custom-next-show absolute -right-10 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow">
                            →
                        </button>

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
                                            <span onClick={() => navigate(`/tv/${slugify(row.name)}`, { state: { id: row.id } })}>
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
                                <h2 className='w-full h-full flex justify-center items-center' onClick={() => navigate(`/all`, { state: { type: "tv" } })}>
                                   See All
                                </h2>
                            </SwiperSlide>

                        </Swiper>
                    </div>
                </div>
            </div>
        </section>
        
        
    )
}

export default Trending
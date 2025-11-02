import React, {useState, useEffect, useRef} from 'react'
import { useNavigate } from "react-router-dom";

import {recommedationMoviesByID, Genres} from '../api/movies.js'

//Swiper
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';

//function for slugifying
function slugify(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function RecomendedMovies({movie_id}) {
    const [movies, setMovies] = useState(null);
    const [genres, setGenres] = useState(FetchGenres() || {});
    const [noRelated, setNoRelated] = useState(false);
    const swiperRef = useRef(null);

    const navigate = useNavigate();

    async function FetchGenres() {//Fetching {moviesGenres, showsGenres} from the TMDB api
        const { movieGenres, showsGenres } = await Genres();


        const removeDuplicates = {};
        
        [...movieGenres,...showsGenres].forEach(row => removeDuplicates[row.id] = row.name);
        
        return removeDuplicates;

    }

    useEffect(() => {//fetching movies
        
        (async () => {
            const result = await recommedationMoviesByID(movie_id);
            const mostFamous_Existing_7 = result.results.sort((a, b) => b.popularity - a.popularity).filter(row => row.poster_path !== null).slice(0, 8);
            console.log('related: ', mostFamous_Existing_7);
            setMovies(mostFamous_Existing_7);

            console.log('Recomendations Movies', mostFamous_Existing_7);
            //no results
            if(result.results.length === 0) setNoRelated(true);

            //get genres
            setGenres(await FetchGenres());
        })();
      
    }, [movie_id]);

    useEffect(() => {//setting Slider to slide 0
        if (swiperRef.current) {
            swiperRef.current.slideTo(0, 0); // slideTo(index, speed)
        }
    }, [movies]);
    
    if(noRelated) return(<div>No Recomended Found</div>)
       
    
    return (
        <section className='w-full relative py-5'>
            <div className='w-[1200px] max-w-full px-5 mx-auto'>
                <h2 className='text-2xl'>Recommended</h2>
                <div className='w-full h-auto relative'>
                    {/* Custom arrows */}
                    <button className="custom-rec-prev-movie absolute -left-10 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow">
                        ←
                    </button>
                    <button className="custom-rec-next-movie absolute -right-10 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow">
                        →
                    </button>

                    <Swiper
                        modules={[Navigation, Pagination]}
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        navigation={{
                        nextEl: '.custom-rec-next-movie',
                        prevEl: '.custom-rec-prev-movie',
                        }}
                        
                        spaceBetween={30}
                        slidesPerView={4}
                        allowTouchMove={false}
                        className=""
                    >
                        {
                           movies && movies.map(row => (
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
                            <h2 className='w-full h-full flex justify-center items-center'>See All</h2>
                        </SwiperSlide>
                    </Swiper>

                </div>
            </div>
        </section>
    )
}

export default RecomendedMovies
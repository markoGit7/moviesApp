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

//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight  } from "@fortawesome/free-solid-svg-icons";

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
    
    if(noRelated) {
        return;
    }
       
    
    return (
        <section className='w-full relative py-5'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

                <h2 className='text-lg sm:text-xl md:text-2xl mb-4 sm:mb-5'>
                    Recommended
                </h2>

                <div className='w-full relative px-2 sm:px-4 lg:px-6'>

                    {/* Custom arrows */}
                    <FontAwesomeIcon
                        icon={faChevronLeft}
                        className="custom-rec-prev absolute left-0 top-1/2 -translate-y-1/2 text-white shadow text-xl sm:text-2xl lg:text-[25px] z-10"
                    />

                    <FontAwesomeIcon
                        icon={faChevronRight}
                        className="custom-rec-next absolute right-0 top-1/2 -translate-y-1/2 text-white shadow text-xl sm:text-2xl lg:text-[25px] z-10"
                    />

                    <Swiper
                        modules={[Navigation, Pagination]}
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        navigation={{
                            nextEl: '.custom-rec-next',
                            prevEl: '.custom-rec-prev',
                        }}

                        spaceBetween={16}
                        allowTouchMove={true}

                        breakpoints={{
                            0: {
                                slidesPerView: 1.2,
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
                            movies && movies.map(row => (
                                <SwiperSlide key={row.id}>
                                    <div className="px-1">

                                        <span
                                            onClick={() =>
                                                navigate(`/movie/${slugify(row.title)}`, {
                                                    state: { id: row.id }
                                                })
                                            }
                                            className="cursor-pointer block"
                                        >

                                            <img
                                                src={`${IMAGE_PATH}${row.poster_path}`}
                                                className="w-full aspect-[2/3] object-cover rounded-lg"
                                            />

                                            <h3 className="text-sm sm:text-base mt-2">
                                                {row.title}
                                            </h3>

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

                    </Swiper>

                </div>
            </div>
        </section>
    );
}

export default RecomendedMovies
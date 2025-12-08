import React, {useEffect, useState} from 'react'
import { useNavigate } from "react-router-dom";
import {TodayReleased, Genres} from '../api/movies.js'

//imported animation
import { motion, AnimatePresence } from 'framer-motion';


const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';

//function for slugifying
function slugify(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function HeroSection() {
    const [todayMovies, setTodayMovies] = useState(null);
    const [todayShows, setTodayShows] = useState(null);
    const [activeTab, setActiveTab] = useState('movies');
    const [genres, setGenres] = useState({});

    const navigate = useNavigate();

    const handleTabs = (type) => setActiveTab(type);

    const handleNavigation = (Row_title, Row_id) => {
        const title = Row_title;
        const ID = Row_id;
        console.log('Show Title', title);
        if(activeTab === 'movies') {
            navigate(`/movie/${slugify(title)}`, { state: { id: ID } });
        } else {
            navigate(`/tv/${slugify(title)}`, { state: { id: ID } });
        }
    }

    async function FetchGenres() {//Fetching {moviesGenres, showsGenres} from the TMDB api
        const { movieGenres, showsGenres } = await Genres();


        const removeDuplicates = {};
        
        [...movieGenres,...showsGenres].forEach(row => removeDuplicates[row.id] = row.name);
        
        return removeDuplicates;
    
    }

    useEffect(() => {
        
        (async () => {//fetching data from api
            const {movies , shows} = await TodayReleased();

            const todayDay = new Date().getDate();
            
            const Three_Popular_Movies_Today = movies.results.sort((a, b) => b.popularity - a.popularity).filter(row => row.poster_path !== null && Number(row.release_date.split('-')[2]) === todayDay).slice(0, 3);
            const Three_Popular_Shows_Today = shows.results.sort((a, b) => b.popularity - a.popularity).filter(row => row.poster_path !== null && Number(row.first_air_date.split('-')[2]) === todayDay).slice(0, 3); 
            
            setTodayMovies(Three_Popular_Movies_Today);
            setTodayShows(Three_Popular_Shows_Today);

            setGenres(await FetchGenres());
        })();
        
    }, []);

    
    const content = activeTab === 'movies' ? todayMovies : todayShows
    
    return (
        <section className='w-full h-auto relative py-5'>
            <div className='w-[1200px] max-w-full px-5 mx-auto'>
                {/* Navigators */}
                <div className="flex gap-x-5 justify-center mb-7">
                    <button className={`p-2 transition-colors min-h-11 rounded-lg cursor-pointer min-w-30 ${activeTab === 'movies' ? 'bg-red-500 font-semibold' : 'bg-white/50 font-normal'}`} onClick={() => handleTabs('movies')}>Movies</button>
                    <button className={`p-2 transition-colors min-h-11  rounded-lg cursor-pointer min-w-30 ${activeTab === 'shows' ? 'bg-red-500 font-semibold' : 'bg-white/50 font-normal'}`} onClick={() => handleTabs('shows')}>Shows</button>
                </div>

                {/* Animated Cards */}
                <div className="flex justify-center -mx-3">
                    <AnimatePresence mode="wait">
                        {content &&
                        content.map((row, index) => (
                            <motion.div
                                key={row.id + activeTab}
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: index === 1 ? 1 : 0.85,
                                    flexBasis: index === 1 ? "40%" : "30%",
                                }}
                                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="px-3"
                            >

                                <div className='w-full relative overflow-hidden'>

                                    <div className='relative cursor-pointer' onClick={() => handleNavigation((row.title || row.name), row.id)}>
                                        {/* Image */}
                                        <img
                                            src={`${IMAGE_PATH}${row.poster_path}`}
                                            alt=""
                                            className="rounded-lg shadow-lg object-cover "
                                        />

                                        {/* Released Today Badge */}
                                        <div className="absolute top-2 left-0 bg-red-600 text-xs font-semibold px-2 py-1 rounded-tr-md rounded-br-md shadow-md">
                                            Released Today
                                        </div>

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
                                            <span className="text-sm font-semibold">View Details</span>
                                        </div>
                                    </div>

                                    {/* Deatils */}
                                    <div>

                                        <p className="text-gray-400 text-xs">
                                            {row.genre_ids
                                                .slice(0, 3)
                                                .map(id => genres[id])
                                                .filter(Boolean)
                                                .join(" • ")
                                            }
                                        </p>

                                        <h2 className='text-lg'>{row.title || row.name}</h2>
                                        
                                    </div>


                                </div>

                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
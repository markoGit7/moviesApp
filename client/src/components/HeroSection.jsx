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
        <section className="w-full h-auto relative py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Navigators */}
                <div className="flex flex-wrap gap-3 justify-center mb-7">
                    <button
                        className={`p-2 transition-colors min-h-11 rounded-lg cursor-pointer min-w-[120px] ${
                            activeTab === "movies"
                                ? "bg-red-500 font-semibold"
                                : "bg-white/50 font-normal"
                        }`}
                        onClick={() => handleTabs("movies")}
                    >
                        Movies
                    </button>

                    <button
                        className={`p-2 transition-colors min-h-11 rounded-lg cursor-pointer min-w-[120px] ${
                            activeTab === "shows"
                                ? "bg-red-500 font-semibold"
                                : "bg-white/50 font-normal"
                        }`}
                        onClick={() => handleTabs("shows")}
                    >
                        Shows
                    </button>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="wait">
                        {content &&
                            content.map((row, index) => (
                                <motion.div
                                    key={row.id + activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className={`
                                        w-full
                                        ${
                                            index === 1
                                                ? "lg:scale-105"
                                                : "lg:scale-95"
                                        }
                                    `}
                                >
                                    <div className="w-full relative overflow-hidden">

                                        <div
                                            className="relative cursor-pointer group"
                                            onClick={() =>
                                                handleNavigation(
                                                    (row.title || row.name),
                                                    row.id
                                                )
                                            }
                                        >
                                            {/* Image */}
                                            <img
                                                src={`${IMAGE_PATH}${row.poster_path}`}
                                                alt={row.title || row.name}
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    shadow-lg
                                                    object-cover
                                                    aspect-[2/3]
                                                "
                                            />

                                            {/* Released Today Badge */}
                                            <div className="absolute top-2 left-0 bg-red-600 text-xs font-semibold px-2 py-1 rounded-tr-md rounded-br-md shadow-md">
                                                Released Today
                                            </div>

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="text-sm font-semibold">
                                                    View Details
                                                </span>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="pt-3">
                                            <p className="text-gray-400 text-xs sm:text-sm">
                                                {row.genre_ids
                                                    .slice(0, 3)
                                                    .map(id => genres[id])
                                                    .filter(Boolean)
                                                    .join(" • ")}
                                            </p>

                                            <h2 className="text-base sm:text-lg font-semibold mt-1">
                                                {row.title || row.name}
                                            </h2>
                                        </div>

                                    </div>
                                </motion.div>
                            ))}
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
}

export default HeroSection
import React, {useState, useEffect} from 'react'

import { useParams, useLocation, useNavigate } from "react-router-dom";

//import API
import {searchContent} from '../api/movies.js'

//images
import Background from '../assets/browse_page/browse_bg.png'

//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";


//TMDB image Path
const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';

//function for slugifying
function slugify(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function Browse() {

    const [input, setInput] = useState("");
    const [type, setType] = useState("multi");
    const [suggestions, setSuggestions] = useState(null);

    const navigate = useNavigate();

    const handleNavigation = (e) => {//sending info to search
        e.preventDefault();


        navigate(`/browse/search`, { state: { type: type, query: input } });
    };

    const suggest = async(str) => {
        const result = await searchContent(str, type, 1);

        const howManyDisplayed = type === 'multi' ? 2 : 4;

        console.log("now I will display you suggestions: ", howManyDisplayed);

        const Five_Popular_Movies = result.results.filter(col => col.poster_path !== null && (col?.media_type ? col.media_type === 'movie' : true)).sort((a, b) => b.popularity - a.popularity).slice(0, howManyDisplayed);

        const Five_Popular_Shows = result.results.filter(col => col.poster_path !== null && (col?.media_type ? col.media_type === 'tv' : true)).sort((a, b) => b.popularity - a.popularity).slice(0, howManyDisplayed);

        let final = [];

        if(type === 'movie') {
            final = [...Five_Popular_Movies];
        } else if(type === 'tv') {
            final = [...Five_Popular_Shows]
        } else {
            final = [...Five_Popular_Movies, ...Five_Popular_Shows];
        }

        setSuggestions(final);
    };

    const handleSelected_Navigation = (arr) => {
        const t = arr?.media_type ? arr.media_type : type; 

        navigate(`/${t}/${slugify(arr.title || arr.name)}`, { state: { id: arr.id } });
    }

    useEffect(() => {// Removing local Storage from /search

        //remove 
        localStorage.removeItem("searchPrevVals");
        
    }, []);
    

    useEffect(() => {
        if(input.trim() === '') {
            setSuggestions(null);
            return;
        };

        suggest(input);
    }, [input, type]);
    

    return (
        <section
            className="w-full min-h-[100dvh] bg-cover bg-center relative overflow-hidden"
            style={{ backgroundImage: `url(${Background})` }}
        >

            {/* Back Arrow */}
            <FontAwesomeIcon
                icon={faChevronLeft}
                className="absolute text-2xl sm:text-3xl md:text-4xl z-[70] top-3 left-3 text-white cursor-pointer"
                onClick={() => navigate('/')}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full z-30 relative">

                <div className="min-h-[100dvh] flex flex-col justify-center gap-y-8 md:gap-y-10">

                    {/* Title */}
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-center">
                            Discover Movies & TV Shows
                        </h1>
                    </div>

                    {/* Search */}
                    <div className="flex items-center">
                        <form
                            className="w-full text-center flex"
                            onSubmit={handleNavigation}
                        >

                            <select
                                onChange={(e) => setType(e.target.value)}
                                className="
                                    min-h-[50px]
                                    rounded-l-2xl
                                    rounded-r-none
                                    px-2
                                    shrink-0
                                "
                            >
                                <option value="multi">ALL</option>
                                <option value="movie">Movies</option>
                                <option value="tv">Shows</option>
                            </select>

                            <div className="relative flex-1 min-w-0">

                                <input
                                    type="text"
                                    onChange={(e) => setInput(e.target.value)}
                                    className="
                                        bg-white
                                        w-full
                                        h-[50px]
                                        outline-none
                                        ring-0
                                        px-3
                                        text-black
                                    "
                                />

                                {/* Auto Filter */}
                                <div
                                    className="
                                        absolute
                                        left-0
                                        top-full
                                        mt-2
                                        w-full
                                        max-h-[300px]
                                        overflow-y-auto
                                        bg-black/95
                                        rounded-lg
                                        z-50
                                    "
                                >
                                    {
                                        suggestions &&
                                        suggestions.map(col => (
                                            <div
                                                key={col.id}
                                                className="
                                                    w-full
                                                    flex
                                                    items-center
                                                    gap-3
                                                    p-3
                                                    cursor-pointer
                                                    hover:bg-white/10
                                                "
                                                onClick={() =>
                                                    handleSelected_Navigation(col)
                                                }
                                            >
                                                <img
                                                    src={`${IMAGE_PATH}${col.poster_path}`}
                                                    className="
                                                        w-14
                                                        h-14
                                                        sm:w-20
                                                        sm:h-20
                                                        object-cover
                                                        rounded
                                                        shrink-0
                                                    "
                                                />

                                                <p className="text-left text-sm sm:text-base">
                                                    {col.title || col.name}
                                                </p>
                                            </div>
                                        ))
                                    }
                                </div>

                            </div>

                            <button
                                type="submit"
                                className="
                                    w-[90px]
                                    sm:w-[100px]
                                    bg-red-500
                                    text-white
                                    px-3
                                    h-[50px]
                                    cursor-pointer
                                    rounded-r-2xl
                                    shrink-0
                                "
                            >
                                Search
                            </button>

                        </form>
                    </div>

                </div>
            </div>

            {/* Mask */}
            <div className="absolute inset-0 bg-black/75 z-10" />
        </section>
    );
}

export default Browse
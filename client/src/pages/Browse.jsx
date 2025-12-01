import React, {useState, useEffect} from 'react'

import { useParams, useLocation, useNavigate } from "react-router-dom";

//import API
import {searchContent} from '../api/movies.js'

//images
import Background from '../assets/browse_page/browse_bg.png'

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
    }, [input]);
    

    return (
        <section className='w-full h-[100dvh] bg-cover bg-center relative'  style={{ backgroundImage: `url(${Background})` }}>

            {/* Back Arrow */}

            <div className='w-[1200px] max-w-full px-5 mx-auto h-full z-30 relative'>
                <div className='flex h-full items-center'>
                    <form className='w-full text-center flex' onSubmit={handleNavigation}>
                        <select onChange={(e) => setType(e.target.value)} className="!rounded-l-2xl !rounded-r-0">
                            <option value="multi">ALL</option>
                            <option value="movie">Movies</option>
                            <option value="tv">Shows</option>
                        </select>
                        
                        <div className='relative inline-block grow-1'>
                            <input type='text' onChange={(e) => setInput(e.target.value)} className='bg-white w-full h-full outline-none ring-0 max-w-full p-[10px_7px] text-black'/>

                            {/* Auto Filter */}
                            <div className='absolute left-0 top-full pt-5 pl-3 h-[calc((100dvh-64px)/2)]'>
                                {
                                    suggestions && suggestions.map(col => (
                                        <div className='w-full flex mb-4 [&:last-of-type]:mb-0' onClick={() => handleSelected_Navigation(col)}>
                                            <img src={`${IMAGE_PATH}${col.poster_path}`} className='w-20 h-20 object-center object-cover cursor-pointer'/>
                                            <p>{col.title || col.name}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <button type='submit' className='w-[100px] max-w-full bg-red-500 text-white p-5 cursor-pointer rounded-r-2xl'>Search</button>
                    </form>
                </div>
            </div>

            {/* Mask */}
            <div className='absolute w-full h-full top-0 left-0 bottom-0 right-0 bg-black/75 z-10' />
        </section>
    )
}

export default Browse
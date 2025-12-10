import React,{useState, useEffect} from 'react'

//import header
import {Header} from '../components/Components_collection.js'

//Import Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass  } from "@fortawesome/free-solid-svg-icons";

//import navigation
import { useParams, useLocation, useNavigate } from "react-router-dom";

//TMDB api import
import {Genres} from '../api/movies.js'

// TMDB image path
const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';

function loadingDOM() {
    return(
        <div className="mt-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]"></div>
            </div>
            <p className="mt-3 text-gray-400">Searching in progress...</p>
        </div>
    )
}

//Function that gets all movies/shows genres
async function Fetch_Genres() {

    const { movieGenres, showsGenres } = await Genres();

    const merge = [...movieGenres, ...showsGenres];
    
    const removeDuplicates = {};
    
    merge.forEach(elm => {
        removeDuplicates[elm.id] = elm.name;
    });

    
    
    return removeDuplicates;
}


//function for slugifying
function slugify(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function AiSearch() {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(null);
    const [genres, setGenres] = useState({});

    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        setResults(null);
        setLoading(true);

        const myQueryMediaType  = (['tv', 'movie', 'show', 'cartoon'].find(word => query.toLowerCase().includes(word))) 
        const two_types = myQueryMediaType && (myQueryMediaType === "movie" || myQueryMediaType === "movies" ? 'movie' : 'tv');
        console.log('Type I search for: ', two_types);

        if(query.trim() === "") {
            console.log('The Query Cant be empty');
            setLoading(null);
            return; 
        }

        console.log('Searching movie/show that contains... ', {description: query});
        const start = performance.now();
        const response = await fetch(`${import.meta.env.VITE_REQUEST_PATH}myQuery`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                user_media_type: two_types
            }),
        })

        const data_from_server = await response.json();
        const popularity_based_data = data_from_server.sort((a, b) => b.popularity - a.popularity);
        const end = performance.now();
        console.log("Loading time: ", end - start, "ms");
        console.log('JSON File From myQuery ', data_from_server);
        setLoading(false);
        setResults(popularity_based_data || null);
    }


    useEffect(() => {
        
        (async() => {
            const api_genres = await Fetch_Genres();
            setGenres(api_genres);
        })();
    
      
    }, []);
    

    if(Boolean(genres) && Boolean(results)) {
        const first_result = results[0];
        console.log('first result from DB: ', first_result);

        const g = first_result?.genre_ids;
        console.log('genres: ', g);

    }

    return (
        <>
            <Header />
            <section className='w-full  py-5'>
                <div className='w-[1200px] max-w-full px-5 mx-auto'>
                    <h1 className='font-semibold text-4xl text-center mb-8'>AI Search</h1>

                    {/* Search */}
                    <form action="" className='w-[70%] mx-auto relative' onSubmit={handleSubmit}>
                        
                        <input type='text' onChange={(e) => setQuery(e.target.value)} placeholder='Describe what kind of movie/show your looking for...' className='bg-white text-black w-full rounded-lg p-[10px_40px_10px_10px] outline-none border-none'/>
                        
                        <button type='submit' className='absolute right-3 top-1/2 -translate-y-1/2 z-10 '>
                            <FontAwesomeIcon icon={faMagnifyingGlass }  className="text-xl cursor-pointer text-red-500 hover:text-red-500/70 transition-colors duration-300 ease-in-out drop-shadow-[-1px_1px_1px_#000]"/>
                        </button>
                    
                    </form>


                    {/* Loading */}
                    {
                        loading !== null && loading === true ? 
                        loadingDOM()
                        :
                        (
                            
                            loading === null ? (<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>Search For Results. Type Something In The Input Field</div>) 
                            : 
                            (results === null || results?.length < 1) && loading === false ? (<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>No Results Found...</div>) : (<div className=''>Similar Results Found</div>)
                            
                            
                        )
                    }

                
                    {/* Results */}
                    <div className="flex flex-row -mx-3 flex-wrap justify-center gap-y-6">
                        {
                            results && results.map(col => (
                                <div className='w-1/4 px-3'>
                                    <span className='relative' onClick={() => navigate(`/${col?.media_type}/${slugify(col.title)}`, { state: { id: col.id } })}>
                                        <img src={`${IMAGE_PATH}${col.poster_path}`} className="w-full h-64 object-cover"/>
                                        <h3>{col.title}</h3>
                                    
                                        {/* Badge */}

                                        {
                                            col?.media_type &&
                                            (
                                                <div 
                                                className={`
                                                    absolute top-0 right-0 m-2 px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg 
                                                    ${col.media_type === 'movie' ? 'bg-red-600' : 'bg-green-600'}
                                                `}
                                                >
                                                    {col.media_type === 'movie' ? 'MOVIE' : 'TV SHOW'}
                                                </div>
                                            )
                                        }
                                    
                                    
                                    </span>


                                    {/* genres */}
                                    <p className="text-gray-400 text-xs">
                                        {
                                            col.genre_ids
                                            .split(',')
                                            .slice(0, 3)
                                            .map(id => genres[id])
                                            .filter(Boolean)
                                            .join(" • ")
                                        }
                                    </p>
                                </div>
                            )) 
                        }
                    </div>
                
                </div>
            </section>
        </>
    )
}

export default AiSearch
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { popularMovies_or_Shows_Sorted } from "../api/movies.js";
import {Header} from '../components/Components_collection.js'

const IMAGE_PATH = "https://image.tmdb.org/t/p/w500";

function TrendingAll() {
    
    const location = useLocation();
    const type = location.state?.type || "movie";

    const [hasMore, setHasMore] = useState(true);
    const [items, setItems] = useState([]);
    const [sortType, setSortType] = useState("popularity.desc");
    const [sortActive, setSortActive] = useState(false);

    const [pagesRange, setPagesRange] = useState({
        min: 0,
        max: 4,
    });

   

    const [isNextPage, setIsNextPage] = useState(0);
    const [isFirstRun, setIsFirstRun] = useState(true);
    

    const handleSorting = async (val) => {
        //Reset
        setSortType(val);
        setSortActive(true);
    };

    const fetchData = async () => {
        const sort = sortType;
        const range = pagesRange;

        const response = [];
        console.log({range:range});
        for(let i = range.min; i < range.max; i++) {
            const request = await popularMovies_or_Shows_Sorted(type, i+1, sort);

            if (!request.results.length) continue;

            const normalize = request.results.map(row => ({...row, page: i+1}));

            response.push(...normalize);
        }

        if (!response.length) {
            setHasMore(false);
            return;
        }
        console.log(response);
        setItems(response);

    };

   

  
        
    function handleScrolling() {

        const scrollY = window.scrollY;
        const innerHeight = window.innerHeight;
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollEnd = scrollHeight - innerHeight
        
        console.log(scrollY);

        if ( 
            scrollY > (scrollEnd - 100) 
        ) {

            const range =  pagesRange;

            const obj = {
                min: range.min + 5,
                max: range.max + 5,
            };
            
            setPagesRange(obj);
            
        } else if (scrollY === 0) {
            
            const range =  pagesRange;

            const obj = {
                min: Math.max((range.min - 5), 0),
                max: Math.max((range.max - 5), 4),
            };
            
            setPagesRange(obj);
           
        }
        
    };

    useEffect(() => {

        if (!sortActive) return;

        setIsFirstRun(true);
        setPagesRange({
            min: 0,
            max: 4,
        });
        setIsNextPage(0);
        
        (async() => {
            await new Promise((resolve) => setTimeout(resolve, 0));
            fetchData();
        })();

        setSortActive(false);
        
    }, [sortType]);


    useEffect(() => {
        if (isFirstRun) {

            window.scrollTo({
                top: 50,
                left:0,
                behavior: 'smooth'
            });
            console.log('---Show Content OnLoad---')
            fetchData();

        } else {


            window.addEventListener('scroll', handleScrolling);
            return () => window.removeEventListener('scroll', handleScrolling);

        }

    },[isFirstRun, isNextPage]);


    useEffect(() => {
       
        if (isFirstRun) return;
      

        console.log(`This is read on page ${pagesRange.min}-${pagesRange.max}`);
        
        fetchData();

        window.scrollTo({
            top: 50,
            left: 0,
            behavior: 'smooth'
        });
        
    }, [pagesRange]);
    
    
    useEffect(() => {
        if(!items.length) return;
        
        if(!isFirstRun) {
            setIsNextPage(prev => prev+1);
        }

        setIsFirstRun(false);
    }, [items]);

    const getYear = (releaseDate) => releaseDate.split('-')[0];

    return (
        <>
            <Header />

            <section className="w-full min-h-screen !p-[32px_0_500px]  sm:py-10 bg-black text-white">
                <div className='w-[1200px] max-w-full px-4 sm:px-5 mx-auto'>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6 text-center">
                        All {type === "movie" ? "Movies" : "TV Shows"}
                    </h1>

                    {/* Sorting */}
                    <div className="mb-4 flex justify-center sm:justify-end">
                        <select
                            value={sortType}
                            onChange={(e) => handleSorting(e.target.value)}
                            className="w-full sm:w-auto bg-slate-800 border border-slate-600 text-white px-3 py-2 rounded text-sm sm:text-base"
                        >
                            <option value="popularity.desc">Most Popular</option>
                            <option value="popularity.asc">Least Popular</option>
                            <option value={`${type === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc'}`}>
                                Newest to Oldest
                            </option>
                            <option value={`${type === 'movie' ? 'primary_release_date.asc' : 'first_air_date.asc'}`}>
                                Oldest to Newest
                            </option>
                            <option value="vote_count.desc">Most Rated</option>
                        </select>
                    </div>

                    {/* Content Grid */}
                    <div
                        id="trendingAll_Content_Parent"
                        className="
                            grid 
                            grid-cols-2 
                            sm:grid-cols-3 
                            md:grid-cols-4 
                            lg:grid-cols-5 
                            gap-3 sm:gap-4 
                            overflow-y-auto overflow-x-hidden 
                            pr-1
                        "
                    >
                        {items.map(col => (
                            <Link
                                key={col.id}
                                to={`/${type}/${col.title || col.name}`}
                                state={{ id: col.id }}
                                className="group relative"
                            >
                                {/* Year of release */}
                                <span className='absolute outline-gray-700 bg-gray-400 text-white rounded-2xl p-2 block min-w-15 text-sm top-1 left-1 text-center shadow-[1px,1px,3px, rgba(0,0,0,.15)]'>
                                    {getYear(col?.first_air_date || col?.release_date)}
                                </span>

                                <img
                                    src={`${IMAGE_PATH}${col.poster_path}`}
                                    alt={col.title || col.name}
                                    className="
                                        w-full 
                                        h-[220px] sm:h-[260px] md:h-[280px] lg:h-[300px] 
                                        object-cover 
                                        rounded-lg sm:rounded-xl 
                                        transition-transform duration-300 
                                        group-hover:scale-[1.03]
                                    "
                                />
                                <p className="text-center text-xs sm:text-sm text-gray-300 truncate mt-2">
                                    {col.title || col.name}
                                </p>
                            </Link>
                        ))}
                    </div>

                    {/* Load More */}
                    
                </div>
            </section>
        </>
    );
}

export default TrendingAll;

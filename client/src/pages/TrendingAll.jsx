import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { popularMovies_or_Shows_Sorted } from "../api/movies.js";
import {Header} from '../components/Components_collection.js'

const IMAGE_PATH = "https://image.tmdb.org/t/p/w500";

function TrendingAll() {
    const location = useLocation();
    const type = location.state?.type || "movie";

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [items, setItems] = useState([]);
    const [sortType, setSortType] = useState("popularity.desc");

    const handleSorting = async (val) => {
        //Reset
        setItems([]);
        setPage(1);
        setHasMore(true);
        setSortType(val);

        console.log(`Sorting to: `, val, 'Data: ', await popularMovies_or_Shows_Sorted(type, 1, val));
        await new Promise((resolve) => setTimeout(resolve, 0));
        fetchData(1, val);
    }

    const fetchData = async (p, sort) => {
        const result = await popularMovies_or_Shows_Sorted(type, p, sort);
        
        if (!result?.results?.length) {
            setHasMore(false);
            return;
        }
        
        setItems((prev) => {
            //merge Data
            const newItems = [...prev, ...result.results];

            //Remove duplicates
            const uniqueItems = Array.from(new Map(newItems.map(item => [item.id, item])).values());

            //remove poster_path null Data
            const filteredItems = uniqueItems.filter(item => item.poster_path !== null);
            
            return filteredItems;
        });

        console.log("Trending All Fetch: ", result);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        setItems([]);
        setPage(1);
        setHasMore(true);
        fetchData(1, sortType);
    }, [type]);


   

    return (
        <>
            <Header />

            <section className="w-full min-h-screen py-6 sm:py-10 bg-black text-white">
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
                            max-h-[70vh] sm:max-h-[1000px] 
                            overflow-y-auto overflow-x-hidden 
                            pr-1
                        "
                    >
                        {items.map(col => (
                            <Link
                                key={col.id}
                                to={`/${type}/${col.title || col.name}`}
                                state={{ id: col.id }}
                                className="group"
                            >
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
                    {hasMore && (
                        <div className="w-full flex justify-center mt-8 sm:mt-10">
                            <button
                                onClick={() => {
                                    const next = page + 1;
                                    setPage(next);
                                    fetchData(next, sortType);
                                }}
                                className="
                                    px-5 sm:px-6 
                                    py-2 
                                    text-black 
                                    bg-white 
                                    hover:bg-gray-300 
                                    rounded
                                    text-sm sm:text-base
                                "
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default TrendingAll;

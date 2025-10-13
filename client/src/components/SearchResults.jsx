import React, {useEffect, useState} from 'react'
import {searchMovies, searchShows, searchAll} from '../api/movies'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';
let prevQuery = '';

function SearchResults({searchQuery}) {

    const query = searchQuery;

    const [movies, setMovies] = useState([]);
    const [shows, setShows] = useState([]);
    const [type, setType] = useState('shows');
    const [totalPages, setTotalPages] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);


    useEffect(() => {

        async function Fetch() {
            
            if(type === 'movies') {

                const result = await searchMovies(query, currentPage);

                setMovies(result.results);
                setTotalPages(result.total_pages);


            } else if(type === 'shows') {

                const result = await searchShows(query, currentPage);

                setShows(result.results);
                setTotalPages(result.total_pages);

            } else {
                const result = await searchAll(query, currentPage);

                const moviesStore = [];
                const showsStore = [];

                result.results.forEach(elm => {
                    if(elm.media_type === 'tv') {
                        showsStore.push(elm);
                    } else if(elm.media_type === 'movie') {
                        moviesStore.push(elm);
                    }
                });

                setMovies(moviesStore);
                setShows(showsStore);
                setTotalPages(result.total_pages);
            }

        }
        
        if(query) Fetch();

    }, [query, currentPage]);

    console.log(shows);
    if(query !== prevQuery) {
        setCurrentPage(1);
    }
    
    prevQuery = query;
    


    useEffect(() => {//calling pagination

        if(totalPages <= 0) {
            return;
        }

        Pages_Generator();

    }, [totalPages, currentPage]);

    
    function Pages_Generator() {//creating pagination
        let start = 1;

        if(currentPage > 6) {
            start = currentPage - 5;
        }
        
        let end = currentPage > 6 ? currentPage + 4 : 10;

        if(totalPages < 10) {
            end = totalPages;
        }

        if(currentPage + 4 >= totalPages) {
            start = ((totalPages - 4) - 5) <= 0 ? 1 : (totalPages - 4) - 5;
            end = totalPages;
        }

        const PageArr = [];

        while(start <= end) {
            PageArr.push(start);
            start++;
        }

        setPagination(PageArr);
    }
    
    

    return (
        <>
            {
                totalPages > 0 ?
                <>
                    <div>Total Pages: {totalPages}</div>
                    <div>Current Page: {currentPage}</div>
                </>
                :
                null
            }

            {/* Movies Section */}
            {movies.length > 0? <h1 style={{textAlign:'center'}}>🍿 Movies</h1> : null}

            <div style={{width:'100%', display:'flex', flexWrap:'wrap', rowGap:'5px', justifyContent:'center'}}>
                {
                    movies.map(movie => (
                        <div style={{width:'25%', height:'auto', padding:'5px', display:`${movie.poster_path ? 'block' : 'none'}`}}> 
                            <img src={`${IMAGE_PATH}${movie.poster_path}`} alt="" style={{width:'100%', height:'500px', objectFit:'cover', objectPosition:'center center'}} />
                        </div>
                    ))
                }
            </div>

            {/* Shows Section */}
            {shows.length > 0? <h1 style={{textAlign:'center'}}>📺 Shows</h1> : null}
            
            <div style={{width:'100%', display:'flex', flexWrap:'wrap', rowGap:'5px', justifyContent:'center'}}>
                {
                    shows.map(show => (
                        <div style={{width:'25%', height:'auto', padding:'5px', display:`${show.poster_path ? 'block' : 'none'}`}}> 
                            <img src={`${IMAGE_PATH}${show.poster_path}`} alt="" style={{width:'100%', height:'500px', objectFit:'cover', objectPosition:'center center'}} />
                        </div>
                    ))
                }
            </div>
            
            <div> 
                {
                    pagination ? 
                    
                    pagination.map(numb => (
                        <span style={{padding:'0 5px', fontSize:'16px', cursor:'pointer', color:`${currentPage === numb ? 'blue' : 'black'}`}} onClick={() => setCurrentPage(numb)}>{numb}</span>
                    ))
                    :
                    null
                }
            </div>
        </>
    )
}

export default SearchResults
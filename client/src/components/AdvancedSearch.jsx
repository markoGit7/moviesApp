import React, {useEffect, useState} from 'react'
import {
    searchAll, 
    searchMovies, 
    searchShows, 
    popularMovies_and_Shows, 
    popularMovies_or_Shows,
    Genres,
    popularMovies_and_Shows_Category,
    popularMovies_Category,
    popularShows_Category
} from '../api/movies'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';

let prevTitle = '';

function AdvancedSearch() {

    const [title, setTitle] = useState('');
    const [movies, setMovies] = useState([]);
    const [shows, setShows] = useState([]);
    const [type, setType] = useState('all');
    const [genre, setGenre] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState([]);
    const [TotalPages, setTotalPages] = useState(0);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentSelectedYear, setCurrentSelectedYear] = useState(null);
    const [allYears, SetAllYear] = useState([]);
    const [myCustomPages, setCustomPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [collectAll, setCollectAll] = useState([]);
    const [genreLoaded, setGenreLoaded] = useState(false);
    const [noContentFound, setNoContentFound] = useState(false);

    
    //setting the years select 2025 - 1900
    const handle_Year_Change = (e) => {
        setCurrentSelectedYear(Number(e.target.value));
    };

    const set_Amount_For_Years = (arr) => {
        const updatedYear = allYears.map(yr => ({...yr, amount: 0}));
        
        updatedYear.forEach(yr => {
            

            arr.forEach(r_d => {
                if(Number(r_d.release_date.split('-')[0]) === yr.y) yr.amount++; 
            });

        });

        SetAllYear(updatedYear);

    }

    const handle_Type_Change = (e) => {
        setType(e.target.value);
    };

    const handleSelectedGenre = (genreID) => {
        
        const skipEmptyAmount = genre.find(g => g.id === genreID).amount
        
        if(skipEmptyAmount === 0) return;
        
        setSelectedGenre(prev => {

            //on the clicked categrie set genre.amount to 0
            
            if (!prev.includes(genreID)) return [...prev, genreID];


            return prev;
        });
    };

    function recreatePages(fetchAll) {
        let onePage = [];
        const mainArr =[];

        fetchAll.length <= 20 ? 
        mainArr.push([...fetchAll]) 
        : 
        fetchAll.forEach((p, indx) => {
            onePage.push(p);

            if(onePage.length === 20) {
                mainArr.push([...onePage]);
                onePage = [];
            }

            if(fetchAll.length - 1 === indx && onePage.length < 20) {
                mainArr.push([...onePage]);
            }
        });

        return mainArr;
    }


    function Pages_Generator() {//creating pagination
        let start = 1;

        if(currentPage > 6) {
            start = currentPage - 5;
        }
        
        let end = currentPage > 6 ? currentPage + 4 : 10;

        if(TotalPages < 10) {
            end = TotalPages;
        }

        if(currentPage + 4 >= TotalPages) {
            start = ((TotalPages - 4) - 5) <= 0 ? 1 : (TotalPages - 4) - 5;
            end = TotalPages;
        }

        const PageArr = [];

        while(start <= end) {
            PageArr.push(start);
            start++;
        }

        setPagination(PageArr);
    }


    async function getGenre() {

        const { movieGenres, showsGenres } = await Genres();

        const merge = [...movieGenres, ...showsGenres];
        
        const removeDuplicates = {};
        
        merge.forEach(elm => {
            removeDuplicates[elm.id] = elm.name;
        });

        const final = [];
        
        for(const g in removeDuplicates) {
            final.push({'name':removeDuplicates[g], 'id':Number(g), 'amount': 0});
        }
        
        return final;
    }

    function Type_Variations() {//function to find out the type of content
        this.Search_Option = function () {
            switch (type) {
                case 'movie': onlyMovies();
                    break;
                case 'tv': onlyShows();
                    break;
                default: searchMovies_and_Shows();
                    break;
            }
        };

        this.Auto_Option = function () {
            switch (type) {
                case 'movie': moviesORshows();
                    break;
                case 'tv': moviesORshows();
                    break;

                default: moviesANDshows();
                    break;
            }
        };
    }


    function splitContent(page) {//function that splits movies apart from shows on multi search
        const movie = [], show = [];
       
        page.forEach(cell => {
            
            if(cell.media_type === 'movie') {
                movie.push(cell);
            } else if(cell.media_type === 'tv') {
                show.push(cell);
            }

        })

        return [movie, show];
    }

    async function autoCategories() {//function that fetches movies and shows based on a category
        let updateGenreAmount = [];
        switch (type) {
            case 'movie':

                updateGenreAmount = await Promise.all(
                    genre.map(async g => {
                        try {
                        const results = await popularMovies_Category(g.id, 1);
                        const totalResults = results.total_results;
                        
                        return { ...g, amount: totalResults };
                        } catch (err) {
                        console.error(`Error fetching category for genre ${g.id}`, err);
                        return { ...g, amount: 0 };
                        }
                    })
                );

                break;
            case 'tv':  

                updateGenreAmount = await Promise.all(
                    genre.map(async g => {
                        try {
                        const results = await popularShows_Category(g.id, 1);
                        const totalResults = results.total_results;
                        
                        return { ...g, amount: totalResults };
                        } catch (err) {
                        console.error(`Error fetching category for genre ${g.id}`, err);
                        return { ...g, amount: 0 };
                        }
                    })
                );

                break;
            default:
                updateGenreAmount = await Promise.all(
                    genre.map(async g => {
                        try {
                        const { movieCategory, showsCategory } = await popularMovies_and_Shows_Category(g.id, 1);
                        const sum = (movieCategory.total_results || 0) + (showsCategory.total_results || 0);
                        return { ...g, amount: sum };
                        } catch (err) {
                        console.error(`Error fetching category for genre ${g.id}`, err);
                        return { ...g, amount: 0 };
                        }
                    })
                );
        
                break;
        }

        setGenre(updateGenreAmount);
        
    }

    async function onSearchCategories() {
        let updateGenreAmount = [];
        switch (type) {
            case 'movie':
                break;
            case 'tv':
                break;
            default:
                updateGenreAmount = await Promise.all(
                    genre.map(async g => {
                        let moviesTotalResults = 0, showsTotalResults = 0, totalResults = 0, totalCells = 0; 
                        for(let i = 1; i <= 3; i++) {
                            const result = await searchAll(title, i);
                            const [captureMovies, captureShows] = splitContent(result.results);

                            const Movies_Category_Filter = captureMovies.filter(cell => {
                                const genreIDSEmpty = cell.genre_ids === null || cell.genre_ids.length === 0;

                                return !genreIDSEmpty && cell.genre_ids.includes(g.id);
                            });

                            const Shows_Category_Filter = captureShows.filter(cell => {
                                const genreIDSEmpty = cell.genre_ids === null || cell.genre_ids.length === 0;

                                return !genreIDSEmpty && cell.genre_ids.includes(g.id);
                            });


                            totalResults = result.total_results;
                            totalCells += result.results.length;

                            moviesTotalResults += Movies_Category_Filter.length || 0;
                            showsTotalResults += Shows_Category_Filter.length || 0;
                            //filter for movies and shows of g.id
                            //colecting length of the filter
                        }
                        const category = moviesTotalResults + showsTotalResults;
                        const sum = Math.floor((category / totalCells) * totalResults);

                        console.log(`${g.name}: `, sum);
                        return {...g, amount: sum}
                    })
                );
                break;
        }

        // console.log(updateGenreAmount);
        setGenre(updateGenreAmount);
    }

    async function selectedCategories(arr) {//function that fetches movies and shows based on selected category

        const arrToTxt = arr.join(",");

        let result = null;
        let noContent = null;
        let Existing_Null_Element = false;
        switch (type) {
            case 'movie':
                result = await popularMovies_Category(arrToTxt, 1);
                setMovies(result.results);

                Existing_Null_Element = result.results.length === 1 && result.results[0].poster_path === null ? true : false;
                noContent = result.results.length < 1 || Existing_Null_Element;

                //update Total Pages
                setTotalPages(result.total_pages > 0 && !noContent ? result.total_pages : 0);

                //update if there no content
                if(noContent) {
                    setNoContentFound(true);
                } else {
                    setNoContentFound(false);
                }

                setLoading(false);

                break;
            case 'tv':  
                result = await popularShows_Category(arrToTxt, 1);
                setShows(result.results);

                noContent = result.results.length < 1;
                
                //update Total Pages
                setTotalPages(result.results.length > 0 ? result.total_pages : 0);

                //update if there no content
                if(noContent) {
                    setNoContentFound(true);
                } else {
                    setNoContentFound(false);
                }

                setLoading(false);
                break;
            default:
                
                let {movieCategory, showsCategory} = await popularMovies_and_Shows_Category(arrToTxt, 1)
                const higherTotalPages = movieCategory.total_pages > showsCategory.total_pages ? movieCategory.total_pages : showsCategory.total_pages;
                
                //Checking if the last element in movies is not empty
                if(movieCategory.results.length === 1) {
                    movieCategory.results[0].poster_path === null ? movieCategory = [] : null; 
                }
                //Checking if the last element in shows is not empty
                if(showsCategory.results.length === 1) {
                    showsCategory.results[0].poster_path === null ? showsCategory = [] : null;
                }

                //When movies and shows are empty, there's nothing to be shown
                noContent = movieCategory.results.length < 1 && showsCategory.results.length < 1;

                setMovies(movieCategory.results);
                setShows(showsCategory.results);

                
                //update Total Pages
                setTotalPages(noContent ? 0 : higherTotalPages);

                //update if there no content
                if(noContent) {
                    setNoContentFound(true);
                } else {
                    setNoContentFound(false);
                }

                setLoading(false);

                break;
        }

        
    }

    async function selectedGenrePageChange(page) {
        const arrToTxt = selectedGenre.join(",");
        let result = null;
        switch (type) {
            case 'movie': 
                result = await popularMovies_Category(arrToTxt, page);
                setMovies(result.results);

                setLoading(false);
                break;
            case 'tv': 
                result = await popularShows_Category(arrToTxt, page);
                setShows(result.results);

                setLoading(false);
                break;
            default:
                const {movieCategory, showsCategory} = await popularMovies_and_Shows_Category(arrToTxt, page);
                setMovies(movieCategory.results);
                setShows(showsCategory.results);

                setLoading(false);
                break;
        }
    }

    //Storage for movies and shows functions
    async function moviesORshows() {

        const result = await popularMovies_or_Shows(type, 1);
        
        autoCategories();

        if(type === 'movie') {
            setMovies(result.results);
        } else {
            setShows(result.results); 
        }

        //loaded
        setLoading(false);

        //updates
        const pagesOverLimit = result.total_pages > 500 ? 500 : result.total_pages;
        setTotalPages(pagesOverLimit);
        
    }

    async function moviesANDshows() {
        const result = await popularMovies_and_Shows(1);
        
        
        autoCategories();

        //split the movies and shows
        const [captureMovies, captureShows] = splitContent(result.results);

        setMovies(captureMovies);
        setShows(captureShows);

        //loaded
        setLoading(false);

        //updates
        const pagesOverLimit = result.total_pages > 500 ? 500 : result.total_pages;
        setTotalPages(pagesOverLimit);
    }

    async function onlyMovies() {
        const result = await searchMovies(title, 1);

        setCollectAll(await fetchingAll(result.total_pages, 'searchMovies'));

        setMovies(result.results);

        //loaded
        setLoading(false);

        //updates
        const pagesOverLimit = result.total_pages > 500 ? 500 : result.total_pages;
        setTotalPages(pagesOverLimit);
        
    }

    async function onlyShows() {
        const result = await searchShows(title, 1);

        setCollectAll(await fetchingAll(result.total_pages, 'searchMovies'));

        setShows(result.results);

        //loaded
        setLoading(false);

        //updates
        const pagesOverLimit = result.total_pages > 500 ? 500 : result.total_pages;
        setTotalPages(pagesOverLimit);
        
    }

    async function searchMovies_and_Shows() {
        const result = await searchAll(title, 1);

        //update Genres
        onSearchCategories();

        //split the movies and shows
        const [captureMovies, captureShows] = splitContent(result.results);

        setMovies(captureMovies);
        setShows(captureShows);

        //loaded
        setLoading(false);

        //updates
        const pagesOverLimit = result.total_pages > 500 ? 500 : result.total_pages;
        setTotalPages(pagesOverLimit);
        
    }

    //Reseting parameters
    function Reset() {
        setMovies([]);
        setShows([]);

        setCurrentPage(1);
        setTotalPages(0);
        setSelectedGenre([]);
        setNoContentFound(false);
        //Setting genre amount to 0
        if(genre.length > 0) {
            const resetAmount = genre.map(g => ({ ...g, amount: 0 }))
            setGenre(resetAmount);
        }
    }


    useEffect(() => {

        const currentYear = new Date().getFullYear();

        const years = Array.from(
            { length: currentYear - 1900 },
            (_, i) => ({ y: currentYear - i, amount: 0 })
        );

        SetAllYear(years);
    }, []);



    //Loading the genre options
    useEffect(() => {
        async function loadGenre() {
            setGenre(await getGenre());
            setGenreLoaded(true);
        }
        loadGenre();
    }, []);
      
        
    useEffect(() => {
        if(!genreLoaded) return;

        Reset();
        setLoading(true);

        if(title.trim() === '') {
            new Type_Variations().Auto_Option();
            return;
        }

        new Type_Variations().Search_Option();
    }, [title, genreLoaded]);
    
    
    useEffect(() => { // pagination UseEffect
        if(TotalPages <= 0) return;

        Pages_Generator();
    }, [TotalPages, currentPage]);


    useEffect(() => {
        
        if(!genreLoaded) return;

        Reset();
        setLoading(true);


        if(title.trim() === '') {
            new Type_Variations().Auto_Option();
            return;
        }
        
        new Type_Variations().Search_Option();
        
    }, [type, genreLoaded]);


    useEffect(() => {
        
        if(!genreLoaded) return;

        if(TotalPages < 1) {
            return;
        }

    

        setLoading(true);

        const fatching = async() => {
            let res = null;

            if(title.trim() === '') {

                switch (type) {
                    case 'movie': res = await popularMovies_or_Shows(type, currentPage);  
                        break;
                    case 'tv': res = await popularMovies_or_Shows(type, currentPage);
                        break;
                    default: res = await popularMovies_and_Shows(currentPage);
                        break;
                }   

            } else {

                switch (type) {
                    case 'movie': res = await searchMovies(title, currentPage);  
                        break;
                    case 'tv': res = await searchShows(title, currentPage);
                        break;
                    default: res = await searchAll(title, currentPage);
                        break;
                }

            }

            return res;
        
        };

        const uploadRes = async() => {
            const result = await fatching();


            switch (type) {
                case 'movie': setMovies(result.results);
                    break;
                case 'tv': setShows(result.results);
                    break;
                default:
                    //split the movies and shows
                    const [captureMovies, captureShows] = splitContent(result.results);

                    setMovies(captureMovies);
                    setShows(captureShows);

                    break;
            }

            setLoading(false);
        }


        if(selectedGenre.length > 0) {
           selectedGenrePageChange(currentPage);
           return;
        }

        uploadRes();
        
    }, [currentPage, genreLoaded]);

    useEffect(() => {
        if(selectedGenre.length <= 0 && collectAll.length <= 0) return;

        //start Loading
        setLoading(true);

        selectedCategories(selectedGenre);
        
        //Everythime a new categorie has being selected, go to page 1
        setCurrentPage(1);
        
    }, [selectedGenre]);
    




    
    
    


    return (
        <>
            <div>Total Pages: {TotalPages}</div>
            <div>Current page: {currentPage}</div>
            <section style={{display:'flex'}}>
                {
                    !loading && !noContentFound ?
                
                    (<div style={{display:'flex', flexDirection:'column', rowGap:'70px', order:'2'}}>
                        {/* Movies */}
                        <div style={{display: movies.length > 0 ? 'flex' : 'none', flexWrap:'wrap', margin:'0 -10px', rowGap:'10px', justifyContent:'center'}}>
                            {
                                movies.map(movie => (
                                    <div style={{width:'25%', display:`${movie.poster_path ? 'block' : 'none'}`, padding:'0 10px', position:'relative'}}>
                                        <span style={{position:'absolute', background:'orange', color:'white', top:'5px', left:'10px'}}>{movie.release_date}</span>
                                        <img src={`${IMAGE_PATH}${movie.poster_path}`} style={{width:'100%', height:'400px', objectFit:'cover', objectPosition:'center center'}}/>
                                    </div>
                                ))
                            }
                        </div>
                        <div style={{display:'block', width:'100%', height:'3px', background:'black'}}></div>
                        {/* Shows */}
                        <div style={{display:`${shows.length > 0 ? 'flex' : 'none'}`, flexWrap:'wrap', margin:'0 -10px', rowGap:'10px', justifyContent:'center'}}>
                            {   
                                shows.map(show => (
                                    <div style={{width:'25%', display:`${show.poster_path ? 'block' : 'none'}`, padding:'0 10px'}}>
                                        <img src={`${IMAGE_PATH}${show.poster_path}`} style={{width:'100%', height:'400px', objectFit:'cover', objectPosition:'center center'}}/>
                                    </div>
                                ))
                            }
                        </div>
                    </div>)

                    :
                    (<div style={{display:'flex', flexDirection:'column', rowGap:'70px', order:'2', fontSize:'24px', justifyContent:'center', alignItems:'center', width:'100%', height:'100dvh'}}>
                        {
                            loading ? (<span>Loading...</span>) : (<span>No Results Found</span>)
                        }
                    </div>)
                }

                <aside style={{order:'1', padding:'0 10px 0 0'}}>
                    <div id='selected'>
                        <span style={{display:`${title !== ''?'inline-block' : 'none'}`,background:'green', marginRight:'10px'}}>{title}</span>
                        <span style={{display:`${type !== ''?'inline-block' : 'none'}`, background:'green', marginRight:'10px'}}>{type}</span>
                        <div style={{display:`${selectedGenre.length > 0?'inline-block' : 'none'}`, marginRight:'10px'}}>
                            {
                              selectedGenre.map(g => (
                                <span style={{marginRight:'5px', background:'green'}}>{genre.find(n => n.id === g).name}</span>
                              ))  
                            }
                        </div>
                    </div>

                    <lable>Title:</lable>
                    <input type='text' onBlur={(e) => setTitle(e.target.value)} />
                    
                    <lable>Type:</lable>
                    <select name="" id="type" onChange={handle_Type_Change}>
                        <option value="all">All</option>
                        <option value="movie">Movies</option>
                        <option value="tv">Shows</option>
                    </select>
                    
                    <div id='genre'>
                        {
                            genre.map(g => (
                                <div onClick={() => handleSelectedGenre(g.id)}>{g.name}      | {g.amount}</div>
                            ))
                        }
                    </div>

                    <lable>Year:</lable>
                    <select name="" id="year" onChange={handle_Year_Change}>
                        <option value="all">All Years</option>
                            {
                                allYears.map(row => (
                                    <option value={row.y}>{row.y} ({row.amount})</option>
                                ))
                            }
                    </select>
                </aside>
            </section>

            <div> 
                {
                    pagination && TotalPages > 0 ? 
                    
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

export default AdvancedSearch
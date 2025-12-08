import React, {useEffect, useState, useMemo} from 'react'

// Import Loaction/Navigation
import { useParams, useLocation, useNavigate } from "react-router-dom";

//import API
import {
   searchContent,
   Genres,
   discoverContent,
   Languages
} from '../api/movies';

//Import Components
import {ContentDisplay, SceletonLoading} from './Components_collection.js';


//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faMagnifyingGlass, faChevronLeft } from "@fortawesome/free-solid-svg-icons";


//function for fetching genres
async function Fetch_Genres() {

    const { movieGenres, showsGenres } = await Genres();

    const merge = [...movieGenres, ...showsGenres];
    
    const removeDuplicates = {};
    
    merge.forEach(elm => {
        removeDuplicates[elm.id] = elm.name;
    });

    const final = [];

    for(const g in removeDuplicates) {
        
        const inMovie = Boolean(movieGenres.find(col => col.id === Number(g)));

        const inTv = Boolean(showsGenres.find(col => col.id === Number(g)));

        final.push({id:g, name:removeDuplicates[g], movie:inMovie, tv:inTv});
    }
    
    return final;
};


async function Fetch_Languages() {
    const result = await Languages();
    console.log(result);
}



function AdvancedSearch() {

    //localstorage call
    const storageJSON = localStorage.getItem("searchPrevVals");
    const storageParse = JSON.parse(storageJSON);

    console.log('stored values ', storageParse);
    
    //getting type and query from browse
    const location = useLocation();
    let q = null
    let t = null

   if (!storageParse) {
        q = location.state?.query || "";
        t = q === "" && location.state?.type === "multi" || !location.state?.type
            ? "movie"
            : location.state?.type;
    }
    console.log(`From Browse values: `, {title: q, type: t});

    //variables
    const [title, setTitle] = useState(q || storageParse?.query || "");
    const [type, setType] = useState(t || storageParse?.media_type || "movie");
    const [year, setYear] = useState(storageParse?.currentYear || null);
    const [selectedGenre, set_selectedGenre] = useState(storageParse?.currentGenre || null);
    const [page, setPage] = useState(storageParse?.currentPage || 1);
    const [totalPages, setTotalPages] = useState(null);
    const [genres, setGenres] = useState(null);
    const [genersLoading, setGenersLoading] = useState(true);
    const [languages, setLanguages] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(storageParse?.currentlanguage || "en");

    const navigate = useNavigate();

    const changesTracker = {
        currentPage: storageParse?.currentPage || null,
        query: storageParse?.query || null,
        type: storageParse?.media_type || null,
    };

    //variables for skeletonLoading
    const [isLoading, setLoading] = useState(false);
    const [skeletonsAmount, setSkeletonAmounts] = useState(null);

    //array varibale
    const [item, setItem] = useState([]);
    


    const handleInputSubmit = (str) => {//Setting up title name, and other on blur and Enter functionalitis

        if(str === "" && type === "multi") {
            setType("movie");
        }

        setTitle(str);

    }

    const storeCurrentValues = (query, media_type, currentPage, currentLanguage, currentYear, currentGenre) => {
        const arr = {
            query: query,
            media_type: media_type,
            currentPage: currentPage,
            currentlanguage: currentLanguage,
            currentYear: currentYear,
            currentGenre: currentGenre,
        }
        
        const str = JSON.stringify(arr);

        localStorage.setItem("searchPrevVals", str);
    }


    const fetching = async() => {
        
        let final = [];

        //set loading to true
        setLoading(true);
        
        if(title === "") {// fetching from discovery 
            
            //fetch
            const result = await discoverContent(type, year, selectedGenre, page, selectedLanguage);

            //set skeleton amounts
            setSkeletonAmounts(result.results.length);

            //filtering
            final = result.results.sort((a, b) => b.popularity - a.popularity).filter(col => col.poster_path !== null && col.poster_path !== undefined);

            //seting totalPages
            setTotalPages(result.total_pages);


        } else { // fetching from search
            const result = await searchContent(title, type, page);

            //set skeleton amounts
            setSkeletonAmounts(result.results.length);

            //filtering
            final = result.results.sort((a, b) => b.popularity - a.popularity).filter(col => col.poster_path !== null && col.poster_path !== undefined);
            
            //seting totalPages
            setTotalPages(result.total_pages);   

            //reset year and selected genre to default
            setYear(null);
            set_selectedGenre(null);
        }
       

        //remove loading
        setLoading(false);

        console.log('SELECTED YEAR: ', year);
        //save to localstorage
        storeCurrentValues(title, type, page, selectedLanguage, year, selectedGenre);

        console.log('Array: ', final);
        
        //getting array of content
        setItem(final);
      
    };

    const generateYears = () => {//function that generates Years
        let date = new Date;

        //initialise earliest to latest year
        let latestYear = date.getFullYear();
        let oldestYear = latestYear - 100;
        
        //fill the gaps from earliest to latest
        const yearsCollect = [];
        for(let i = oldestYear; i <= latestYear; i++) {
            yearsCollect.push(i);
        }

        //show from latest to earliest
        yearsCollect.sort((a, b) => b - a);

        return yearsCollect;
    }


    const handleTypeChange = (val) => {//function that handles the change of the type(all, movies, shows)
        
        //change the type to the selected value
        setType(val);


        //reset genres to default
        set_selectedGenre(null);
    }


    useEffect(() => {//Loading Genres
        const loadGenres_and_loadLanguages = async () => {
            const dataG = await Fetch_Genres();
            setGenres(dataG || []);

            const dataL = await Languages();
            const AZ_sort = dataL.sort((a, b) => 
                a.english_name.localeCompare(b.english_name)
            );

            setLanguages(AZ_sort || []);

            setGenersLoading(false);
        };

        loadGenres_and_loadLanguages();
        
    }, []);
    


    useEffect(() => {//dedecting input changes 

        if(genersLoading) return;
        
        console.log({
            action:'Important',
            type:`${storageParse?.media_type} === ${type}`,
            page: page,
        })
        
        const toPageOne = (
            storageParse?.query !== title || storageParse?.media_type !== type || 
            storageParse?.currentlanguage !== selectedLanguage || storageParse?.currentYear !== year || 
            storageParse?.currentGenre !== selectedGenre
        );

        if (page !== 1 && toPageOne ) {
            setPage(1);
        } else {
            fetching();
        }


    }, [title, type, year, selectedGenre, genersLoading, selectedLanguage]);


    const pagination = useMemo(() => {//Controling and adjusting the pagination

        let start = 1;
        let end = totalPages > 10 ? 10 : totalPages;

        //when page is 7
        if(page >= 7) {
            start = page - 5;
            end = page + 4 < totalPages ? page + 4 : totalPages;
        }

        //generatin pages
        const final = [];
        for(let i = start; i <= end; i++) {
            final.push(i);
        }
        
        return final;

    }, [page, totalPages]);

    useEffect(() => {// fetching on page change
        if(genersLoading) return;

        fetching();
        
    }, [page, genersLoading]);
    
    

    return (
        <>
            <section className='w-full  pt-5 pb-15'>
                <div className='w-[1200px] max-w-full px-5 mx-auto '>
                    {/* Controls */}
                    <div >
                        
                        <div className='flex mb-5 justify-between items-center -mx-2'>
                            <div className='flex gap-x-2 px-2'>
                                {/* Back arrow */}
                                <div className='rounded-lg border border-gray-500 p-2 grow-0 self-center'>
                                    <FontAwesomeIcon icon={faChevronLeft} className='text-xl  text-white cursor-pointer' onClick={() => navigate('/browse')}/>
                                </div>
                                {/* Input */}
                                <div className='inline-block relative w-[600px] max-w-full'>
                                    <input type='text' defaultValue={title} onKeyDown={(e) => e.key === 'Enter' ? handleInputSubmit(e.target.value) : null}  onBlur={(e) => handleInputSubmit(e.target.value)} placeholder='Search by title...' className='border-gray-500 w-full focus:border-gray-200 p-[12px_12px_12px_38px] border-1 rounded-lg outline-none text-lg'/>
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg  absolute left-3 top-1/2 -translate-y-1/2"/>
                                </div>
                            </div>

                            {/* Pages Count */}
                            <div className='text-lg text-gray-300 inline-block px-2'>
                                Total Pages: {totalPages} | Page: {page}
                            </div>
                        </div>
                        
                        {/* Filter Controls */}
                        <div class="flex space-x-4 mb-6">

                            <select id="type-filter" value={type} onChange={(e) => handleTypeChange(e.target.value)}  className="w-auto  border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 appearance-none">
                                <option value="multi" disabled={title === "" ? true : false}>Type: All</option>
                                <option value="movie">Movies</option>
                                <option value="tv">TV Shows</option>
                            </select>

                            <select id="genre-filter" value={selectedGenre || "all"} disabled={title ? true : false} onChange={(e) => set_selectedGenre(Number(e.target.value) || null)}  className={`w-48  border border-gray-700 ${title === "" ? '!text-white' : '!text-gray-500 !bg-gray-800'} text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 appearance-none`}>
                                <option value="all">Genres</option>
                                {
                                    genres && genres.map(col => (
                                        <option value={col.id} disabled={!col[type]}>{col.name}</option>
                                    ))
                                }
                            </select>
                            
                            <select id="year-filter" value={year || "all"} disabled={title ? true : false} onChange={(e) => setYear(Number(e.target.value) || null)} className={`w-auto  border border-gray-700 ${title === "" ? '!text-white' : '!text-gray-500 !bg-gray-800'} text-gray-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 appearance-none`}>
                                <option value="all">Year: All</option>
                                {
                                    generateYears().map(cell => (
                                        <option value={cell} >{cell}</option>
                                    ))
                                }
                            </select>

                            <select id="language-filter" value={selectedLanguage} disabled={title ? true : false} onChange={(e) => setSelectedLanguage(e.target.value)} className={`w-auto  border border-gray-700 ${title === "" ? '!text-white' : '!text-gray-500 !bg-gray-800'} text-gray-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 appearance-none`}>
                                {
                                    languages && languages.map(cell => (
                                        <option value={cell.iso_639_1} >{cell.english_name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    
                    {/* Content */}
                    {
                        isLoading  ?

                        (<SceletonLoading contnetAmount={skeletonsAmount} loading={isLoading}/>)
                        :
                        (<ContentDisplay array={item} type={type}/>)
                    
                    }
                
                </div>
                
            </section>
            
            {/* Pagination  */}
            <div className='p-[30px_0px_15px] text-center fixed bottom-0 left-0 w-full'>
                <div className='bg-gray-800 inline-block p-[5px_10px_5px_10px] rounded-full  drop-shadow-sm drop-shadow-black/70 '>
                    <div className='flex -mx-[5px] gap-x-[5px]'> 
                        <div className={`${page === 1 ? 'bg-gray-400 pointer-events-none cursor-default text-white/70' : 'bg-gray-500 pointer-events-auto cursor-pointer text-white'} px-[5px] rounded-l-full inline-flex justify-center items-center rounded-tr-lg rounded-br-lg`} onClick={() => setPage(prev => prev - 1 || 1)}>
                            <span className="inline-block mr-1">&lt;</span> Prev
                        </div>

                        {
                        totalPages  && 

                            pagination.map(numb => (
                                <span className={`rounded-lg min-w-9 min-h-9 p-1 cursor-pointer text-base inline-flex justify-center items-center ${page === numb ? 'bg-red-500' : 'bg-gray-500'}`} onClick={() => setPage(numb)}>{numb}</span>
                            ))

                        }
                        <div className={`${page === totalPages ? 'bg-gray-400 pointer-events-none cursor-default text-white/70' : 'bg-gray-500 pointer-events-auto cursor-pointer text-white' } px-[5px] rounded-r-full inline-flex justify-center items-center rounded-l-lg`} onClick={() => setPage(prev => prev + 1 < totalPages ? prev + 1 : totalPages)}>
                            Next <span className="inline-block ml-1">&gt;</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdvancedSearch
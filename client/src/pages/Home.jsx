import React, {useEffect} from 'react'
import {Header, Trending, HeroSection} from '../components/Components_collection'

function Home() {


    useEffect(() => {
        // If local storage contains previous search stored remove it
        const searchPrev = localStorage.getItem('searchPrevVals');
        if(searchPrev) localStorage.removeItem('searchPrevVals');
    }, []);
    

    return (
        <>
            <Header />
            <HeroSection />
            <Trending />

        </>
    )
}

export default Home
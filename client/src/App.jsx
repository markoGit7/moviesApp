import { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom";
import {AdvancedSearch, PageLoader} from './components/Components_collection.js'
import {Home, MovieDetails, ShowsDetails, TrendingAll, Browse, Liked} from './pages/Pages_collection.js'
function App() {
    
    return (
       
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:slug" element={<MovieDetails />} />
            <Route path="/tv/:slug" element={<ShowsDetails />} />
            <Route path="/all/" element={<TrendingAll />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/browse/search" element={<AdvancedSearch />} />
            <Route path="/liked" element={<Liked />} />
        </Routes>
  
    )
}

export default App

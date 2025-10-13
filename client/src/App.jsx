import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import {SearchResults, SearchBar, AdvancedSearch} from './components/Components_collection.js'
import {Home, MovieDetails} from './pages/Pages_collection.js'
function App() {
    

    return (
       
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:slug" element={<MovieDetails />} />
        </Routes>
  
    )
}

export default App

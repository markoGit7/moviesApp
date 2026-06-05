import { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom";
import {AdvancedSearch, PageLoader} from './components/Components_collection.js'
import {Home, MovieDetails, ShowsDetails, TrendingAll, Browse, Liked} from './pages/Pages_collection.js'
function App() {
    
    const [serverReady, setServerReady] = useState(false);

    useEffect(() => {

        const checkServer = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_REQUEST_PATH}health`
                );

                if (response.ok) {
                    setServerReady(true);
                }
            } catch (err) {
                console.log("Server not ready");
            }
        };

        checkServer();

    }, []);

    if(!serverReady) {
        return <PageLoader />
    }

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

import {React, useState, useEffect} from 'react'
import SearchResults from './SearchResults';

function SearchBar() {
    const [inputVal, setInput] = useState('');
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        setQuery(inputVal);
    };

    

    return (
        <>
            <input type="text" onChange={(e) => setInput(e.target.value)}/>
            <button type='submit' onClick={handleSearch}>Search</button>
            

            {query && <SearchResults searchQuery={query} />}
        </>
    )
}

export default SearchBar
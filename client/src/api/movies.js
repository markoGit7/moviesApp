//Movies search
// Searching by genre I need to type: https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}
const API_KEY = 'bc6d5157b1c8e44c82e59ab3da41bc44';
const PATH = 'https://api.themoviedb.org/3/';

//Create a function for this: https://api.themoviedb.org/3/discover/movie?api_key=bc6d5157b1c8e44c82e59ab3da41bc44&with_genres=12, to make the categories work diferently
//This for making the categories on searched options https://api.themoviedb.org/3/search/multi?api_key=YOUR_API_KEY&language=en-US&query=dragon&page=1&include_adult=false

export async function searchMovies(query, page) {
    const result = await fetch(`${PATH}search/movie?api_key=${API_KEY}&query=${query}&page=${page}`);

    return result.json();
};

export async function searchShows(query, page) {
    const result = await fetch(`${PATH}search/tv?api_key=${API_KEY}&query=${query}&page=${page}`);
    
    return result.json();
};

export async function searchAll(query, page) {
    const result = await fetch(`${PATH}search/multi?api_key=${API_KEY}&query=${query}&page=${page}`);

    return result.json();
};


export async function popularMovies_or_Shows(type, page) {
    const result = await fetch(`${PATH}${type}/popular?api_key=${API_KEY}&page=${page}`);

    return result.json();
};

export async function popularMovies_and_Shows(page) {
    const result = await fetch(`${PATH}trending/all/day?api_key=${API_KEY}&page=${page}`);

    return result.json();
};

export async function Genres() {

    const movieRes = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );

    const tvRes = await fetch(
        `https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}&language=en-US`
    );

    const movieGenres = (await movieRes.json()).genres;
    const showsGenres = (await tvRes.json()).genres;

    return {movieGenres, showsGenres};
};

//for categories
export async function popularMovies_and_Shows_Category(genreID, page) {
    
    const movieRes = await fetch(
        `${PATH}discover/movie?api_key=${API_KEY}&with_genres=${genreID}&page=${page}`
    );

    const tvRes = await fetch(
        `${PATH}discover/tv?api_key=${API_KEY}&with_genres=${genreID}&page=${page}`
    );

    const movieCategory = (await movieRes.json());
    const showsCategory = (await tvRes.json());

    return {movieCategory, showsCategory};
};

export async function popularMovies_Category(genreID, page) {
    
    const result = await fetch(
        `${PATH}discover/movie?api_key=${API_KEY}&with_genres=${genreID}&page=${page}`
    );

    return result.json();
};

export async function popularShows_Category(genreID, page) {
    
    const result = await fetch(
        `${PATH}discover/tv?api_key=${API_KEY}&with_genres=${genreID}&page=${page}`
    );


    return result.json();
};

//get Movie by ID

export async function movieByID(movie_id) {
    
    const result = await fetch(
        `${PATH}movie/${movie_id}?api_key=${API_KEY}&append_to_response=credits,images,videos,watch/providers`
    );


    return result.json();
};

//Movies search
// Searching by genre I need to type: https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}
const API_KEY = import.meta.env.VITE_API_KEY;
const PATH = 'https://api.themoviedb.org/3/';

//Create a function for this: https://api.themoviedb.org/3/discover/movie?api_key=bc6d5157b1c8e44c82e59ab3da41bc44&with_genres=12, to make the categories work diferently
//This for making the categories on searched options https://api.themoviedb.org/3/search/multi?api_key=YOUR_API_KEY&language=en-US&query=dragon&page=1&include_adult=false


export async function searchContent(query, type, page) {
    let url = `${PATH}search/${type}?api_key=${API_KEY}&query=${query}&page=${page}`;

    const result = await fetch(url);

    return result.json();
};


export async function discoverContent(type, year, genre, page, lan) {
    let urlDiscover = `${PATH}discover/${type}?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc`;

    if(year) {
        urlDiscover += type === 'movie' ? `&primary_release_year=${year}` : `&first_air_date_year=${year}`;
    }

    if(genre) {
        urlDiscover += `&with_genres=${genre}`;
    }

    if(lan) {
        urlDiscover +=`&with_original_language=${lan}`
    }


    const result = await fetch(urlDiscover);

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

//get languages
export async function Languages () {
  const response = await fetch(
    `https://api.themoviedb.org/3/configuration/languages?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data;
};

//get API by ID

export async function contentByID(api_id, api_type) {
    
    const result = await fetch(
        `${PATH}${api_type}/${api_id}?api_key=${API_KEY}&append_to_response=credits,images,videos,watch/providers`
    );


    return result.json();
};


//get episodes from season of a show
export async function episodesBySeason(show_id, selected_season) {
    const result = await fetch(
        `${PATH}tv/${show_id}/season/${selected_season}?api_key=${API_KEY}`
    );

    return result.json();
}

//get Recomended movies
export async function recommedationMoviesByID(movie_id) {
    
    const result = await fetch(
        `${PATH}movie/${movie_id}/recommendations?api_key=${API_KEY}&language=en-US`
    );


    return result.json();
};


//get Recomended shows
export async function recommedationShowsByID(show_id) {
    const result = await fetch(
        `${PATH}tv/${show_id}/recommendations?api_key=${API_KEY}&language=en-US`
    );

    return result.json();
};


//get today released movies and shows

export async function TodayReleased() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const start = yesterday.toISOString().split("T")[0];
    const end = tomorrow.toISOString().split("T")[0];

    const [moviesRes, showsRes] = await Promise.all([
        fetch(
            `${PATH}discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${start}&primary_release_date.lte=${end}`
        ),
        fetch(
            `${PATH}discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=${start}&first_air_date.lte=${end}`
        ),
    ]);


    const [movies, shows] = await Promise.all([
        moviesRes.json(),
        showsRes.json(),
    ]);


    return {movies, shows};
};


//Sorted Movies/Shows
export async function popularMovies_or_Shows_Sorted(type, page, sort_by) {
    const result = await fetch(`${PATH}discover/${type}?api_key=${API_KEY}&sort_by=${sort_by}&page=${page}`);

    return result.json();
};

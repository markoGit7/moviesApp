import {popularMovies_and_Shows} from '../client/src/api/movies.js'

export default async function fetch() {
    const data = [];

    for(let i = 1; i <= 20; i++) {
        const result = await popularMovies_and_Shows(i);

        result.results.forEach(col => {
            const id = col.id;
            const title = col.title || col.name;
            const overview = col.overview;
            const media_type = col.media_type;

            if(col.poster_path !== null) {

                data.push(
                    {
                        id: id,
                        title: title,
                        media_type: media_type,
                        overview: overview
                    }
                );

            } 

        })
    }
    
    return data;    
};

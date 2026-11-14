// Import global request
import request from "./globalRequests";

export default function ProviderLinks(id, type = 'movie', episode = null, season= null) {

    if (type === 'tv') {
        
        const src = [
            `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
            `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
        ];

        // const response = await request('http://localhost:3000/validSource', 'post', false, 'on', {src: src});
        
        return src[0];

    } else {

        const src = [
            `https://multiembed.mov/?video_id=${id}&tmdb=1`,
            `https://www.2embed.cc/embed/${id}`
        ]
        
        // const response = await request('http://localhost:3000/validSource', 'post', false, 'on', {src: src});

        return src[0];

    }

}
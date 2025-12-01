//import embedder
import { pipeline } from '@xenova/transformers';

//import select all function from db.js
import {SELECT_EVERYTHING} from './db.js';

const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

export async function getEmbedder(str) {
    let text = str;

    const output = await embedder(text);
    const outer = output.tolist();


    // The actual token embeddings are inside outer[0]
    const data = outer[0]; // <-- this is now [tokens][dims]

    // ✅ Average token embeddings
    const vector = data[0].map((_, dim) => {
        let sum = 0;
        for (let t = 0; t < data.length; t++) {
        sum += data[t][dim];
        }
        return sum / data.length;
    });

    return vector;
};



export async function Find_Closest_Match(description, type) {
    const userDescriptionVector =  await getEmbedder(description);
    const db_records = await SELECT_EVERYTHING(type);


    // 3. Compute similarity
    function cosineSimilarity(vecA, vecB) {
        const dot = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
        const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
        const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
        return dot / (magA * magB);
    }


    const records = db_records.map(r => ({
        id: r.id,
        title: r.title,
        media_type: r.media_type,
        poster_path: r.poster_path,
        genre_ids: r.genre_ids,
        popularity: r.popularity,
        vector: typeof r.vector === 'string' ? JSON.parse(r.vector) : r.vector
    }));

    const similarities = records.map(r => ({
        id: r.id,
        title: r.title,
        media_type: r.media_type,
        poster_path: r.poster_path,
        genre_ids: r.genre_ids,
        popularity: r.popularity,
        similarity: cosineSimilarity(userDescriptionVector, r.vector)
    }));

    // 4. Sort by similarity
    similarities.sort((a, b) => b.similarity - a.similarity);


    
    return similarities.slice(0, 20);
}
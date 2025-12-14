// Import dependencies
import { getEmbedder } from './embedder.js';
import "dotenv/config";

// DB connection
import pool from './dbConnect.js';

//import 
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.API_KEY;



const normalize = (t) => (t || "").trim().replace(/\\n/g, " ").replace(/\s+/g, " ").replace(/\\'/g, "'").replace(/\\"/g, '"');

// --- Main Migration Function ---
export async function Content_Migration(type = "movie") {


    // ---- Functions -----

    // --- Helper: Check if record exists ---
    async function recordExists(id, media_type) {
        const [rows] = await pool.query(
            `SELECT id FROM fetched WHERE id = ? AND media_type = ?`,
            [id, media_type]
        );
        return rows.length > 0;
    }

    // --- Helper: Detect changed overview ---
    async function detectChangedOverview(id, media_type, apiOverview) {
        const [rows] = await pool.query(
            `SELECT overview FROM fetched WHERE id = ? AND media_type = ?`,
            [id, media_type]
        );

        if (!rows.length) return true;


        const dbOverview = normalize(rows[0].overview);
        const apiClean = normalize(apiOverview);

        return dbOverview !== apiClean;
    }


    // --START: function starts from here

    console.log(`🚀 Starting migration for ${type === "movie" ? "Movies" : "Shows"}`);

    const TOTAL_PAGES = 500;
    
    const progress = [{
        page: null,
        current_api_record: null,
        total_api_records: null,
        action:"",
    }];


    for (let page = 1; page <= TOTAL_PAGES; page++) {
        const url = `https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.results?.length) continue;

        let index = 1;

        
        // -- Helper: Progress
        progress[0].page = page;
        progress[0].total_api_records = data.results.length;

        for (const col of data.results) {
            // --VARIABLES: api record variables
            const id = col.id;
            const media_type = type;
            const title = col.title || col.name;
            const overview = col.overview || "";
            const release_date = col.release_date || col.first_air_date || null;
            const genres_ids = col.genre_ids?.join(",") || "";
            const original_language = col.original_language || "";
            const popularity = col.popularity || 0;
            const poster_path = col.poster_path;
            

            //progress
            progress[0].current_api_record = index;

            // Skip if missing poster
            if (!poster_path) {
                
                //progress
                progress[0].action = `No action on api record with null poster_path of id ${id}`;
                console.log(`Page: ${progress[0].page}, Record: ${progress[0].current_api_record} / ${progress[0].total_api_records}, Action: ${progress[0].action}`);
                
                index++;
                
                continue;
            } 

            //--Helper: overview || title
            const notNullOverview = overview.trim().length < 1 ? title : overview;
            
            // Check if record exists
            const exists = await recordExists(id, media_type);
            let vector = null;
            let overviewChanged = null;

            //progress
            progress[0].action = 'Existing api record in DB only simply updated';

            // --STATEMENT: check if the api_col is in the db
            if (!exists) {
                
                vector = await getEmbedder(notNullOverview);

                //progress
                progress[0].action = `New record insert with id = ${id} AND media_type = ${media_type} + new "Vector"`;
            } else {
                // --DETERMIN: check if the api_col_overview is the same with the db_col_overview
                overviewChanged = await detectChangedOverview(id, media_type, notNullOverview);

                
                if (overviewChanged) {
                    vector = await getEmbedder(notNullOverview);

                    //progress
                    progress[0].action = `Existing api record with id = ${id} AND media_type = ${media_type} has new overview. Add the new api overview in the DB and create new vector for it`;
                }

            }


            // Insert / Update query
            const query = `
                INSERT INTO fetched(id, media_type, title, overview, release_date, genre_ids, original_language, popularity, poster_path, vector)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                overview = VALUES(overview),
                release_date = VALUES(release_date),
                genre_ids = VALUES(genre_ids),
                original_language = VALUES(original_language),
                popularity = VALUES(popularity),
                poster_path = VALUES(poster_path),
                vector = IF(VALUES(vector) IS NOT NULL, VALUES(vector), vector)
            `;

            try {
                await pool.query(query, [
                    id,
                    media_type,
                    title,
                    notNullOverview,
                    release_date,
                    genres_ids,
                    original_language,
                    popularity,
                    poster_path,
                    vector ? JSON.stringify(vector) : null,
                ]);
            } catch (error) {
                console.error(`❌ DB error for ID ${id}, type ${media_type}:`, error.message);
                
                continue; // skip this record but continue with others
            }

            //progress
            console.log(`Page: ${progress[0].page}, Record: ${progress[0].current_api_record} / ${progress[0].total_api_records}, Action: ${progress[0].action}`);
            
            index++;
        }


        // delay between page load 👇
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await delay(500);

    }

    console.log(`✅ ${type} migration complete.`);

    // I'll Need to see how to do it with logs.file

};

export async function updateDB() {
    // OBJECT: get all the records from DB into rows
    const [rows] = await pool.query(`SELECT * FROM fetched`);
    const log = [];
    let index = 1;
    console.log('fetching all db stores....');

    // LOOP: go through each record row for the DB
    for(const db_col of rows) {

        //read the record form db
        const db_col_id = db_col.id;
        const db_col_media_type = db_col.media_type;
        const db_col_overview = db_col.overview;
        

        log.push({
            request: '',
            api_record_exists:null,
            newVector: null,
            ofRecord: index,
            total_db_records: rows.length
        });

        const latestLogDataIndex = log.length - 1;
        
        log[latestLogDataIndex].request = `Find me API record with ID: ${db_col_id} AND media_type: ${db_col_media_type}.`
        //get the db record from api

        const result = await fetch(`https://api.themoviedb.org/3/${db_col_media_type}/${db_col_id}?api_key=${API_KEY}`);
        const data = await result.json();
    
        // --CHECK: data doesn't exists
        if(Boolean(data) === false) {
            log[latestLogDataIndex].api_record_exists = false;
            console.log(`DB Record: ${log[latestLogDataIndex].ofRecord} / ${log[latestLogDataIndex].total_db_records}. Record exists in api: ${log[latestLogDataIndex].api_record_exists}. Message: DB Record doesn't exists it the API any more`);
            index++;
            continue;
        }

        // --CHECK: data exists

        log[latestLogDataIndex].api_record_exists = true;

        // --VARIABLES: API variables
        const api_id = data.id;
        const api_title = data?.title || data?.name;
        const api_overview = data.overview.trim() === ""? api_title : data.overview;
        const api_release_date = data?.release_date || data?.first_air_date;
        const api_genre_ids = data.genre_ids?.join(",") || "";
        const api_original_language = data.original_language;
        const api_popularity = data.popularity;
        const api_poster_path = data.poster_path
        
        // --CONVERTER:
        const dbOverviewClean = normalize(db_col_overview);
        const apiOverivewClean = normalize(api_overview);

        let vector = null;

        // --FINDER: api_record overview has changes !== db_record overview
        if(dbOverviewClean !== apiOverivewClean) {
            //the api record overview has changed. Generate a new vector
            vector = getEmbedder(api_overview);

        }
        
        const vectorValue = Boolean(vector) ? JSON.stringify(vector) : null;

        log[latestLogDataIndex].newVector = Boolean(vectorValue) ? '✔' : '❌'


        //update to db
        const query = `
        UPDATE fetched
        SET 
            title = ?,
            overview = ?,
            release_date = ?,
            genre_ids = ?,
            original_language = ?,
            popularity = ?,
            poster_path = ?,
            vector = IF(? IS NOT NULL, ?, vector)
        WHERE id = ? AND media_type = ?
        `;

        try{
            await pool.query(query, [
                api_title,
                api_overview,
                api_release_date,
                api_genre_ids,
                api_original_language,
                api_popularity,
                api_poster_path,
                vectorValue,
                vectorValue,  // repeated because of IF(? IS NOT NULL, ?, vector)
                db_col_id,
                db_col_media_type
            ]);
        } catch (error) {
            console.error('Error message: ', error);
            continue;
        }
        
        console.log(`DB Record: ${log[latestLogDataIndex].ofRecord} / ${log[latestLogDataIndex].total_db_records}. Record exists in api: ${log[latestLogDataIndex].api_record_exists}. New Vector: ${log[latestLogDataIndex].newVector}.`);
        index++;
    }

}


export async function SELECT_EVERYTHING(type) {
    let rows = [];
    if(type === 'movie' || type === 'tv') {
        const [results] = await pool.query("SELECT * FROM fetched WHERE media_type = ?",[type]);
        rows = results;
    } else {
        const [results] = await pool.query(`SELECT * FROM fetched`);
        rows = results;
    } 
    
    return rows;
}

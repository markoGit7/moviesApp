import {connectDB} from './dbConnect.js'

const db = await connectDB();

// FUNCTION: verify if post(movie/show) is already liked
export async function checkLiked(user_id, post_id, media_type) {

    const query = `SELECT * FROM liked_post WHERE user_id = ? AND post_id = ? AND media_type = ?`;

    const [row] = await db.query(query, [user_id, post_id, media_type]);


    if(row.length > 0) return true;

    return false;
};

// FUNCTION: like a post(movie/show)
export async function Like(user_id, post_id, media_type) {

    const query = `SELECT * FROM liked_post WHERE user_id = ? AND post_id = ? AND media_type = ?`;

    const [row] = await db.query(query, [user_id, post_id, media_type]);


    if(row.length > 0) {
        //unlike
        await db.query(
            `DELETE FROM liked_post 
            WHERE user_id = ? AND post_id = ? AND media_type = ?`,
            [user_id, post_id, media_type]
        );

        //return liked = false
        return false;
    };

    //insert new record
    try{
        await db.query(
            `INSERT INTO liked_post (user_id, post_id, media_type)
            VALUES (?, ?, ?)`,
            [user_id, post_id, media_type]
        );
    } catch(error) {
        console.log(error);
    }
    


    //return liked = true
    return true;
};

// FUNCTION: track user likes count
export async function likesCountTrack(user_id) {

    const query = `SELECT COUNT(*) AS 'notSeen' FROM liked_post WHERE user_id = ? AND seen = false`;

    const [rows] = await db.query(query, [user_id]);

    return rows;
};


//everything that user has liked
export async function everyLiked(user_id) {

    const query = `SELECT * FROM liked_post WHERE user_id = ?`;

    const [rows] = await db.query(query, [user_id]);


    if(rows.length < 1) {
        return [];
    }

    // make unseen to 0 in the header heart
    await db.query(
        "UPDATE liked_post SET seen = TRUE WHERE user_id = ?",
        [user_id]
    );

    // Parse the data that user has liked
    const data = rows.map(db_col => {
        return [
            {
                post_id: db_col.post_id,
                media_type: db_col.media_type,
                like_date: new Date(db_col.like_date).toISOString().replace("T", " ").split(".")[0]
            }
        ]
    })
    return data;
};

//everything that user has liked
export async function DeleteLiked(user_id, arr) {
    const errors = [];
    const query = 'DELETE FROM liked_post WHERE user_id = ? AND post_id = ? AND media_type = ?'

    for(const col of arr) {
       
        try {

            await db.query(query,[user_id, col.post_id, col.media_type]);

        } 
        catch(error) {
            const err = {
                user_id: user_id,
                post_id: col.post_id,
                media_type: col.media_type,
                message: `${error}`
            }

            errors.push(err);

        }
    }
    
    if (errors.length > 0) {
        return { errors };
    }

    return { success: true };
};

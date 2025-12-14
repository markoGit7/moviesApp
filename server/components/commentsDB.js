// Buffer
import { Buffer } from "buffer";

// DB connection
import pool from './dbConnect.js';

//FUNCTION: add new comment to DB
export async function addComent(user_id, post_id, media_type, message) {
    const fb = {
        action: 'Adding new comment',
        status: null,
        message: "",
    }

    try {
        await pool.query(
            `INSERT INTO comments (user_id, post_id, media_type, message)
            VALUES (?, ?, ?, ?)`,
            [user_id, post_id, media_type, message]
        );

    } catch(error) {
        fb.status = 500;
        const err = `${error}`;
        fb.message = err;
        
        return fb;
    }

    fb.status = 200
    fb.message = "New comment sucessfully added!"

    return fb;
};

//FUNCTION: add new comment replie to DB
export async function addReply(user_id, post_id, media_type, message, replyOn_id) {
    const fb = {
        action: 'Adding new comment reply',
        status: null,
        message: "",
    }

    try {
        await pool.query(
            `INSERT INTO comments (user_id, post_id, media_type, message, parent_id)
            VALUES (?, ?, ?, ?, ?)`,
            [user_id, post_id, media_type, message, replyOn_id]
        );

    } catch(error) {
        fb.status = 500;
        const err = `${error}`;
        fb.message = err;
        
        return fb;
    }

    fb.status = 200
    fb.message = "New comment reply sucessfully added!"

    return fb;
};

//FUNCTION: add comment reaction to DB
export async function addReaction(user_id, post_id, media_type, comment_id, author, reaction) {

    const fb = {
        action: `Adding ${reaction === 'like' ? 'Like' : 'Dislike'} to comment: ${comment_id}, by author: ${author}`,
        status: null,
        message: "",
    }

    //convert author(user_name) to id from users table
    const [[author_id]] = await pool.query('SELECT id FROM users WHERE user_name = ?', [author]); 

    // Select to see if I have already reacted on the comment I've currently clicked on
    const [[r]] = await pool.query('SELECT reaction FROM comments_reactions WHERE user_id = ? AND post_id = ? AND media_type = ? AND comment_id = ? AND author_id = ?', [user_id, post_id, media_type, comment_id, author_id.id]);


    //Set variable, reacted = [{reaction}] from select || null
    const reacted = r?.reaction || null;//like


    //If reacted comes out with value
    if(reacted !== null) {
        //validate if now I have clicked the same value as reacted has. If yes Delete the reaction *(Double Click ==> Unselect)
        if(reaction === reacted){
            // delete row

            await pool.query('DELETE FROM comments_reactions WHERE user_id = ? AND post_id = ? AND media_type = ? AND comment_id = ? AND author_id = ? AND reaction = ?', [user_id, post_id, media_type, comment_id, author_id.id, reacted]);

            fb.action = `Deleting a row from comments_reactions because of double click on Comment: ${comment_id}, duble clicked on: ${reaction === 'like' ? 'Like' : 'Dislike'}`;
            fb.status = 204;
            fb.message = `You've sucessfully deleted ${reaction}`;

            return fb;
        } 

        //update reaction in DB with new value
        await pool.query('UPDATE comments_reactions SET reaction = ? WHERE user_id = ? AND post_id = ? AND media_type = ? AND comment_id = ? AND author_id = ? AND reaction = ?', [reaction, user_id, post_id, media_type, comment_id, author_id.id, reacted]);


        fb.action = `Updating the row from comments_reactions, reaction to: ${reaction} on commentNO: ${comment_id}`;
        fb.status = 200;
        fb.message = `You've sucessfully changed your reaction from: ${reacted} to: ${reaction}`;

        return fb;
    }

    
    //If no reacted was found then Insert a new value in the table with the reaction and the other values I have send here.
    try {
        await pool.query(
            `INSERT INTO comments_reactions (user_id, post_id, media_type, comment_id, author_id, reaction)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, post_id, media_type, comment_id, author_id.id, reaction]
        );

    } catch(error) {
        fb.status = 500;
        const err = `${error}`;
        fb.message = err;
        
        return fb;
    }


    fb.status = 200
    fb.message = `New ${reaction === 'like' ? "like" : 'dislike'} sucessfully added`;

    return fb;
    //*How will the liked disliked represent colors in the client????
};

//FUNCTION: select comments from DB
export async function getComments(user, post_id, media_type) {
    const fb = {
        action: 'Loading Comments',
        status: null,
        message: "",
    }

    const query = `
    SELECT 
        c.id,
        ANY_VALUE(c.message) AS message,
        ANY_VALUE(c.upload_date) AS upload_date,
        ANY_VALUE(u.user_name) AS user_name,
        ANY_VALUE(c.parent_id) AS parent_id,
        ANY_VALUE(u.profile_image) AS profile_image,
        ANY_VALUE(u.profile_image_type) AS profile_image_type,
        
        SUM(CASE WHEN cr.reaction = 'like' THEN 1 ELSE 0 END) AS total_likes,
        SUM(CASE WHEN cr.reaction = 'dislike' THEN 1 ELSE 0 END) AS total_dislikes,

        MAX(CASE WHEN cr.user_id = ? THEN cr.reaction ELSE NULL END) AS my_reaction

    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN comments_reactions cr ON cr.comment_id = c.id
        AND cr.post_id = c.post_id
        AND cr.media_type = c.media_type

    WHERE c.post_id = ?
    AND c.media_type = ?

    GROUP BY c.id
    ORDER BY upload_date DESC`;

    const [rows] = await pool.query(query, [user?.id, post_id, media_type]);


    // Convert to Base64 usable Image
    rows.forEach(col => {
        if(rows[0].profile_image && Buffer.isBuffer(col.profile_image)) {

            const imageBase64 = `data:${col.profile_image_type};base64,${col.profile_image.toString('base64')}`;

            col.profile_image = imageBase64;
        }
    })


    // set the user_name that is equal to myUserName say "Me" and Usable profile_image
    const final = rows.map(col => {
        return {
            ...col,
            display_name: col.user_name === user?.username ? "Me" : col.user_name,
        };
    });

    return final;
};


//FUNCTION: delete a comment
async function getAllChildComments(parentId) {
    const [children] = await pool.query(
        'SELECT id FROM comments WHERE parent_id = ?',
        [parentId]
    );

    let all = children.map(c => c.id);

    for (const child of children) {
        const nested = await getAllChildComments(child.id);
        all.push(...nested);
    }

    return all;
}

export async function deleteComment(user_id, post_id, media_type, comment_id) {
    const fb = {
        action: 'Deleting a comment',
        status: null,
        message: "",
    };

    // Check if the comment exists AND belongs to the user
    const [rows] = await pool.query(
        `SELECT * FROM comments WHERE user_id = ? AND post_id = ? AND media_type = ? AND id = ?`,
        [user_id, post_id, media_type, comment_id]
    );

    if (rows.length < 1) {
        fb.status = 404;
        fb.message = "Comment not found or you are not the owner.";
        return fb;
    }

    // 1. Get all nested replies
    const nestedIds = await getAllChildComments(comment_id);

    // 2. Prepare all ids including the parent one
    const deleteIds = [comment_id, ...nestedIds];

    // 3. Delete reactions first (FK constraint)
    await pool.query(
        `DELETE FROM comments_reactions WHERE comment_id IN (?)`,
        [deleteIds]
    );

    // 4. Delete the comments
    await pool.query(
        `DELETE FROM comments WHERE id IN (?)`,
        [deleteIds]
    );

    fb.status = 200;
    fb.message = "Comment and all nested replies deleted.";

    return fb;
}


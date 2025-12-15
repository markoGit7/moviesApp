// Import {hash, token}
import bcrypt from "bcrypt";

// Buffer
import { Buffer } from "buffer";

// Import token.js
import {createToken, verifyToken, createRefreshToken} from './token.js' 

// DB connection
import pool from './dbConnect.js';

export async function singUp(user_name, user_email, user_password, confirm_password) {

    //feetback
    const fb = {
        action: 'Sing Up',
        status: null,
        message: "",
    }

    //if user already exists (user_name === db_username && user_email === db_userEmail)
    const userExists = async() => {
        const [row] = await pool.query('SELECT * FROM users WHERE user_name = ?',[user_name]);
        return row.length > 0;
    };
    const user = await userExists();

    //!userExists
    if(user) {
        fb.status = 409;
        fb.message = "User Name already exist";
        return fb;
    } 

    //check if the password and confirm password are equal
    const isPasswordSame = user_password === confirm_password;

    //if password === confirm password = true 
    if(isPasswordSame === false) {
        fb.status = 400;
        fb.message = "password and confirm password are not matching";
        return fb;
    } 


    //Create a hush password
    const hashedPassword = await bcrypt.hash(user_password, 10);


    //INSERT new user
    const query = `
        INSERT INTO users(user_name, email, password, profile_image)
        VALUES(?,?,?,null)
    `;

    //check if everything is good in the insert with try and catch
    try{
        await pool.query(query,[user_name, user_email, hashedPassword]);

        fb.status = 201;
        fb.message = 'New User Added';
    } catch (error) {
        console.log(error);
        fb.status = 500;
        fb.message = 'Email already exist';
    }
    
    //return insert
    return fb;

};


export async function logIn(user_email, user_password) {

    //feetback
    const fb = {
        action: 'Log In',
        status: null,
        message: "",
    };

    const query = `SELECT * FROM users WHERE email = ?`;

    const [row] = await pool.query(query,[user_email]);
    
    //check if the user_email exists
    const emailExists = row.length > 0;
    
    if(emailExists === false) {
        fb.status = 404;
        fb.message = "User not found";
        return fb;
    }


    //check if the db record password is the same with user_password
    const db_password = row[0].password;
    
    const isMatch = await bcrypt.compare(user_password, db_password);
    

    if(isMatch === false) {
        fb.status = 401;
        fb.message = "Incorrect password"
        return fb;
    }

    //create access token* and refresh token
    const user_id = row[0].id;
    const user_name = row[0].user_name;

    // access token
    const token = createToken({
        id: user_id,
        username: user_name
    });

    // refresh token
    const tokenRefresh = createRefreshToken({
        id: user_id,
        username: user_name
    });

    
    // set refresh token to db
    await pool.query(
        "UPDATE users SET refresh_token = ? WHERE id = ?",
        [tokenRefresh, user_id]
    );
    
    //return db user id
    
    fb.status = 200;
    fb.message = "Login successful";
    fb.access_token = token;
    fb.refresh_token = tokenRefresh;

    return fb;
}

export async function DeleteUser(user_id) {


    const query = `DELETE FROM users WHERE id = ?`;

    try {
    
        await pool.query(query,[user_id]);
    
    } 
    catch(error) {
        return { status: 500, error: error.message };
    }
    

    return { status: 204 };
}

// getting user details like username, profile picture
export async function userDetails(user_id) {
    const query = `SELECT * FROM users WHERE id = ?`;
    
    const [row] = await pool.query(query,[user_id]);
    
    const mimetype = row[0].profile_image_type;

    // If the user doesn't have profile image
    if(!mimetype) {
        return row[0];
    }
    
    const imageBase64 = `data:${mimetype};base64,${row[0].profile_image.toString('base64')}`;
    
    // update user with usable profile_image
    row[0].profile_image = imageBase64;

    return row[0];
}

export async function userUpdates(id, user_profileImage, profile_image_type) {

    const [row] = await pool.query("SELECT * FROM users WHERE id = ? AND profile_image = ? AND profile_image_type = ?", [id, user_profileImage, profile_image_type]);

    if(row.length > 0) {
        return null;
    }

    const query = `UPDATE users SET profile_image = ?, profile_image_type = ? WHERE id = ?`;

    try {
        
        await pool.query(query, [user_profileImage, profile_image_type, id]);
    
    } catch (error) {
        return {status: 500, error: `${error}`}
    }
    

    return {status: 200}
}
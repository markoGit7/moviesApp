import {connectDB} from './dbConnect.js'

// Import {hash, token}
import bcrypt from "bcrypt";

// Import token.js
import {createToken, verifyToken, createRefreshToken} from './token.js' 

const db = await connectDB();

export async function singUp(user_name, user_email, user_password, confirm_password) {

    //feetback
    const fb = {
        action: 'Sing Up',
        status: null,
        message: "",
    }

    //if user already exists (user_name === db_username && user_email === db_userEmail)
    const userExists = async() => {
        const [row] = await db.query('SELECT * FROM users WHERE user_name = ?',[user_name]);
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
        await db.query(query,[user_name, user_email, hashedPassword]);

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

    const [row] = await db.query(query,[user_email]);
    
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
    
    console.log("user password matching: ", isMatch, "my password: ", user_password, "cripted_password: ", db_password);

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
    await db.query(
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

// getting user details like username, profile picture
export async function userDetails(user_id) {
    const query = `SELECT * FROM users WHERE id = ?`;
    
    const [row] = await db.query(query,[user_id]);

    return row[0];
}

export async function userUpdates(id, user_profileImage) {

    const [row] = await db.query("SELECT * FROM users WHERE id = ? AND profile_image = ?", [id, user_profileImage]);

    if(row.length > 0) {
        return null;
    }

    const query = `UPDATE users SET profile_image = ? WHERE id = ?`;

    try {
        
        await db.query(query, [user_profileImage, id]);
    
    } catch (error) {
        return {status: 500, error: `${error}`}
    }
    

    return {status: 200}
}
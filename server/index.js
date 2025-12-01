import express from 'express'; 
import cors from 'cors';
import multer from "multer";
import cookieParser from "cookie-parser";

//import from embedder.js
import {Find_Closest_Match} from './components/embedder.js'

//import from userDB.js
import { singUp, logIn, userDetails, userUpdates} from './components/usersDB.js'

// import from likesDB.js
import {checkLiked, Like, likesCountTrack, everyLiked, Delete} from './components/likesDB.js'

//import from commentsDB.js
import {addComent, addReply, addReaction, getComments, deleteComment} from './components/commentsDB.js'

// import from token.js
import {auth} from './components/token.js'
const app = express();
const PORT = 3000;

//declaring multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Allow Cookie parser
app.use(cookieParser());

// ✅ Allow requests from your Vite frontend
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["x-new-access-token"]
}));


// Middleware for JSON
app.use(express.json());


// AI search rout
app.post('/myQuery', async(req, res) => {
    const {query} = req.body;
    const {user_media_type} = req.body;
    console.log('myQuery in Server/ ', query, 'my Input media type in Server/ ', user_media_type);
    const results = await Find_Closest_Match(query, user_media_type);

    res.json(results);
});

//Sing up route
app.post('/auth/signup', async(req, res) => {
    const { email, userName, password, confirmPassword } = req.body;
    
    const newUser = await singUp(userName, email, password, confirmPassword);

    console.log(newUser);
    return res.json(newUser);
});

//userName Check
app.post('/auth/login', async(req, res) => {
    const {email, password} = req.body;

    const userLogin = await logIn(email, password);
    
    if (userLogin.status !== 200) {
        return res.status(userLogin.status).json({ message: userLogin.message });
    }

    // Set refresh token cookie
    res.cookie("refresh_token", userLogin.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    

    console.log("User Login from DB return: ", userLogin);
    res.json({
        access_token: userLogin.access_token, 
        status: userLogin.status, 
        message: userLogin.message
    });
});

//Log out route
app.post('/auth/logout', async(req, res) => {
    res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: false,  // must match!
        sameSite: "lax", // must match!
        path: "/"        // default path
    });

    return res.status(200).json();
});

//Logged in user info
app.post('/user/info', auth, async(req, res) => {

    // user identity 
    const user = req.user;

    // find users informations
    const detailsData = await userDetails(user.id);

    // get needed info
    const final = {
        user_name: detailsData.user_name,
        email: detailsData.email,
        profile_image: detailsData.profile_image,
    }

    res.json(final);
});


// User updates
app.post("/user/update", auth, upload.single("profileImage"), async (req, res) => {
  
    
    try {
        const user = req.user;
        const file = req.file;
        const MAX_SIZE = 200 * 1024;




        //denie >200 file sizes
        if(file.size > MAX_SIZE) {
            console.log('Your Profile Image size is ', file.size / 1024 + 'kb', 'And its allowed to: ', MAX_SIZE / 1024 + 'kb');
            return;
        }


        const response_db = await userUpdates(user.id, file.buffer);
        
        
        if(response_db === null) {
            return res.status(300).json({message: 'Profile image not changed'})
        }

        res.status(200).json({message: 'Profile image updated'});
    } catch(error) {
        console.log('Error in user/update: ',error);
    } 
});


//Server is On
app.get("/health", (req, res) => res.send("ok"));


// ROUTS: Liking System

//check if already liked
app.post('/like/verify', auth, async(req, res) => {

    const user = req.user;
    
    const {post_id, media_type} = req.body;
    
    const isLiked = await checkLiked(user.id, post_id, media_type);

    res.json({
        liked: isLiked
    });
});

// like a post
app.post('/like', auth, async(req, res) => {
    const {post_id, media_type} = req.body;
    const user = req.user;

    const isLiked = await Like(user.id, post_id, media_type);

    console.log(`THIS USER ${isLiked ? "LIKED" : "DISLIKED"} THIS ${media_type === 'tv' ? "SHOW" : "MOVIE"}: `, user);

    res.json({
        liked: isLiked
    });
});

// track user liked
app.post('/like/track', auth, async(req, res) => {
    const user = req.user;
    
    const notSeen = await likesCountTrack(user.id);

    res.json(notSeen[0].notSeen);
});

// get all liked posts by user
app.post('/like/getLiked', auth, async(req, res) => {
    const user = req.user;

    const response_db = await everyLiked(user.id);

    res.json(response_db);
});

// delete selected liked posts by user
app.delete('/like/delete', auth, async(req, res) => {
    const user = req.user;
    const { data } = req.body;

    const response_db = await Delete(user.id, data);

    if (response_db.errors) {
        return res.status(500).json(response_db);
    }

    // No content, deletion successful
    return res.sendStatus(204);
});

// MIDDLEWEAR: For adding client values to comments Table
app.post('/comments', auth, async(req, res) => {
    const {post_id, media_type, message} = req.body;
    const user = req.user;
    
    console.log({
        user_id: user.id,
        post_id: post_id,
        media_type: media_type,
        message: message
    });
    const response_db = await addComent(user.id, post_id, media_type, message);

    res.json(response_db);
});

// MIDDLEWEAR: For fetching movie/show data stored in comments Table
app.post('/comments/get', auth, async(req, res) => {
    const {post_id, media_type} = req.body;
    const user = req.user;
    
    console.log({
        post_id: post_id,
        media_type: media_type,
        user_id: user?.id
    });

    
    const response_db = await getComments(user, post_id, media_type);

    
    res.json(response_db);
});

// MIDDLEWEAR: For adding replies of comments
app.post('/comments/replies', auth, async(req, res) => {
    const {post_id, media_type, message, comment_id} = req.body;
    const user = req.user;

    console.log({
        post_id: post_id,
        media_type: media_type,
        user_id: user.id,
        message: message,
        comment_id: comment_id
    });

    
    const response_db = await addReply(user.id, post_id, media_type, message, comment_id);

    
    res.json(response_db);
});

// MIDDLEWEAR: For adding reactions to comments
app.post('/comments/reactions', auth, async(req, res) => {
    const {post_id, media_type, comment_id, author, reaction} = req.body;
    
    const user = req.user;

    console.table([{
        Action: "Reacting on Comment",
        post_id: post_id,
        media_type: media_type,
        
        user_id: user.id,
        reaction: reaction,
        comment_id: comment_id,
        author: author,
        
    }], ['Action', 'post_id', 'media_type', 'user_id', 'reaction', 'comment_id', 'author']);

    
    const response_db = await addReaction(user.id, post_id, media_type, comment_id, author, reaction);

    
    res.json(response_db);
});


// MIDDLEWEAR: For deleting comments
app.post('/comments/delete', auth, async(req, res) => {
    const {post_id, media_type, comment_id} = req.body;
    const user = req.user;
    const response_db = await deleteComment(user.id, post_id, media_type, comment_id);
    
    res.json(response_db);
});

app.get("/debug/cookies", (req, res) => {
    console.log("COOKIES:", req.cookies);
    res.json(req.cookies);
});

// root server
app.get('/', (req, res) => {
    res.send('Server is running ✅');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
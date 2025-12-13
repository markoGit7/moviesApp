import jwt from "jsonwebtoken";

// import denote
import dotenv from "dotenv";
dotenv.config();

//jwt_secret_key
const JWT_SECRET_KEY_ACESS = process.env.JWT_SECRET_ACCESS;
const JWT_SECRET_KEY_REFRESH = process.env.JWT_SECRET_REFRESH;

// FUNTION: create token
export function createToken(payload) {
  	return jwt.sign(payload, JWT_SECRET_KEY_ACESS, { expiresIn: "1h" });
}

export function createRefreshToken(payload) {
    return jwt.sign(payload, JWT_SECRET_KEY_REFRESH, {
        expiresIn: "30d"
    });
}

// FUNCTION: verify a token and return the payload
export function verifyToken(token) {
    try {
        
        const decode = jwt.verify(token, JWT_SECRET_KEY_ACESS);
        return decode;
    
    } catch(err) {
        return null;
    }
  	
};

export function verifyTokenRefresh(token) {
  	try {
        
        const decode = jwt.verify(token, JWT_SECRET_KEY_REFRESH);
        return decode;
    
    } catch(err) {
        return null;
    }
};

// FUNCTION: verify if token still avaliable
export function auth(req, res, next) {
	
    const authHeader = req.headers.authorization;

    const token = authHeader.split(" ")[1] === "null" ? false : authHeader.split(" ")[1];
    
    if(token === false) {
        req.user = null;
        
        return next();
    }
    
    const accessToken_decode = verifyToken(token);
    
    if(accessToken_decode) {
        req.user = accessToken_decode;

        return next();
    }

    const cookieToken = req.cookies.refresh_token;
    const refreshToken_decode = verifyTokenRefresh(cookieToken);

    if(refreshToken_decode) {

        // GET user identity
        const id = refreshToken_decode.id;
        const username = refreshToken_decode.username;
        
        const newAccessToken = createToken({
            id: id,
            username: username,
        });

        req.user = refreshToken_decode;
        res.setHeader("x-new-access-token", newAccessToken);

        return next();
    }


    return res.status(401).json({message:'Refresh Token Expired'});
};
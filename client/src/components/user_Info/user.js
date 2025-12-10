// FUNCTION: making the profile image as string
function bufferToBase64(buffer) {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}


// FUNCTION: force logout 
async function forceLog_out() {
    localStorage.removeItem('access_token');

    // Remove cookie
    const response_s = await fetch(`${import.meta.env.VITE_REQUEST_PATH}auth/logout`, {
        method: 'POST',
        
        credentials: 'include',
    });

    window.location.reload(); // 🔄 refresh the page
}

export default async function info() {
    const token = localStorage.getItem("access_token") || null;

    if(!token) {
        return null;
    }

    const response = await fetch(`${import.meta.env.VITE_REQUEST_PATH}user/info`, {
        method: 'POST',
        
        headers: {
            Authorization: `Bearer ${token}`,
        },

        credentials: "include"
    });

    if(response.status === 401) {
        forceLog_out();
        return null;
    }

    const result = await response.json();

    console.log('User INFO: ', result);
    const newToken = response.headers.get("x-new-access-token");
    
    if(newToken) {
        console.log("New token", newToken);
        localStorage.setItem('access_token', newToken);
    }

    const parseResult = {...result};

    
    if (parseResult.profile_image) {
        const base64 = bufferToBase64(parseResult.profile_image.data);
        
        parseResult.profile_image = `data:image/jpeg;base64,${base64}`;

    }
        
    return parseResult;

     
}


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

    
    const newToken = response.headers.get("x-new-access-token");
    
    if(newToken) {
        console.log("New token", newToken);
        localStorage.setItem('access_token', newToken);
    }

    const parseResult = {...result};


    console.log('User INFO: ', parseResult);

    return parseResult;

     
}
export default async function request(url, method, auth = false, serverStatus = 'off', body = null) {

    
    if (serverStatus === 'off') {
        return;
    }

    if(!url || !method) {
        alert('you havent entered path, or method');
        return;
    }


    if(auth === false) {

        // Requests that doesn't include auth

        let prepare = {};

        
        switch(method.toLowerCase()) {
            case 'post' || 'POST': 
                    prepare = {
                        method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body)
                    };

                break;
            case 'get' || 'GET':
                    prepare = {
                        method: 'GET',
                        headers: {
                            'Content-Type' : 'application/json'
                        }
                    };

                break;
            case 'delete' || 'DELETE':
                break;
            case 'put' || 'PUT':
                break;
            default: method = null;
        }
        
        console.log('prepare: ', prepare);
        
        const req = await fetch(url, prepare);
        
        const res = await req.json();
        

        if (req.ok) {
            return res;
        }


    } else {

        // Requests that include auth

        let prepare = {};

        
        switch(method.toLowerCase()) {
            case 'post' || 'POST': 
                    
                    if(body === null || !body) {

                        prepare = {
                            method: 'POST', 
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                                'Content-Type': 'application/json',
                            },
                            
                            credentials: "include", 

                        };


                    } else {

                        prepare = {
                            method: 'POST', 
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                                'Content-Type': 'application/json',
                            },
                            
                            credentials: "include", 

                            body: JSON.stringify(body)
                        };

                    }
                    

                break;
            case 'get' || 'GET':
                    prepare = {
                        method: 'GET',
                        headers: {
                            'Content-Type' : 'application/json'
                        }
                    };

                break;
            case 'delete' || 'DELETE':
                break;
            case 'put' || 'PUT':
                break;
            default: method = null;
        }
        
        console.log('prepare: ', prepare);
        
        const req = await fetch(url, prepare);
        
        const res = await req.json();
        

        if (req.ok) {
            return res;
        }
        
        // when refresh token expires, detect
        if(res.status === 401) {
            forceLog_out();
            return;
        }

        // EXPIRED ACCESS TOKEN
        const newToken = res.headers.get("x-new-access-token");
        if(newToken) {
            localStorage.setItem('access_token', newToken);
        }

    }


};

// FUNCTION: force logout 
async function forceLog_out() {
    localStorage.removeItem('access_token');

    // Remove cookie
    await request('http://localhost:3000/auth/logout', 'post', true, 'on', null)

    window.location.reload(); // 🔄 refresh the page
}
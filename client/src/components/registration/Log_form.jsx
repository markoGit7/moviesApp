import React,{useState} from 'react'


//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash  } from "@fortawesome/free-solid-svg-icons";

function Log_form() {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [paswordVisable, setPasswordVisable] = useState(false);
    
    const handleSubmit = async(e) => {
        e.preventDefault();

        console.log('Log In Form Submitted');
        console.table({
            aplication:'Log in',
            email: email,
            password: password
        },['email', 'password']);


        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            
            headers: {
            'Content-Type': 'application/json',
            },

            credentials: "include",

            body: JSON.stringify({
                email: email,
                password: password
            }),
        });

        const serverData = await response.json();

        alert(serverData.message);

        if(serverData.status === 200) {
            console.log('add user_token to local storage');
            localStorage.setItem('access_token', serverData.access_token);
            window.location.reload(); // 🔄 refresh the page
        }
    }
        
    return (
        <>
            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
                
                <div>
                    <label className="text-sm">Email</label>
                    <input
                    type="email"
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div>
                    <label className="text-sm">Password</label>

                    <span className='relative'>
                        <input
                        type={paswordVisable ? 'text' : 'password'}
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-red-500"
                        />
                        <FontAwesomeIcon icon={!paswordVisable ? faEye : faEyeSlash} className='text-lg absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer' onClick={() => setPasswordVisable(prev => !prev)}/>
                    </span>
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-pink-500 hover:from-pink-600 hover:to-red-500 p-2 rounded-lg font-semibold mt-4"
                >
                    Log In
                </button>
            </form>
        </>
    )
}

export default Log_form
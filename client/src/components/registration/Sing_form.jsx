import React, {useState, useEffect} from 'react'


//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash  } from "@fortawesome/free-solid-svg-icons";


function Sing_form() {

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [usernameError, setUsernameError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [progress, setProgress] = useState(0);

    const [paswordVisable, setPasswordVisable] = useState(false);
    const [confirmPasswordVisable, setConfirmPasswordVisable] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();

        // VERIFY ENTRIES

        // check for username errors
        if(usernameError !== null) {
            return;
        }

        if(emailError !== null) {
            return;
        }

        // check if password length is satisfied 
        if(password.length < 8) {
            alert("Password must have minimum 8 characters");
            return;
        }

        // check if the password is enough protected
        if(progress < 67) {
            alert("The entered password is not safe. Make it stronger.");
            return;
        }


        const response = await fetch(`${import.meta.env.VITE_REQUEST_PATH}auth/signup`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: userName,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            }),
        });

        const serverData = await response.json();

        if(serverData.status === 409) {
            alert(serverData.message);
        } else if(serverData.status === 400) {
            alert(`Password could't confirm`);
        } else if(serverData.status === 500) {
            alert(serverData.message);
        
        } else {
            alert('New user added sucessfully!!!');
            window.location.reload(); // 🔄 refresh the page
        }
        
    };

    const handlePassword = (val) => {
        
        //limit the length of password to be 24 characters
        if(val.length > 24) return;
        

        setPassword(val);
    };

    const handleConfirmPassword = (val) => {
        
        //limit the length of password to be 24 characters
        if(val.length > 24) return;
        

        setConfirmPassword(val);
    }

    
    useEffect(() => {
        setUsernameError(null); // reset error when typing

        const usernameRegex = /^(?!.*[_.]{2})[a-zA-Z0-9._]+$/;

        // Empty check
        if (userName.trim() === "") return;

        

        // VERIFY: Format check 
        if (!usernameRegex.test(userName)) {
            setUsernameError(
                "Only letters, numbers, dots (.) and underscores (_) are allowed — no spaces or symbols."
            );
            return;
        }

        // Length check
        if (userName.length < 3 || userName.length > 20) {
            setUsernameError("Username must be between 3 and 20 characters long.");
            return;
        }


        // If everything is fine
        setUsernameError(null);
    }, [userName]);

    useEffect(() => {
        setEmailError(null);

        if (!email || email.trim() === "") return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address.");
        }
    }, [email]);

    
    useEffect(() => {

        if (!password || password.trim() === "") {
            setProgress(0);
            return;
        }

        let score = 0;

        if (/[A-Z]/.test(password) && password.length > 7) score += 33.3; // ✅ uppercase letter
        if (/\d/.test(password) && password.length > 7) score += 33.3; // ✅ number
        if (/[@$!%*?&]/.test(password) && password.length > 7) score += 33.3; // ✅ special character

        
        setProgress(Math.round(score));
        
    }, [password]);
    

    return (
        <>
            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
                
                <div>
                    <label className="text-sm">Username</label>
                    <span className='relative'>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-red-500"
                            required
                        />
                        {
                            usernameError && (
                                <p style={{ color: "red", marginTop: "4px" }}>
                                    {usernameError || ""}
                                </p>
                            )
                                
                        }
                    </span>
                </div>
                

                <div>
                    <label className="text-sm">Email</label>
                    <span className='relative'>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-red-500"
                            required
                        />
                         {
                            emailError && 
                                (
                                    <p style={{ color: "red", marginTop: "4px" }}>
                                        {
                                            emailError
                                        }
                                    </p>
                                )
                        }
                    </span>
                </div>

                <div>
                    <label className="text-sm">Password</label>
                    <span className='relative'>
                        <input
                            type={paswordVisable ? 'text' : 'password'}
                            value={password}
                            onKeyDown={(e) => {
                                if (e.key === " ") {
                                    e.preventDefault();
                                }
                            }}
                            placeholder="Enter your password"
                            onChange={(e) => handlePassword(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-red-500"
                            required
                        />
                        <FontAwesomeIcon icon={!paswordVisable ? faEye : faEyeSlash} className='text-lg absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer' onClick={() => setPasswordVisable(prev => !prev)}/>
                    </span>
                    {
                        progress > 0 && 
                        (
                            <div className='block mt-2 pl-3'>
                                {progress >= 33 && progress < 67  &&(<p style={{color:'red'}}>Weak</p>)}
                                {progress >= 67 && progress < 100 &&(<p style={{color:'yellow'}}>Good</p>)}
                                {progress === 100 &&(<p style={{color:'green'}}>Strong</p>)}
                            </div>
                        )
                    }
                </div>

                
                <div>
                    <label className="text-sm">Confirm Password</label>
                    <span className='relative'>
                        <input
                            type={confirmPasswordVisable ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            onKeyDown={(e) => {
                                if (e.key === " ") {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) => handleConfirmPassword(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-red-500"
                            required
                        />
                        <FontAwesomeIcon icon={!confirmPasswordVisable ? faEye : faEyeSlash} className='text-lg absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer' onClick={() => setConfirmPasswordVisable(prev => !prev)}/>
                    </span>
                </div>
                

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-pink-500 hover:from-pink-600 hover:to-red-500 p-2 rounded-lg font-semibold mt-4"
                >
                    Sign Up
                </button>
            </form>
        </>
    )
}

export default Sing_form
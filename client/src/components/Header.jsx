import React, {useState, useEffect} from 'react'
import { Link, useNavigate, NavLink  } from "react-router-dom";
import {RegisterButton, LoginButton, Register, Info} from './Components_collection'
import User_profile from './registration/User_profile.jsx'


//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";


function Header() {
    const [openModal, setOpenModal] = useState(false);
    const [choice, setChoice] = useState(null);
    const [user, setUser] = useState(null);
    const [userInfo, setUserInfo] = useState({});

    const navigate = useNavigate();

    const handleSignUp = () => {
        setChoice('singup');
        setOpenModal(true);
    }

    const handleLogIn = () => {
        setChoice('login');
        setOpenModal(true);
    }

    const handleClose = () => {
        setChoice(null);
        setOpenModal(false);
    }

    const handleNavigation_to_like = async() => {

        navigate(`/liked`);
    }


    useEffect(() => {

        const getUser = localStorage.getItem('access_token') || null;

        if(!getUser) return;

        (async() => {
            
            const response = await Info();

            setUserInfo(response);

        })();

        setUser(getUser);

    }, []);
    


    // USEFFECT: Updating Like Count
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {

        const token = localStorage.getItem("access_token");

        if(!token) return;

        const update = async() => {
            const response = await fetch(`${import.meta.env.VITE_REQUEST_PATH}like/track`,{
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
                credentials: "include",
            });

            // EXPIRED ACCESS TOKEN
            const newToken = response.headers.get("x-new-access-token");
            if(newToken) {
                localStorage.setItem('access_token', newToken);
            }
            
            const result = await response.json();

            setLikeCount(result);
        };

        update();

        window.addEventListener("storageUpdate", update);
        return () => window.removeEventListener("storageUpdate", update);
    }, []);

    return (
        <>
            <header className='w-full relative py-5'>
                <div className='w-[1200px] max-w-full px-5 mx-auto'>
                    <div className='flex w-full flex-row items-center justify-between'>
                        <div className='flex items-center'>
                            <h1 className='text-4xl'>MovieCenter</h1>

                            <div className='ml-12'>
                                {/*List for Desktop*/}
                                <ul id='onlyDesktopNavigation' className='flex flex-row -mx-5'>
                                    <NavLink  to={`/`}  className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
                                    <NavLink  to={`/browse`} className={({ isActive }) => (isActive ? "active" : "")}>Browse</NavLink>
                                    <NavLink  to={`/ai-search`} className={({ isActive }) => (isActive ? "active" : "")}>AI Search</NavLink>
                                </ul>

                                {/*List for Mobile*/}
                                <ul id='onlyMobileNavigation' className='hidden'>
                                     <NavLink  to={`/`}  className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
                                    <NavLink  to={`/browse`} className={({ isActive }) => (isActive ? "active" : "")}>Browse</NavLink>
                                    <NavLink  to={`/ai-search`} className={({ isActive }) => (isActive ? "active" : "")}>AI Search</NavLink>
                                </ul>
                            </div>
                        </div>

                        {
                            user === null ?
                            
                            (
                                <div>
                                    {/* Form for Desktop */}
                                    <div id='onlyDesktop' className='-mx-2 flex items-center'>
                                        <div className='px-2'>
                                            <LoginButton onClick={handleLogIn}/>
                                        </div>

                                        <div className='px-2'>
                                            <RegisterButton onClick={handleSignUp}/>
                                        </div>
                                    </div>
                                    {/* Form for Mobile */}
                                    <div id='onlyMobile' className='hidden'>
                                        <LoginButton />
                                        <RegisterButton />
                                    </div>
                                </div>
                            )
                            :
                            (
                                // User dashboard
                                <div className='flex flex-row items-center gap-x-5'>
                                    {/* Liked */}
                                    <span className='relative cursor-pointer' onClick={handleNavigation_to_like}>
                                        <b className={`absolute -top-3 -right-1 text-sm ${likeCount > 0 ? 'block' : 'hidden'}`}>{likeCount}</b>
                                        <FontAwesomeIcon icon={faHeart} className='text-2xl text-red-500' />
                                    </span>
                                    {/* Profile */}
                                    <User_profile info={userInfo} />
                                </div>
                            )
                        }
                       
                    </div>
                </div>
            </header>

            {
                openModal && choice && <Register close={handleClose} my_choice={choice}/>
            }
        </>
    )
}

export default Header
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <header className="w-full relative py-5 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">

                        {/* Logo + Desktop Navigation */}
                        <div className="flex items-center">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                                MovieCenter
                            </h1>

                            {/* Desktop Navigation */}
                            <ul className="hidden md:flex flex-row ml-12">
                                <NavLink
                                    to="/"
                                    className={({ isActive }) => isActive ? "active px-5" : "px-5"}
                                >
                                    Home
                                </NavLink>

                                <NavLink
                                    to="/browse"
                                    className={({ isActive }) => isActive ? "active px-5" : "px-5"}
                                >
                                    Browse
                                </NavLink>

                            </ul>
                        </div>

                        {/* Desktop Right Side */}
                        <div className="hidden md:flex items-center">
                            {
                                user === null ?
                                (
                                    <div className="-mx-2 flex items-center">
                                        <div className="px-2">
                                            <LoginButton onClick={handleLogIn}/>
                                        </div>

                                        <div className="px-2">
                                            <RegisterButton onClick={handleSignUp}/>
                                        </div>
                                    </div>
                                )
                                :
                                (
                                    <div className="flex flex-row items-center gap-x-5">
                                        <span
                                            className="relative cursor-pointer"
                                            onClick={handleNavigation_to_like}
                                        >
                                            <b
                                                className={`absolute -top-3 -right-1 text-sm ${
                                                    likeCount > 0 ? "block" : "hidden"
                                                }`}
                                            >
                                                {likeCount}
                                            </b>

                                            <FontAwesomeIcon
                                                icon={faHeart}
                                                className="text-2xl text-red-500"
                                            />
                                        </span>

                                        <User_profile info={userInfo} />
                                    </div>
                                )
                            }
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            className="md:hidden text-2xl"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            ☰
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {
                        mobileMenuOpen && (
                            <div className="md:hidden pt-5">

                                <ul className="flex flex-col gap-y-4">
                                    <NavLink
                                        to="/"
                                        className={({ isActive }) => isActive ? "active" : ""}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Home
                                    </NavLink>

                                    <NavLink
                                        to="/browse"
                                        className={({ isActive }) => isActive ? "active" : ""}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Browse
                                    </NavLink>

                                </ul>

                                <div className="mt-5">
                                    {
                                        user === null ?
                                        (
                                            <div className="flex flex-col gap-y-3">
                                                <LoginButton onClick={handleLogIn}/>
                                                <RegisterButton onClick={handleSignUp}/>
                                            </div>
                                        )
                                        :
                                        (
                                            <div className="flex flex-col gap-y-4">
                                                <span
                                                    className="relative w-fit cursor-pointer"
                                                    onClick={handleNavigation_to_like}
                                                >
                                                    <b
                                                        className={`absolute -top-3 -right-3 text-sm ${
                                                            likeCount > 0 ? "block" : "hidden"
                                                        }`}
                                                    >
                                                        {likeCount}
                                                    </b>

                                                    <FontAwesomeIcon
                                                        icon={faHeart}
                                                        className="text-2xl text-red-500"
                                                    />
                                                </span>

                                                <User_profile info={userInfo}/>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </header>

            {
                openModal &&
                choice &&
                <Register
                    close={handleClose}
                    my_choice={choice}
                />
            }
        </>
    );
}

export default Header
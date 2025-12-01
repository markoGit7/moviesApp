import React, {useState, useEffect} from 'react'
import { motion, AnimatePresence } from "framer-motion";

//import sign up and log in
import Sing_form from './Sing_form';
import Log_form from './Log_form';

function Register({close, my_choice}) {

    const [isLogin, setIsLogin] = useState(my_choice === 'login' ? true : false);


    useEffect(() => {
        // Save original overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;
        // Hide scroll
        document.body.style.overflow = 'hidden';
        // Restore when modal unmounts
        return () => {
        document.body.style.overflow = originalStyle;
        };
    }, []);

    return (
        <AnimatePresence>
            <>
                {/* Background Overlay */}
                <motion.div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />

                {/* Modal Card */}
                <motion.div
                    className="fixed left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-50 bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-white"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        {isLogin ? "Welcome Back 🎬" : "Create Account 🍿"}
                    </h2>
                    <button
                        onClick={close}
                        className="text-gray-400 hover:text-white text-xl"
                    >
                        ✕
                    </button>
                    </div>

                    {/* Toggle */}
                    <div className="flex justify-center mb-6">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`px-4 py-2 font-semibold rounded-l-lg ${
                        isLogin ? "bg-red-600" : "bg-gray-700"
                        }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`px-4 py-2 font-semibold rounded-r-lg ${
                        !isLogin ? "bg-red-600" : "bg-gray-700"
                        }`}
                    >
                        Sign Up
                    </button>
                    </div>

                    {/* Form */}
                    {
                        isLogin ? <Log_form /> : <Sing_form />
                    }
                </motion.div>
            </>
        </AnimatePresence>
    )
}

export default Register
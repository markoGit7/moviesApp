import React, {useState} from 'react'


import default_profile from '../../assets/default_profile_image/default.png'

function User_profile({info}) {
    const userInfo = info;

    
    const handleLogout = async(forced = false) => {
        if(forced === true) {
            alert('Forced Logging out');
        } else {
            alert('Logging out....');
        }
        

        localStorage.removeItem('access_token');

        // Remove cookie
        const response_s = await fetch('http://localhost:3000/auth/logout', {
            method: 'POST',
            
            credentials: 'include', // ✔️ include cookies in request
        });

        if(response_s.status === 200) {
            alert('Sucessfully logged out');
        }

        window.location.reload(); // 🔄 refresh the page
    }

    const handleDeleteAccount = async() => {
        const answer = confirm("Are you sure you want to delete your account permanently?");

        if(!answer) return;

        const response_s = await fetch('http://localhost:3000/auth/delete', {
            method: 'DELETE',
            
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },

            credentials: 'include', // ✔️ include cookies in request
        });

        if (response_s.status === 204) {
            alert("Account deleted successfully");
            localStorage.removeItem('access_token');
            window.location.reload(); // 🔄 refresh the page
            return;
        }

        const data = await response_s.json();
        console.log(data);
    }

    const handlePictureChange = async(e) => {
        const file = e.target.files && e.target.files[0];

        if(!file) return;

        const formData = new FormData();

        formData.append("profileImage", file);

        const response_s = await fetch('http://localhost:3000/user/update', {
            method: 'POST',

            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },

            credentials: "include",

            body: formData,
        });
        
        // when refresh token expires, detect
        if(response_s.status === 401) {
            handleLogout(true);
            return;
        }

        // EXPIRED ACCESS TOKEN
        const newToken = response_s.headers.get("x-new-access-token");
        if(newToken) {
            localStorage.setItem('access_token', newToken);
        }
        
        const result = await response_s.json();


        //Detect if the profile image is changed or if is selected the same image
        if(response_s.status === 200) {
            alert(result.message);
            window.location.reload(); // 🔄 refresh the page
        } else if(response_s.status === 300) {
            alert(result.message);
        }
    }



    return (
       <div className="relative group">
            {/* Profile button */}
            <div className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition duration-200 cursor-pointer">
                
                <label htmlFor="profileInput" className="relative cursor-pointer rounded-full ">
                <img
                    src={userInfo?.profile_image || default_profile}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-gray-300 group-hover:opacity-90"
                />

                <span className='absolute top-0 left-0 w-full opacity-0 h-full inline-flex items-center justify-center group-hover:opacity-100 group-hover:bg-black/40 rounded-full text-2xl transition-all duration-300 ease-in-out'>+</span>

                </label>

                <div className="flex flex-col leading-tight">
                <p className="text-sm font-medium text-white">{userInfo?.user_name || "User"}</p>
                </div>

                <input
                onChange={handlePictureChange}
                type="file"
                id="profileInput"
                accept="image/*"
                hidden
                />
            </div>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-40 bg-[#1f2937] text-white rounded-xl shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top-right z-50">
                <ul className="py-2 text-sm">
                    <li onClick={handleLogout} className="px-4 py-2 hover:bg-white/10 cursor-pointer text-red-400">Logout</li>
                    <li onClick={handleDeleteAccount} className="px-4 py-2 hover:bg-white/10 cursor-pointer text-red-400">Delete Account</li>
                </ul>
            </div>
        </div>
    )
}

export default User_profile
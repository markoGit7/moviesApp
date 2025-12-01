import React from 'react'

function RegisterButton({ onClick }) {
    return (
        <button onClick={onClick} className='bg-red-500 min-w-25 py-2 rounded-xl hover:bg-red-700 transition-all duration-300 ease-in-out cursor-pointer font-medium tracking-wider'>SignUp</button>
    )
}

export default RegisterButton
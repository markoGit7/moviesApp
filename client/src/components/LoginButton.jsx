import React from 'react'

function LoginButton({onClick}) {
    return (
        <button onClick={onClick} className='font-medium cursor-pointer'>Login</button>
    )
}

export default LoginButton
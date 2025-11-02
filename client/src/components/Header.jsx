import React, {useEffect} from 'react'
import { Link } from "react-router-dom";
import {RegisterButton, LoginButton} from './Components_collection'
function Header() {
    
    return (
        <header className='w-full relative py-5'>
            <div className='w-[1200px] max-w-full px-5 mx-auto'>
                <div className='flex w-full flex-row items-center justify-between'>
                    <div className='flex items-center'>
                        <h1 className='text-4xl'>MovieHub</h1>

                        <div className='ml-12'>
                            {/*List for Desktop*/}
                            <ul id='onlyDesktop' className='flex flex-row -mx-5'>
                                <li className='px-5'>Home</li>
                                <Link to={`/browse`} className='cursor-pointer' >Browse</Link>
                            </ul>

                            {/*List for Mobile*/}
                            <ul id='onlyMobile' className='hidden'>
                                <li>Home</li>
                                <Link to={`/browse`} className='cursor-pointer' >Browse</Link>
                            </ul>
                        </div>
                    </div>

                    <div>
                        {/* Form for Desktop */}
                        <div id='onlyDesktop' className='-mx-2 flex items-center'>
                            <div className='px-2'>
                                <LoginButton />
                            </div>

                            <div className='px-2'>
                                <RegisterButton />
                            </div>
                        </div>
                        {/* Form for Mobile */}
                        <div id='onlyMobile' className='hidden'>
                            <LoginButton />
                            <RegisterButton />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
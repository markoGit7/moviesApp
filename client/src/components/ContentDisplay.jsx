import React,{useState} from 'react'

//import navigation
import { useParams, useLocation, useNavigate } from "react-router-dom";

//TMDB images path
const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';


//function for slugifying
function slugify(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}


function ContentDisplay({array, type}) {

    const navigate = useNavigate();

    if(!array.length) return(<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl'>Empty</div>);

    return (
        <>
            <div className="flex flex-wrap -mx-2 sm:-mx-3 gap-y-4 sm:gap-y-6 transition-opacity duration-500">

                {
                    array.map(col => (
                        <div
                            key={col.id}
                            className="
                                px-2
                                sm:px-3
                                w-1/2
                                sm:w-1/3
                                lg:w-1/4
                                flex-none
                            "
                        >
                            <div
                                onClick={() =>
                                    navigate(
                                        `/${col?.media_type || type}/${slugify(col.title || col.name)}`,
                                        { state: { id: col.id } }
                                    )
                                }
                                className={`
                                    w-full
                                    relative
                                    rounded-lg
                                    overflow-hidden
                                    ring-2
                                    ring-gray-900
                                    transition-all
                                    duration-300
                                    ease-in-out
                                    ${
                                        (col?.media_type || type) &&
                                        (
                                            col?.media_type === 'movie' ||
                                            type === 'movie'
                                        )
                                            ? 'hover:ring-red-500'
                                            : 'hover:ring-green-600'
                                    }
                                    hover:ring-4
                                    hover:scale-[1.03]
                                `}
                            >

                                {/* Poster */}
                                <img
                                    src={`${IMAGE_PATH}${col.poster_path}`}
                                    alt=""
                                    loading="lazy"
                                    className="
                                        w-full
                                        aspect-[2/3]
                                        object-cover
                                        transition-opacity
                                        duration-500
                                        rounded-lg
                                    "
                                />

                                {
                                    col?.media_type &&
                                    (
                                        <div
                                            className={`
                                                absolute
                                                top-0
                                                right-0
                                                m-2
                                                px-2
                                                sm:px-3
                                                py-1
                                                text-[10px]
                                                sm:text-xs
                                                font-bold
                                                text-white
                                                rounded-full
                                                shadow-lg
                                                ${
                                                    col.media_type === 'movie'
                                                        ? 'bg-red-600'
                                                        : 'bg-green-600'
                                                }
                                            `}
                                        >
                                            {
                                                col.media_type === 'movie'
                                                    ? 'MOVIE'
                                                    : 'TV SHOW'
                                            }
                                        </div>
                                    )
                                }

                                {/* Title */}
                                <div
                                    className="
                                        w-full
                                        bg-black/90
                                        absolute
                                        bottom-0
                                        left-0
                                        text-center
                                        rounded-b-lg
                                        min-h-[60px]
                                        sm:min-h-[80px]
                                        flex
                                        justify-center
                                        items-center
                                    "
                                >
                                    <h3
                                        className="
                                            p-2
                                            sm:p-[10px]
                                            w-full
                                            text-sm
                                            sm:text-base
                                        "
                                    >
                                        {col.title || col.name}
                                    </h3>
                                </div>

                            </div>
                        </div>
                    ))
                }

            </div>
        </>
    );
}

export default ContentDisplay
import React, {useState, useEffect} from 'react'
// Navigate
import { useParams, useLocation, useNavigate } from "react-router-dom"


//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faChevronLeft  } from "@fortawesome/free-solid-svg-icons";


// import TMDB API
import {contentByID} from '../api/movies.js'

// TMDB image path
const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500';


//function for slugifying
function slugify(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function Liked() {
    const token = Boolean(localStorage.getItem('access_token'));
    const [likedData, setLikedData] = useState(null);
    const [nothingLiked, setNothingLiked] = useState(false);

    // delete variables
    const [deleteActive, setDeleteActive] = useState(false);
    const [selectedToRemove, setSelectedToRemove] = useState([]);

    const navigate = useNavigate();

    const AllLiked_DB = async() => {// fetch all liked movies/shows by current User
        const response_server = await fetch(`${import.meta.env.VITE_REQUEST_PATH}like/getLiked`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },
        
            credentials: "include",
        });

        // If refresh token is expired return user to main page
        // when refresh token expires, detect
        if(response_server.status === 401) {
            alert('Your session has expired, log in again');
            navigate('/');
            return;
        }
        // EXPIRED ACCESS TOKEN
        const newToken = response_server.headers.get("x-new-access-token");
        if(newToken) {
            localStorage.setItem('access_token', newToken);
        }

        const data = await response_server.json();

        if(!data.length) {
            setNothingLiked(true);
            return;
        }

        parseData(data);
    }

    const parseData = async(db_data) => {
        
        const pulledData = [];

        //loop of db records
        for(const db_col of db_data) {
            const db_record = db_col[0];
            
            //variables of records in DB
            const db_record_id = db_record.post_id;
            const db_record_type = db_record.media_type;
            const db_record_likedDate = db_record.like_date;


            //find db record in TMDB api
            const api_response = await contentByID(db_record_id, db_record_type);

            //Get from api {title, poster, media_type,} and when the user has liked it
            const api_title = api_response.title || api_response.name;
            const api_mediaType = api_response.media_type || (api_response?.title ? 'movie' : 'tv');
            const api_posterPath = api_response.poster_path;


            pulledData.push(
                {
                    id: db_record_id,
                    title: api_title,
                    media_type: api_mediaType,
                    poster_path: api_posterPath,
                    like_date: db_record_likedDate
                }
            )
        }

        
        //sort by latest liked post
        const latestLiked = pulledData.sort((a, b) => new Date(b.like_date) - new Date(a.like_date));

        //return
        setLikedData(latestLiked);
        
    };


    // FUNCTION: Delete / Navigate Post

    const handlePost = (post_id, title, media_type) => {
        //navigate avaliable
        if(deleteActive === false) {
            navigate(`/${media_type}/${slugify(title)}`, { state: { id: post_id } });
            return;
        }


        //delete avaliable
        setSelectedToRemove(prev => {
            const exists = prev.some(col => col.post_id === post_id && col.media_type === media_type);

            if (exists) {
                // Remove it
                return prev.filter(col => !(col.post_id === post_id && col.media_type === media_type));
            } else {
                // Add it
                return [...prev, { post_id, media_type }];
            }
        });
    };

    const handleDelete = () => {
        setDeleteActive(prev => {

            //if something is selected dont change the state
            if(selectedToRemove.length > 0) {
                
                //delete the selected items
                deleting();

                return true;
            }

            return !prev;
        })
    }

    // PROCESS FUNCTION: DELETING
    const deleting = async() => {
        
        // Verify you want to delete
        const answer = confirm("Are you sure you want to delete this?");

        if(!answer) {
            console.log("Cancel delete");
            return;
        }
        
        const response_s = await fetch(`${import.meta.env.VITE_REQUEST_PATH}like/delete`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },
            
            body: JSON.stringify({
                data: selectedToRemove,
            }),

            credentials: "include",
        });

        // EXPIRED ACCESS TOKEN
        const newToken = response_s.headers.get("x-new-access-token");
        if(newToken) {
            localStorage.setItem('access_token', newToken);
        }

        if(response_s.status === 204) {
            console.log("Deleted Successfully");
        }

        await AllLiked_DB();

        //trash valuse to default
        setDeleteActive(false);
        setSelectedToRemove([]);
    };

    useEffect(() => {
      
        if(!selectedToRemove?.length) return;

        console.log('Delete ==> ', selectedToRemove);
      
    }, [selectedToRemove])
    

    useEffect(() => {
        
        if(!token) return;

        (async() => {
            await AllLiked_DB();
        })();
        
    }, []);

    
    if(likedData === null && nothingLiked === false) {
        return <div>Loading...</div>
    }

    if(nothingLiked === true) {
       return <div>Nothing Liked</div>
    }
    
    return (
        <>
            <section className='w-full relative py-5'>
                <div className='w-[1200px] max-w-full px-5 mx-auto'>
                    
                    <div className='flex flex-row items-center justify-between'>

                        {/* Back Arrow */}
                        <FontAwesomeIcon icon={faChevronLeft} className='text-xl  text-white cursor-pointer' onClick={() => navigate(-1)}/>

                        {/* trash */}
                        <div className='inline-block relative'>
                            <FontAwesomeIcon icon={faTrashCan} onClick={() => handleDelete()} className={`${deleteActive === true ? '!text-red-500' : '!text-white'} text-2xl text-white hover:text-red-500 transition-colors duration-300 ease-in-out`} />
                            <span className={`text-red-500 absolute top-1/2 -translate-y-1/2 ${selectedToRemove.length > 0 ? 'right-7 w-auto opacity-100 ' : 'right-0 w-0 opacity-0'} -z-10 transition-all duration-300 ease-in-out`}>({selectedToRemove.length})</span>
                        </div>
                        
                    </div>

                    <div className='flex flex-wrap -mx-3 gap-y-6 mt-10'>
                        {
                            likedData.map(col => (
                                <div className="px-3 w-40 md:w-48 lg:w-56">
                                    <span
                                        className="relative block cursor-pointer"
                                        onClick={() => handlePost(col.id, col.title, col.media_type)}
                                    >
                                        <img
                                            src={`${IMAGE_PATH}${col.poster_path}`}
                                            className="w-full h-64 object-cover rounded-xl"
                                        />
                                        
                                        <h3 className="text-center mt-2 text-white text-sm">
                                            {col.title}
                                        </h3>

                                        {deleteActive && (
                                            <div
                                                className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-black ${
                                                    selectedToRemove.some(rec => rec.post_id === col.id)
                                                        ? 'bg-blue-500'
                                                        : 'bg-white'
                                                }`}
                                            />
                                        )}
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </section>
        </>
    )
}

export default Liked
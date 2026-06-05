import React, {useState, useEffect} from 'react'

//import components
import {Info} from './Components_collection.js'

//Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faThumbsUp, faThumbsDown, faReply, faAngleDown  } from "@fortawesome/free-solid-svg-icons";

//import default image
import default_profileImage from '../assets/default_profile_image/default.png'

// FUNCTION: parsing time to say ex: 2 days ago, 1 month ago ...
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };

    for (const key in intervals) {
        const value = Math.floor(seconds / intervals[key]);
        if (value >= 1) {
            // YT uses "1d" "2w" "4mo"
            const parseKey = value === 1 ? `${key}` : `${key}s`
            return value +" "+ parseKey + " ago";
        }
    }

    return "just now";
}

//user
let userInfo = null;

(async () => {
    const result = await Info();    // returns [ {...} ] || null
    userInfo = result;
})();

function Comments({post, media_type, token, forceLog_out}) {

    const [Input, setInput] = useState("");
    const [comments, setComments] = useState([]);
    const [totalComments, setTotalComments] = useState(0);
    const [replyOn, setReplyOn] = useState({
        author: null,
        comment_id: null
    });

    const loadComments = async() => {
        const response_s = await fetch(`${import.meta.env.VITE_REQUEST_PATH}comments/get`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type' : 'application/json',
            },

            credentials: "include",
            
            body: JSON.stringify ({
                post_id: post,
                media_type: media_type
            })
        });

        const results = await response_s.json();
        
        // EXPIRED ACCESS TOKEN
        const newToken = response_s.headers.get("x-new-access-token");
        if(newToken) {
            localStorage.setItem('access_token', newToken);
        }


        //get total comments
        setTotalComments(results.length);
        //making the upload date to say ex: 2 days ago, 1 hour ago, etc... 
        const parse_date = results.map(col => {
            return{
                ...col,
                time_ago: timeAgo(col.upload_date)
            }
        });

        //nested comments
        //variablse
        const map = {};
        const root = [];

        parse_date.forEach(col => {
            map[col.id] = {...col, replies: []};
        });

        parse_date.forEach(col => {
            if(col.parent_id === null) {
                root.push(map[col.id]);
            } else {
                map[col.parent_id].replies.push(map[col.id]);
            }
        });


        setComments(root);
    }

    const handleCommentSubmit = async() => {
        if(!token) return;
        if(Input.trim() === "") return;

        //variable that gets server response
        let response_s = null;

        if(replyOn.author && replyOn.comment_id) {
            console.log('Add new comment with parent_id = ', replyOn.comment_id);
            
            response_s = await fetch(`${import.meta.env.VITE_REQUEST_PATH}comments/replies`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },

                credentials: "include",

                body: JSON.stringify({
                    post_id: post,
                    media_type: media_type,
                    message: Input,
                    comment_id : replyOn.comment_id
                }),
            });
        
        } else {

            response_s = await fetch(`${import.meta.env.VITE_REQUEST_PATH}comments`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },

                credentials: "include",

                body: JSON.stringify({
                    post_id: post,
                    media_type: media_type,
                    message: Input
                }),
            });

        }
        
        // when refresh token expires, detect
        if(response_s.status === 401) {
            forceLog_out();
            return;
        }

        const result = await response_s.json();
        

        // EXPIRED ACCESS TOKEN
        const newToken = response_s.headers.get("x-new-access-token");
        if(newToken) {
            localStorage.setItem('access_token', newToken);
        }


        if(result.status === 500) {
            alert('DB Error occured');
            return;
        }


        console.log('The response after submitting a comment: ', result);

        //call coments
        await loadComments();

        // Reset input
        setInput("");

        // Reset reply mode
        handleRemoveReply();
    };

    const handleReplySubmit = async(comment_id, comment_author) => {//This is for the text that appears next to the input, saying the name of the user im replying to
        if(!token) {
            alert('Log in first, to reply');
            return;
        }

        if(!replyOn.author && !replyOn.comment_id) {

            setReplyOn({
                author:comment_author,
                comment_id:comment_id
            });

            return;
        }

        handleRemoveReply();
    

    };
    
    const handleRemoveReply = () => {
        setReplyOn({
            author:"",
            comment_id:null
        });
    }

    const handleReactingSubmit = async(comment_id, author, like = true) => {
        
        if(!token) {
            alert(`Log in first to ${like ? 'Like' : 'Dislike'}`);
            return;
        }

        const response_s = await fetch(`${import.meta.env.VITE_REQUEST_PATH}comments/reactions`, {
            method: 'POST',

            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },

            credentials: "include",

            body: JSON.stringify({
                post_id: post,
                media_type: media_type,
                comment_id: comment_id,
                author: author,
                reaction: like ? 'like' : 'dislike'
            })
        });

        // when refresh token expires, detect
        if(response_s.status === 401) {
            forceLog_out();
            return;
        }
        
        const results_s = await response_s.json();

        // EXPIRED ACCESS TOKEN
        const newToken = response_s.headers.get("x-new-access-token");
        if(newToken) {
            localStorage.setItem('access_token', newToken);
        }

        if(results_s.status === 500) {
            alert(results_s.message);
            return;
        }


        await loadComments();
    };

    const handleDeleteComment = async(comment_id) => {
        //checking if I have read userId comming from the movie/show and comming from userInfo for better security
        if(!token) return;

        console.log(`Deleting Comment:\nID: ${comment_id}\nAuthor: ${userInfo.user_name}`);
        
        const response_s = await fetch(`${import.meta.env.VITE_REQUEST_PATH}comments/delete`, {
            method: 'POST',
            
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },

            credentials: "include",

            body: JSON.stringify({
                post_id: post,
                media_type: media_type,
                comment_id: comment_id
            })
        });

        // when refresh token expires, detect
        if(response_s.status === 401) {
            forceLog_out();
            return;
        }

        const results_s = await response_s.json();

        // EXPIRED ACCESS TOKEN
        const newToken = response_s.headers.get("x-new-access-token");
        if(newToken) {
            localStorage.setItem('access_token', newToken);
        }

        if(results_s.status !== 200) {
            alert(results_s.message);
            return;
        }


        alert(results_s.message);
        await loadComments();
    }


    useEffect(() => {
      
        (async() => {
            //load Comments
            await loadComments();
        })();
        
    }, [post]);

    
    useEffect(() => {
      
        if(!comments.length) return;
        console.log('My user_id: ', userInfo);
        console.log('Comments Structure: ', comments);
        
    }, [comments])
    

    return (
        <>
            {/* Comments Block */}
            <section className='w-full relative py-5' id='commentsSection'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

                    {/* Title */}
                    <div className="mb-5">
                        <h3 className="font-bold text-base sm:text-lg">
                            {totalComments} Comments
                        </h3>
                    </div>

                    {/* Input */}
                    <div className="w-full relative pl-12 sm:pl-14 mb-8 sm:mb-10">

                        {/* Avatar */}
                        <div className="bg-blue-400 rounded-full w-9 h-9 sm:w-10 sm:h-10 p-1 flex justify-center items-center absolute left-0 top-1/2 -translate-y-1/2">
                            <img
                                src={userInfo?.profile_image || default_profileImage}
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>

                        <form action="#">
                            <div className={`relative flex items-start gap-2`}>

                                {replyOn.author && (
                                    <span className='inline-block bg-teal-600 text-xs sm:text-sm rounded-lg px-2 py-[2px]'>
                                        @{replyOn.author}
                                    </span>
                                )}

                                <textarea
                                    value={Input}
                                    onInput={(e) => {
                                        e.target.style.height = "auto";
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    onChange={(e) => !token ? null : setInput(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Backspace' &&
                                        Input === "" &&
                                        replyOn.author ? handleRemoveReply() : null
                                    }
                                    onClick={() => !token && alert('Log in first, to comment')}
                                    className="w-full resize-none overflow-hidden border-b border-white outline-none text-sm sm:text-base pr-8"
                                    rows={1}
                                    placeholder="Add a comment..."
                                />

                                <FontAwesomeIcon
                                    onClick={handleCommentSubmit}
                                    icon={faPaperPlane}
                                    className={`${Input.trim() === ""
                                        ? "pointer-events-none text-gray-400"
                                        : "pointer-events-auto text-white"
                                        } text-sm sm:text-base cursor-pointer absolute top-1/2 -translate-y-1/2 right-0`}
                                />

                            </div>
                        </form>
                    </div>

                    {/* Comments List */}
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <Comment
                                key={comment.id}
                                comment={comment}
                                handleReplySubmit={handleReplySubmit}
                                handleReactingSubmit={handleReactingSubmit}
                                handleDeleteComment={handleDeleteComment}
                            />
                        ))
                    ) : (
                        <div className="text-sm text-white/70">No Comments...</div>
                    )}

                </div>
            </section>
        </>
    );
}

export default Comments

const Comment = ({ comment, handleReplySubmit, handleReactingSubmit, handleDeleteComment }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [showMenu, setShowMenu] = useState(null);
    return (
        <div className="mb-6 sm:mb-10 ml-0 sm:ml-6">

            <div className="relative pl-12 sm:pl-13">

                {/* Avatar */}
                <img
                    src={comment.profile_image || default_profileImage}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full absolute top-0 left-0 object-cover"
                />

                <div>

                    {/* Header Row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">

                        <h3 className={comment.display_name === "Me"
                            ? "text-yellow-400 text-sm sm:text-base"
                            : "text-white text-sm sm:text-base"
                        }>
                            @{comment.display_name}
                        </h3>

                        <span className="text-white/80 text-xs sm:text-sm">
                            {comment.time_ago}
                        </span>

                        <span
                        className={`relative ml-auto ${
                            comment.user_name === userInfo?.user_name
                                ? 'inline-block'
                                : 'hidden'
                        }`}
                        >   
                            <b
                                className="cursor-pointer select-none"
                                onClick={() =>
                                    setShowMenu(
                                        showMenu === comment.id
                                            ? null
                                            : comment.id
                                    )
                                }
                            >
                                •••
                            </b>

                            {showMenu === comment.id && (
                                <ul
                                    className="
                                        absolute
                                        right-0
                                        top-full
                                        mt-1
                                        w-24
                                        text-center
                                        rounded-lg
                                        bg-[#1f2937]
                                        shadow-lg
                                        z-50
                                    "
                                >
                                    <li
                                        className="
                                            cursor-pointer
                                            hover:text-red-500
                                            text-white
                                            text-sm
                                            py-2
                                        "
                                        onClick={() => {
                                            handleDeleteComment(comment.id);
                                            setShowMenu(null);
                                        }}
                                    >
                                        Delete
                                    </li>
                                </ul>
                            )}
                        </span>

                    </div>

                    {/* Message */}
                    <p className="text-sm sm:text-base mt-1">
                        {comment.message}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-sm sm:text-base">

                        <div className="flex items-center gap-1">
                            <FontAwesomeIcon
                                icon={faThumbsUp}
                                className={`${comment.my_reaction === 'like' ? '!text-blue-500' : '!text-white'} cursor-pointer`}
                                onClick={() => handleReactingSubmit(comment.id, comment.user_name, true)}
                            />
                            {comment.total_likes}
                        </div>

                        <div className="flex items-center gap-1">
                            <FontAwesomeIcon
                                icon={faThumbsDown}
                                className={`${comment.my_reaction === 'dislike' ? '!text-blue-500' : '!text-white'} cursor-pointer`}
                                onClick={() => handleReactingSubmit(comment.id, comment.user_name, false)}
                            />
                            {comment.total_dislikes}
                        </div>

                        <FontAwesomeIcon
                            icon={faReply}
                            onClick={() => handleReplySubmit(comment.id, comment.user_name)}
                            className="cursor-pointer"
                        />

                    </div>

                    {/* Replies toggle */}
                    {comment.replies.length > 0 && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="text-blue-400 text-xs sm:text-sm mt-2 flex items-center gap-1"
                        >
                            {showReplies ? "▲ Hide replies" : "▼ View replies"}
                            <span>({comment.replies.length})</span>
                        </button>
                    )}

                </div>
            </div>

            {/* Replies */}
            {showReplies && (
                <div className="ml-4 sm:ml-8 mt-3 sm:mt-4 border-l border-white/20 pl-3 sm:pl-4">
                    {comment.replies.map(reply => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            handleReplySubmit={handleReplySubmit}
                            handleReactingSubmit={handleReactingSubmit}
                            handleDeleteComment={handleDeleteComment}
                        />
                    ))}
                </div>
            )}

        </div>
    );
};
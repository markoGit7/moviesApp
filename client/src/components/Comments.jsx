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
        const response_s = await fetch('http://localhost:3000/comments/get', {
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


        //decode profile image
        results.forEach(col => {
            if(col.profile_image) {
                const uint8 = new Uint8Array(col.profile_image.data);

                let binary = "";
                uint8.forEach(byte => binary += String.fromCharCode(byte));

                col.profile_image = `data:image/jpeg;base64,${btoa(binary)}`;
            }
        })

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
            
            response_s = await fetch('http://localhost:3000/comments/replies', {
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

            response_s = await fetch('http://localhost:3000/comments', {
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
        alert(result.message);

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

        const response_s = await fetch('http://localhost:3000/comments/reactions', {
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

        alert(results_s.message);

        await loadComments();
    };

    const handleDeleteComment = async(comment_id) => {
        //checking if I have read userId comming from the movie/show and comming from userInfo for better security
        if(!token) return;

        console.log(`Deleting Comment:\nID: ${comment_id}\nAuthor: ${userInfo.user_name}`);
        
        const response_s = await fetch('http://localhost:3000/comments/delete', {
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
                <div className='w-[1200px] max-w-full px-5 mx-auto'>
                    {/* Counts/Ajustments */}
                    <div className="mb-5">
                        <h3 className="font-bold text-lg">{totalComments} Comments</h3>
                    </div>
                    {/* Enter Coment */}
                    <div className="w-full h-auto relative pl-13 mb-10">
                        <div className="bg-blue-400 rounded-full w-10 h-10 p-1 flex justify-center items-center absolute left-0 top-1/2 -translate-y-1/2">
                            <img src={userInfo?.profile_image || default_profileImage} className="w-10 h-10 object-cover object-center rounded-full absolute top-0 left-0"/>
                        </div>
                        <form action="#">
                            <div className={`relative ${replyOn.author ? 'flex gap-x-1' : 'block'}`}>
                                
                                {
                                    replyOn.author && 
                                    (
                                        <span className='inline-block bg-teal-600 text-sm rounded-lg p-[0px_3px]'>@{replyOn.author}</span>
                                    )
                                }
                                
                                <textarea
                                    value={Input}
                                    onInput={(e) => {
                                        e.target.style.height = "auto";
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    onChange={(e) => !token ? null : setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Backspace' && Input === "" && replyOn.author ? handleRemoveReply() : null}
                                    onClick={() => !token && alert('Log in first, to comment')}
                                    className={`w-full resize-none overflow-hidden border-b-white border-b-1 outline-none `}

                                    rows="1"
                                    placeholder="Add a comment..."
                                />
                                <FontAwesomeIcon onClick={handleCommentSubmit} icon={faPaperPlane} className={`${Input.trim() === "" ? "pointer-events-none text-gray-400" : "pointer-events-auto text-white"} text-base cursor-pointer absolute top-1/2 -translate-y-1/2 right-0`}/>
                            </div>
                        </form>
                    </div>

                    {/* All Comments Block */}
                    {comments.length > 0 ? (
                            comments.map(comment => (
                                <Comment key={comment.id} comment={comment} handleReplySubmit={handleReplySubmit} handleReactingSubmit={handleReactingSubmit} handleDeleteComment={handleDeleteComment}/>
                            ))
                        ) 
                        : 
                        (
                            <div>No Comments...</div>
                        )
                    }
                    
                </div>
            </section>
        </>
    )
}

export default Comments

const Comment = ({ comment, handleReplySubmit, handleReactingSubmit, handleDeleteComment }) => {
    const [showReplies, setShowReplies] = useState(false);

    return (
        <div className="mb-10 ml-6">

            <div className="relative pl-13">
                <img
                    src={comment.profile_image || default_profileImage}
                    className="w-10 h-10 rounded-full absolute top-0 left-0 object-cover"
                />

                <div>
                    <div className="flex gap-x-5 items-center">
                        <h3 className={comment.display_name === "Me" ? "text-yellow-400" : "text-white"}>
                            @{comment.display_name}
                        </h3>
                        
                        <span className="text-white/80 text-sm">{comment.time_ago}</span>
                        
                        <span className={`relative group ml-auto ${comment.user_name === userInfo?.user_name ? 'inline-block' : 'hidden'}`}>
                            <b className='cursor-pointer'>•••</b>
                            <ul className='absolute  right-0 origin-top-right w-20 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 text-center rounded-lg bg-[#1f2937] transition-all duration-300 ease-in-out'>
                                <li className='cursor-pointer hover:text-red-500 text-white' onClick={() => userInfo.user_name && comment.user_name && handleDeleteComment(comment.id)}>Delete</li>
                            </ul>
                        </span>
                    </div>

                    <p>{comment.message}</p>

                    <div className="flex items-center gap-x-4 mt-1">
                        {/* Like */}
                        <div>
                            <FontAwesomeIcon icon={faThumbsUp} className={`${comment.my_reaction === 'like' ? '!text-blue-500' : '!text-white'} text-lg cursor-pointer`} onClick={() => handleReactingSubmit(comment.id, comment.user_name, true)}/>
                            {comment.total_likes}
                        </div>
                        {/* Dislike */}
                        <div>
                            <FontAwesomeIcon icon={faThumbsDown} className={`${comment.my_reaction === 'dislike' ? '!text-blue-500' : '!text-white'} text-lg cursor-pointer`} onClick={() => handleReactingSubmit(comment.id, comment.user_name, false)}/>
                            {comment.total_dislikes}
                        </div>
                        <div>
                            <FontAwesomeIcon
                                icon={faReply}
                                onClick={() => handleReplySubmit(comment.id, comment.user_name)}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* ▼ SHOW / HIDE REPLIES BUTTON */}
                    {comment.replies.length > 0 && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="text-blue-400 text-sm mt-2 flex items-center gap-1"
                        >
                            {showReplies ? "▲ Hide replies" : "▼ View replies"}
                            <span>({comment.replies.length})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Nested replies */}
            {showReplies && (
                <div className="ml-8 mt-4 border-l border-white/20 pl-4">
                    {comment.replies.map(reply => (
                        <Comment key={reply.id} comment={reply} handleReplySubmit={handleReplySubmit} handleReactingSubmit={handleReactingSubmit} handleDeleteComment={handleDeleteComment} />
                    ))}
                </div>
            )}
        </div>
    );
};
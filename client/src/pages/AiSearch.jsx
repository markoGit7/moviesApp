import React,{useState} from 'react'

function AiSearch() {

    const [query, setQuery] = useState("");

    const handleSubmit = () => {
        console.log('Searching movie/show that contains... ', {description: query});
    }

    return (
        <div>
            <input type='text' onChange={(e) => setQuery(e.target.value)} placeholder='Describe what kind of movie/show your looking for...' className='bg-white text-black w-[100px] p-[10px_0px'/>
            <button type='submit' onClick={handleSubmit}>Search</button>

            <p>A movie where a boy did big hacking, and got captured then when he was a teenager he moved in to tokyo. Over there he met other teenagers and a girl that he was hanging around. All teenagers teamed up to at hacking against on guy</p>
        </div>
    )
}

export default AiSearch
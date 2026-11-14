// Import global request
import request from "../../api/globalRequests";

export default async function info() {
    const token = localStorage.getItem("access_token") || null;

    if(!token) {
        return null;
    }

    const response = await request('http://localhost:3000/user/info', 'post', true, 'off', null);

    const result = response;

    const parseResult = {...result};

    console.log('User INFO: ', parseResult);

    return parseResult;

}
import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
        common: {
            'G-ClientID':  import.meta.env.VITE_CLIENT_ID,
            'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_TOKEN}`
        }
    },
});

instance.interceptors.response.use(function (response) {
    if (response.data?.status !== 'OK') {
        return Promise.reject(response.data?.message);
    }
    return response;
}, function (error) {
    return Promise.reject(error);
});

export default instance;
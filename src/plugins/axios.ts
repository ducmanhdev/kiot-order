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

type AxiosInstanceConfig = {
    baseURL: string;
    gClientId: string;
    token: string;
}

export const setAxiosInstance = (config: AxiosInstanceConfig) => {
    instance.defaults.baseURL = config.baseURL + '/v1';
    instance.defaults.headers.common['G-ClientID'] = config.gClientId;
    instance.defaults.headers.common['Authorization'] = `Bearer ${config.token}`;
}

instance.interceptors.response.use(function (response) {
    if (response.data?.status !== 'OK') {
        return Promise.reject(response.data?.message);
    }
    return response;
}, function (error) {
    return Promise.reject(error);
});

export default instance;
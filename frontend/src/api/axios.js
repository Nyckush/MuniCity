import axios from "axios";
import { clearStoredAuth, getValidStoredAuth } from "@/lib/auth";

const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const auth = getValidStoredAuth();

    if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearStoredAuth();
        }

        return Promise.reject(error);
    }
);

export default api;

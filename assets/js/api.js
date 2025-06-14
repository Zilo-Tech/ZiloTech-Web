const BASE_URL = 'http://localhost:8000/api';

class ApiClient {
    constructor() {
        this.loadTokens();
    }

    loadTokens() {
        const tokens = localStorage.getItem('authTokens');
        this.authTokens = tokens ? JSON.parse(tokens) : null;
        console.log('Loaded tokens:', this.authTokens);
    }

    setTokens(tokens) {
        console.log('Setting tokens:', tokens);
        this.authTokens = tokens;
        localStorage.setItem('authTokens', JSON.stringify(tokens));
    }

    clearTokens() {
        console.log('Clearing tokens');
        this.authTokens = null;
        localStorage.removeItem('authTokens');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.authTokens && this.authTokens.access) {
            headers['Authorization'] = `Bearer ${this.authTokens.access}`;
            console.log('Authorization header set:', headers['Authorization']);
        } else {
            console.log('No access token available');
        }
        return headers;
    }

        // Add to api.js
    async upload(endpoint, formData) {
        try {
            const options = {
                method: 'PUT',
                headers: this.getHeaders(),
                body: formData
            };
            delete options.headers['Content-Type']; // Let browser set multipart boundary
            console.log(`[PUT] Upload to: ${BASE_URL}${endpoint}`);
            const response = await fetch(`${BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            return response.status === 204 ? {} : await response.json();
        } catch (error) {
            throw error;
        }
    }

    async request(method, endpoint, body = null) {
        try {
            const options = {
                method,
                headers: this.getHeaders(),
            };
            if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
                options.body = JSON.stringify(body);
            }
            console.log(`[${method}] Request to: ${BASE_URL}${endpoint}`);
            const response = await fetch(`${BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            return response.status === 204 ? {} : await response.json();
        } catch (error) {
            throw error;
        }
    }

    async get(endpoint) {
        return this.request('GET', endpoint);
    }

    async post(endpoint, body) {
        return this.request('POST', endpoint, body);
    }

    async put(endpoint, body) {
        return this.request('PUT', endpoint, body);
    }

    async patch(endpoint, body) {
        return this.request('PATCH', endpoint, body);
    }

    async delete(endpoint) {
        return this.request('DELETE', endpoint);
    }
}

const apiClient = new ApiClient();
window.apiClient = apiClient;
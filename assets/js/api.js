const BASE_URL = 'http://localhost:8000/api';

class ApiClient {
    constructor() {
        this.authTokens = null;
    }

    setTokens(tokens) {
        this.authTokens = tokens;
    }

    clearTokens() {
        this.authTokens = null;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.authTokens && this.authTokens.access) {
            headers['Authorization'] = `Bearer ${this.authTokens.access}`;
        }
        return headers;
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
window.apiClient = apiClient; // Make globally accessible
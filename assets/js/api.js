const BASE_URL = 'https://ziloteck-backend.onrender.com/api';

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

    getHeaders(requireAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (requireAuth && this.authTokens && this.authTokens.access) {
            headers['Authorization'] = `Bearer ${this.authTokens.access}`;
            console.log('Authorization header set:', headers['Authorization']);
        } else if (!requireAuth) {
            console.log('No authorization header needed');
        } else {
            console.log('No access token available');
        }
        return headers;
    }

    async upload(endpoint, formData) {
        try {
            const options = {
                method: 'PUT',
                headers: this.getHeaders(true), // Uploads may require auth
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

    async request(method, endpoint, body = null, requireAuth = true) {
        try {
            const options = {
                method,
                headers: this.getHeaders(requireAuth),
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

    async get(endpoint, requireAuth = true) {
        return this.request('GET', endpoint, null, requireAuth);
    }

    async post(endpoint, body) {
        return this.request('POST', endpoint, body, true);
    }

    async put(endpoint, body) {
        return this.request('PUT', endpoint, body, true);
    }

    async patch(endpoint, body) {
        return this.request('PATCH', endpoint, body, true);
    }

    async delete(endpoint) {
        return this.request('DELETE', endpoint, null, true);
    }

    async getPublishedBlogs() {
        try {
            const blogs = await this.get('/blogs/', false); // No auth for blogs
            return blogs.filter(blog => blog.status === 'published' && blog.is_active);
        } catch (error) {
            console.error('Error fetching published blogs:', error);
            return [];
        }
    }

    async getBlogById(apiId) {
        try {
            return await this.get(`/blogs/${apiId}/`, false); // No auth for blog details
        } catch (error) {
            console.error(`Error fetching blog with ID ${apiId}:`, error);
            throw error;
        }
    }

    async getRecommendedBlogs(currentBlogId) {
        try {
            const publishedBlogs = await this.getPublishedBlogs();
            const otherBlogs = publishedBlogs.filter(blog => blog.api_id !== currentBlogId);
            const shuffled = otherBlogs.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 4);
        } catch (error) {
            console.error('Error fetching recommended blogs:', error);
            return [];
        }
    }
}

const apiClient = new ApiClient();
window.apiClient = apiClient;
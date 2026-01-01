// ============================================
// apiClient.ts - Centralized API Handler with Token Expiry
// ============================================

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = '') {
        this.baseURL = baseURL;
    }

    /**
     * Main fetch method with automatic token expiry handling
     */
    async fetch(url: string, options: FetchOptions = {}): Promise<Response> {
        const token = localStorage.getItem('access_token');

        // Add authorization header if token exists
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${this.baseURL}${url}`, config);

            // Check for 401 Unauthorized (token expired/invalid)
            if (response.status === 401) {
                this.handleTokenExpiry();
                throw new Error('Session expired. Please log in again.');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Handle token expiry - clear storage and redirect to login
     */
    private handleTokenExpiry(): void {
        console.log('Token expired - logging out');

        // Clear all auth data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        // Redirect to login page
        window.location.href = '/login';
    }

    /**
     * GET request
     */
    async get(url: string, options?: FetchOptions): Promise<Response> {
        return this.fetch(url, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post(url: string, data?: any, options?: FetchOptions): Promise<Response> {
        return this.fetch(url, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PUT request
     */
    async put(url: string, data?: any, options?: FetchOptions): Promise<Response> {
        return this.fetch(url, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PATCH request
     */
    async patch(url: string, data?: any, options?: FetchOptions): Promise<Response> {
        return this.fetch(url, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * DELETE request
     */
    async delete(url: string, options?: FetchOptions): Promise<Response> {
        return this.fetch(url, { ...options, method: 'DELETE' });
    }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances if needed
export default ApiClient;
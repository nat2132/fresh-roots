const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
  }

  getHeaders(auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const { auth = false, ...fetchOptions } = options;
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...this.getHeaders(auth),
        ...fetchOptions.headers,
      },
    });

    if (response.status === 401 && auth) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.request(endpoint, options);
      }
    }

    const data = await response.json();
    if (!response.ok) throw { status: response.status, ...data };
    return data;
  }

  async refreshToken() {
    const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (!refresh) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      const data = await response.json();
      if (response.ok && data.access) {
        localStorage.setItem('access_token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
        return true;
      }
    } catch (e) {
      console.error('Token refresh failed:', e);
    }
    return false;
  }

  // Auth
  async login(username, password) {
    const data = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
  }

  async register(userData) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/profile/', { auth: true });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(uid, token, password, password_confirm) {
    return this.request('/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify({ uid, token, password, password_confirm }),
    });
  }

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products/?${query}`);
  }

  async getProduct(slug) {
    return this.request(`/products/${slug}/`);
  }

  async getCategories() {
    return this.request('/products/categories/');
  }

  async getFeaturedProducts() {
    return this.request('/products/featured/');
  }

  // Cart
  async getCart() {
    return this.request('/cart/', { auth: true });
  }

  async addToCart(product_id, quantity = 1) {
    return this.request('/cart/add/', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ product_id, quantity }),
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/item/${itemId}/`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId) {
    return this.request(`/cart/item/${itemId}/`, {
      method: 'DELETE',
      auth: true,
    });
  }

  // Orders
  async getOrders() {
    return this.request('/orders/', { auth: true });
  }

  async createOrder(delivery_address, notes = '') {
    return this.request('/orders/create/', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ delivery_address, notes }),
    });
  }

  async reorder(orderId) {
    return this.request(`/orders/${orderId}/reorder/`, {
      method: 'POST',
      auth: true,
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

const api = new ApiClient();
export default api;

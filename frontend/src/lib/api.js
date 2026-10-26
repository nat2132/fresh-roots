const API_PORT = '8000';
const API_PATH = '/api';
const WS_PATH = '/ws';

// Dynamically derive the API host from the browser's current hostname.
// This means: opening from localhost → uses localhost:8000
//             opening from 192.168.x.x → uses that same IP:8000
// No hardcoded IPs, no double-request fallback, no noisy console warnings.
const getApiBase = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering: use env var or localhost
    const host = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${API_PORT}${API_PATH}`;
    return host;
  }
  // If an explicit override is set, respect it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  const hostname = window.location.hostname;
  return `http://${hostname}:${API_PORT}${API_PATH}`;
};

const getWsBase = () => {
  // If an explicit override is set, respect it
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  if (typeof window === 'undefined') {
    return `ws://localhost:${API_PORT}${WS_PATH}`;
  }
  // Match the page's scheme: wss:// over https (proxies/LBs often handle TLS),
  // plain ws:// over http so local dev keeps working
  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const hostname = window.location.hostname;
  return `${scheme}://${hostname}:${API_PORT}${WS_PATH}`;
};

// Keep these for any legacy references
const getDefaultApiBase = () => getApiBase();
const getDefaultWsBase = () => getWsBase();

class ApiClient {
  constructor() {
    // Use dynamic host detection — resolved at call time so SSR and client both work
    this.baseURL = getApiBase();
    this.wsBaseURL = getWsBase();
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
    // Re-derive base URL on every request so dynamic host is always current
    const base = getApiBase();
    const url = `${base}${endpoint}`;

    try {
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

      // Some requests might not return JSON (e.g. 204 No Content)
      if (response.status === 204) return null;

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw { status: response.status, ...data };
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw { detail: `Could not connect to server at ${url}. Is the backend running?` };
      }
      throw error;
    }
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
      } else {
        this.logout();
      }
    } catch (e) {
      console.error('Token refresh failed:', e);
      this.logout();
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

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
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

  async getOrderTracking(orderNumber) {
    return this.request(`/orders/${orderNumber}/tracking/`, { auth: true });
  }

  async createOrder(orderData) {
    // orderData: { delivery_address, delivery_phone, payment_method, notes }
    return this.request('/orders/create/', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(orderData),
    });
  }

  async reorder(orderNumber) {
    return this.request(`/orders/${orderNumber}/reorder/`, {
      method: 'POST',
      auth: true,
    });
  }

  async getAdminStats() {
    return this.request('/orders/admin-stats/', { auth: true });
  }

  // Feedback
  async getReviews() {
    return this.request('/feedback/', { auth: true });
  }

  async createReview(orderId, rating, comment, image = null) {
    const formData = new FormData();
    formData.append('order', orderId);
    formData.append('rating', rating);
    formData.append('comment', comment);
    if (image) formData.append('image', image);

    // Using fetch directly for FormData
    const url = `${this.baseURL}/feedback/`;
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw { status: response.status, ...data };
    return data;
  }

  // Promotions
  async getCoupons() {
    return this.request('/promotions/', { auth: true });
  }

  async applyCoupon(code, subtotal) {
    return this.request('/promotions/apply/', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ code, subtotal }),
    });
  }

  // Support
  async createSupportTicket(data) {
    return this.request('/support/', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    });
  }

  async getSupportTickets() {
    return this.request('/support/', { auth: true });
  }

  // Promotions / Coupons
  async getPromotions() {
    return this.request('/promotions/', { auth: true });
  }

  async createPromotion(data) {
    return this.request('/promotions/', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    });
  }

  // Admin / Staff Methods
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/auth/users/?${queryString}` : '/auth/users/';
    return this.request(endpoint, { auth: true });
  }

  async createStaff(data) {
    return this.request('/auth/staff/create/', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    });
  }

  async manageUser(userId, data) {
    return this.request(`/auth/users/${userId}/manage/`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(data),
    });
  }

  async getAdminFarmers() {
    return this.request('/farmers/', { auth: true });
  }

  async createFarmer(data) {
    return this.request('/farmers/', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    });
  }

  async getFarmerHistory(farmerCode) {
    return this.request(`/farmers/${farmerCode}/supply-history/`, { auth: true });
  }

  // Procurement
  async getProcurementBatches() {
    return this.request('/procurement/', { auth: true });
  }

  async createProcurementBatch(data) {
    return this.request('/procurement/', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    });
  }

  async updateProcurementBatch(batchNumber, data) {
    return this.request(`/procurement/${batchNumber}/`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(data),
    });
  }

  // Warehouse
  async getWarehouses() {
    return this.request('/warehouse/warehouses/', { auth: true });
  }

  async getWarehouseInventory() {
    return this.request('/warehouse/inventory/', { auth: true });
  }

  async receiveWarehouseStock(data) {
    return this.request('/warehouse/receive/', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    });
  }

  async getLowStockAlerts() {
    return this.request('/warehouse/low-stock/', { auth: true });
  }

  async getAdminProducts() {
    return this.request('/products/manage/all/', { auth: true });
  }

  async createAdminProduct(data) {
    return this.request('/products/manage/all/', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    });
  }

  async updateAdminProduct(slug, data) {
    return this.request(`/products/manage/${slug}/`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(data),
    });
  }

  async getAdminOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/orders/?${queryString}` : '/orders/';
    return this.request(endpoint, { auth: true });
  }

  async updateOrderStatus(orderNumber, status) {
    return this.request(`/orders/${orderNumber}/status/`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({ status }),
    });
  }

  async getAdminDeliveries() {
    return this.request('/deliveries/admin-all/', { auth: true });
  }

  async verifyDelivery(deliveryId, verificationCode) {
    return this.request(`/deliveries/${deliveryId}/deliver/`, {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ verification_code: verificationCode }),
    });
  }

  // WebSockets
  createOrderWebSocket(orderNumber, onMessage) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    if (!token) return null;

    const baseUrl = this.wsBaseURL.endsWith('/') ? this.wsBaseURL.slice(0, -1) : this.wsBaseURL;
    const wsUrl = `${baseUrl}/orders/${orderNumber}/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('WebSocket message parsing error:', e);
      }
    };
    
    ws.onerror = (error) => {
      // Avoid logging errors for connections that are already closing/closed (e.g. React double-mount)
      if (ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
        console.error('Order WebSocket error:', error);
      }
    };

    return ws;
  }

  createDashboardWebSocket(onMessage) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    if (!token) return null;

    const baseUrl = this.wsBaseURL.endsWith('/') ? this.wsBaseURL.slice(0, -1) : this.wsBaseURL;
    const wsUrl = `${baseUrl}/dashboard/?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('Dashboard WebSocket message parsing error:', e);
      }
    };

    ws.onerror = (error) => {
      // Avoid logging errors for connections that are already closing/closed
      if (ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
        console.error('Dashboard WebSocket error:', error);
      }
    };

    return ws;
  }
}

const api = new ApiClient();
export default api;

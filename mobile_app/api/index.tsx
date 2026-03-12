import api from "./axios";

// API functions
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const response = await api.post("/users/register", userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/users/login", credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  updateProfile: async (userData: {
    username: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    const response = await api.put("/users/me", userData);
    return response.data;
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put("/users/change-password", passwordData);
    return response.data;
  },
};

export const productAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  getBestSellers: async (limit = 20) => {
    const response = await api.get("/products/best-sellers", {
      params: { limit },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getByCategory: async (categoryId: string) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  // search: async (query) => {
  //   const response = await api.get("/products/search", {
  //     params: { q: query },
  //   });
  //   return response.data;
  // },

  // Admin CRUD operations
  // create: async (productData) => {
  //   const response = await api.post("/products", productData);
  //   return response.data;
  // },

  update: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export const categoryAPI = {
  getAll: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (categoryData: any) => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  update: async (id: string, categoryData: any) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const cartAPI = {
  getMyCart: async () => {
    const response = await api.get("/carts/my");
    return response.data;
  },

  createCart: async (userId: string) => {
    const response = await api.post("/carts", { user: userId });
    return response.data;
  },
};

export const cartItemAPI = {
  getByCart: async (cartId: string) => {
    const response = await api.get("/cart-items", {
      params: { cart: cartId },
    });
    return response.data;
  },

  addItem: async (
    cartId: string,
    productId: string,
    quantity: number,
    price: any,
    size: string,
  ) => {
    const response = await api.post("/cart-items", {
      cart: cartId,
      product: productId,
      quantity,
      price,
      size,
    });
    return response.data;
  },

  updateItem: async (itemId: string, quantity: number, price: number) => {
    const response = await api.put(`/cart-items/${itemId}`, {
      quantity,
      price,
    });
    return response.data;
  },

  deleteItem: async (itemId: string) => {
    const response = await api.delete(`/cart-items/${itemId}`);
    return response.data;
  },
};

export const orderAPI = {
  create: async (orderData: any) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get("/orders");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get("/orders/my");
    return response.data;
  },

  update: async (id: string, orderData: any) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

export const vnpayAPI = {
  createPaymentUrl: async (payload: any) => {
    const response = await api.post("/vnpay/create", payload);
    return response.data;
  },
  verifyReturn: async (params: any) => {
    const response = await api.get("/vnpay/return", { params });
    return response.data;
  },
};

export const reviewAPI = {
  getByProduct: async (productId: string) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },
  canReview: async (productId: string) => {
    const response = await api.get(`/reviews/can-review/${productId}`);
    return response.data;
  },
  createOrUpdate: async (productId: string, payload: any) => {
    const response = await api.post(`/reviews/product/${productId}`, payload);
    return response.data;
  },
  update: async (reviewId: string, payload: any) => {
    const response = await api.put(`/reviews/${reviewId}`, payload);
    return response.data;
  },
  remove: async (reviewId: string) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

export const statsAPI = {
  getDashboard: async () => {
    const response = await api.get("/stats/dashboard");
    return response.data;
  },
};

export const managerAPI = {
  getStats: async () => {
    const response = await api.get("/manager/stats");
    return response.data;
  },
  getOrders: async (params = {}) => {
    const response = await api.get("/manager/orders", { params });
    return response.data;
  },
  getProducts: async (params = {}) => {
    const response = await api.get("/manager/products", { params });
    return response.data;
  },
  createProduct: async (productData: any) => {
    const response = await api.post("/manager/products", productData);
    return response.data;
  },
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/manager/products/${id}`, productData);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/manager/products/${id}`);
    return response.data;
  },
  // Manager Reports
  // getSales: async (startDate, endDate) => {
  //   const params = {};
  //   if (startDate) params.startDate = startDate;
  //   if (endDate) params.endDate = endDate;
  //   const response = await api.get("/manager/reports/sales", { params });
  //   return response.data;
  // },
  getTopProducts: async (limit = 10) => {
    const response = await api.get("/manager/reports/top-products", {
      params: { limit },
    });
    return response.data;
  },
  getRevenueByCategory: async () => {
    const response = await api.get("/manager/reports/revenue-by-category");
    return response.data;
  },
  getCustomerStats: async () => {
    const response = await api.get("/manager/reports/customers");
    return response.data;
  },
  getInventory: async () => {
    const response = await api.get("/manager/reports/inventory");
    return response.data;
  },
};

export const reportAPI = {
  // getSales: async (startDate, endDate) => {
  //   const params = {};
  //   if (startDate) params.startDate = startDate;
  //   if (endDate) params.endDate = endDate;
  //   const response = await api.get("/reports/sales", { params });
  //   return response.data;
  // },
  getTopProducts: async (limit = 10) => {
    const response = await api.get("/reports/top-products", {
      params: { limit },
    });
    return response.data;
  },
  getRevenueByCategory: async () => {
    const response = await api.get("/reports/revenue-by-category");
    return response.data;
  },
  getCustomerStats: async () => {
    const response = await api.get("/reports/customers");
    return response.data;
  },
  getInventory: async () => {
    const response = await api.get("/reports/inventory");
    return response.data;
  },
};

export const chatbotAPI = {
  chat: async ({
    message,
    productIds,
  }: { message?: string; productIds?: string[] } = {}) => {
    const response = await api.post("/chatbot/chat", { message, productIds });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get("/chatbot/history");
    return response.data;
  },
};

export const aiBehaviorLogAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/ai-behavior-logs", { params });
    return response.data;
  },
  getMine: async (params = {}) => {
    const response = await api.get("/ai-behavior-logs/me", { params });
    return response.data;
  },
  create: async (payload: any) => {
    const response = await api.post("/ai-behavior-logs", payload);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/ai-behavior-logs/${id}`);
    return response.data;
  },
};

export const userAPI = {
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: any) => {
    const response = await api.post("/users/register", userData);
    return response.data;
  },

  update: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  assignRoles: async (userId: string, roleIds: string[]) => {
    const response = await api.post(`/users/${userId}/roles`, { roleIds });
    return response.data;
  },
};

export const roleAPI = {
  getAll: async () => {
    const response = await api.get("/roles");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },
};

export default api;

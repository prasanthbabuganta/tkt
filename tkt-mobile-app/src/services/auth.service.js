import api from './axios.instance';

export const authService = {
  login: async (mobileNumber, pin, tenantId) => {
    const response = await api.post('/auth/login', { mobileNumber, pin, tenantId });
    return response.data; // Returns ApiResponse wrapper
  },

  refresh: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data; // Returns ApiResponse wrapper
  },

  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data; // Returns ApiResponse wrapper
  },
};

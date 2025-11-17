import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from secure store:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (!refreshToken) {
          // No refresh token, user needs to login
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { accessToken } = response.data.data;

        // Store new access token
        await SecureStore.setItemAsync('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');

        // This will be caught by the calling code which should redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
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

// Vehicle API calls
export const vehicleAPI = {
  getAll: async () => {
    const response = await api.get('/vehicles');
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/vehicles/search?query=${query}`);
    return response.data;
  },

  getByNumber: async (vehicleNumber) => {
    const response = await api.get(`/vehicles/by-number/${vehicleNumber}`);
    return response.data;
  },

  register: async (vehicleData) => {
    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Add text fields
    formData.append('ownerName', vehicleData.ownerName);
    formData.append('ownerMobile', vehicleData.ownerMobile);
    formData.append('vehicleNumber', vehicleData.vehicleNumber);
    formData.append('vehicleType', vehicleData.vehicleType);

    // Add images if they exist
    if (vehicleData.carImage) {
      const carImageFile = {
        uri: vehicleData.carImage.uri,
        type: vehicleData.carImage.mimeType || 'image/jpeg',
        name: vehicleData.carImage.fileName || 'car_image.jpg',
      };
      formData.append('carImage', carImageFile);
    }

    if (vehicleData.keyImage) {
      const keyImageFile = {
        uri: vehicleData.keyImage.uri,
        type: vehicleData.keyImage.mimeType || 'image/jpeg',
        name: vehicleData.keyImage.fileName || 'key_image.jpg',
      };
      formData.append('keyImage', keyImageFile);
    }

    // Use multipart/form-data content type
    const response = await api.post('/vehicles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (vehicleId, vehicleData) => {
    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Add text fields
    formData.append('ownerName', vehicleData.ownerName);
    formData.append('ownerMobile', vehicleData.ownerMobile);
    formData.append('vehicleNumber', vehicleData.vehicleNumber);
    formData.append('vehicleType', vehicleData.vehicleType);

    // Add images if they exist
    if (vehicleData.carImage) {
      const carImageFile = {
        uri: vehicleData.carImage.uri,
        type: vehicleData.carImage.mimeType || 'image/jpeg',
        name: vehicleData.carImage.fileName || 'car_image.jpg',
      };
      formData.append('carImage', carImageFile);
    }

    if (vehicleData.keyImage) {
      const keyImageFile = {
        uri: vehicleData.keyImage.uri,
        type: vehicleData.keyImage.mimeType || 'image/jpeg',
        name: vehicleData.keyImage.fileName || 'key_image.jpg',
      };
      formData.append('keyImage', keyImageFile);
    }

    // Use multipart/form-data content type
    const response = await api.put(`/vehicles/${vehicleId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Attendance API calls
export const attendanceAPI = {
  markArrival: async (vehicleNumber) => {
    const response = await api.post('/attendance/mark-arrival', { vehicleNumber });
    return response.data;
  },

  getUnmarkedToday: async () => {
    const response = await api.get('/attendance/unmarked-today');
    return response.data;
  },

  getVisitsToday: async () => {
    const response = await api.get('/attendance/visits-today');
    return response.data;
  },

  getVisitsByDate: async (date) => {
    const response = await api.get(`/attendance/visits/${date}`);
    return response.data;
  },
};

// Reports API calls
export const reportsAPI = {
  getDailyReport: async () => {
    const response = await api.get('/reports/daily');
    return response.data;
  },

  getDailyReportByDate: async (date) => {
    const response = await api.get(`/reports/daily/${date}`);
    return response.data;
  },

  getDateRangeReport: async (startDate, endDate) => {
    const response = await api.get(`/reports/range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
};

// User management API calls (Admin only)
export const userAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
};

export default api;

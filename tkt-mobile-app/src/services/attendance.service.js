import api from './axios.instance';

export const attendanceService = {
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

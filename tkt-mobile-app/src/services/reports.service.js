import api from './axios.instance';

export const reportsService = {
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

  getMultiCampusDashboard: async (date) => {
    const params = date ? `?date=${date}` : '';
    const response = await api.get(`/admin/dashboard/multi-campus${params}`);
    return response.data;
  },
};

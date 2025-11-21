import api from './axios.instance';
import { authService } from './auth.service';
import { vehicleService } from './vehicle.service';
import { attendanceService } from './attendance.service';
import { reportsService } from './reports.service';
import { userService } from './user.service';

// Re-export services with original names for backward compatibility
export const authAPI = authService;
export const vehicleAPI = vehicleService;
export const attendanceAPI = attendanceService;
export const reportsAPI = reportsService;
export const userAPI = userService;
export const adminDashboardAPI = {
  getMultiCampusDashboard: reportsService.getMultiCampusDashboard,
};

export default api;

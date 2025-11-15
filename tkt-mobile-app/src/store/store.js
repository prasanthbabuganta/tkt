import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import vehicleReducer from '../slices/vehicleSlice';
import attendanceReducer from '../slices/attendanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicle: vehicleReducer,
    attendance: attendanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['auth/login/fulfilled', 'auth/restoreSession/fulfilled'],
      },
    }),
});

export default store;

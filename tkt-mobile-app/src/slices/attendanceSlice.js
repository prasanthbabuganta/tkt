import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceAPI } from '../services/api';

// Async thunks
export const markArrival = createAsyncThunk(
  'attendance/markArrival',
  async (vehicleNumber, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.markArrival(vehicleNumber);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark arrival');
    }
  }
);

export const fetchUnmarkedVehicles = createAsyncThunk(
  'attendance/fetchUnmarked',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getUnmarkedToday();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unmarked vehicles');
    }
  }
);

export const fetchTodayVisits = createAsyncThunk(
  'attendance/fetchTodayVisits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getVisitsToday();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch visits');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    unmarkedVehicles: [],
    todayVisits: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Mark arrival
      .addCase(markArrival.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(markArrival.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Arrival marked successfully';
        // Remove vehicle from unmarked list
        state.unmarkedVehicles = state.unmarkedVehicles.filter(
          (v) => v.vehicleNumber !== action.payload.vehicle.vehicleNumber
        );
        // Add to today's visits
        state.todayVisits.push(action.payload);
      })
      .addCase(markArrival.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch unmarked vehicles
      .addCase(fetchUnmarkedVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnmarkedVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.unmarkedVehicles = action.payload;
      })
      .addCase(fetchUnmarkedVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch today's visits
      .addCase(fetchTodayVisits.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodayVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.todayVisits = action.payload;
      })
      .addCase(fetchTodayVisits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = attendanceSlice.actions;
export default attendanceSlice.reducer;

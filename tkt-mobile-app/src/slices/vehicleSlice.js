import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehicleAPI } from '../services/api';

// Async thunks
export const fetchVehicles = createAsyncThunk(
  'vehicle/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  }
);

export const searchVehicles = createAsyncThunk(
  'vehicle/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.search(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const registerVehicle = createAsyncThunk(
  'vehicle/register',
  async (vehicleData, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.register(vehicleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState: {
    vehicles: [],
    searchResults: [],
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
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search vehicles
      .addCase(searchVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register vehicle
      .addCase(registerVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Vehicle registered successfully';
        state.vehicles.push(action.payload);
      })
      .addCase(registerVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearSearchResults } = vehicleSlice.actions;
export default vehicleSlice.reducer;

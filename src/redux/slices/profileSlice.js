import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  loading: false,
  error: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchBookingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBookingsSuccess: (state, action) => {
      state.loading = false;
      state.bookings = action.payload;
    },
    fetchBookingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  fetchBookingsStart,
  fetchBookingsSuccess,
  fetchBookingsFailure
} = profileSlice.actions;

export default profileSlice.reducer;
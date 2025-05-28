import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],
  loading: false,
  error: null,
  filters: {
    category: 'all',
    date: null,
    search: ''
  }
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    fetchEventsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEventsSuccess: (state, action) => {
      state.loading = false;
      state.events = action.payload;
    },
    fetchEventsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  }
});

export const { fetchEventsStart, fetchEventsSuccess, fetchEventsFailure, setFilters } = eventsSlice.actions;
export default eventsSlice.reducer;
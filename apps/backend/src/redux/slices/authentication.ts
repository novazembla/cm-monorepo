import { createSlice } from "@reduxjs/toolkit"

const authenticationSlice = createSlice({
  name: 'auth',
  initialState: {
    authenticated: false
  },
  reducers: {
    authLogout(state) {
      state.authenticated = false;
    },
    authLogin(state) {
      state.authenticated = true;
    },
  },
})

// Extract the action creators object and the reducer
const { actions, reducer } = authenticationSlice

// Extract and export each action creator by name
export const { authLogout, authLogin } = actions

// Export the reducer, either as a default or named export
export default reducer
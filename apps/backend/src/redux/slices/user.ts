import { createSlice, PayloadAction} from "@reduxjs/toolkit";
import type { ApiUser } from "../../services/user";

const userSlice = createSlice({
  name: "user",
  initialState: {
    authenticated: false,
    apiUser: null,
    refreshing: false,
  } as {
    authenticated: boolean,
    apiUser: ApiUser | null,
    refreshing: boolean,
  },
  reducers: {
    userLogout(state) {
      state.authenticated = false;
      state.apiUser = null;
    },
    userLogin(
      state,
      action: PayloadAction<ApiUser>
    ) {
      console.log("Redux userLogin Action");
      state.authenticated = true;
      state.apiUser = action.payload;
    },
    userRefreshing(state, action: PayloadAction<boolean>) {
      state.refreshing = action.payload;
    }
  },
});

// Extract the action creators object and the reducer
const { actions, reducer } = userSlice;

// Extract and export each action creator by name
export const { userLogout, userLogin, userRefreshing } = actions;

// Export the reducer, either as a default or named export
export default reducer;

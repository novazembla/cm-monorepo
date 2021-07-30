import { createSlice, PayloadAction} from "@reduxjs/toolkit";
import type { ApiUser } from "~/services/user";

type EmailVerificationState = "unknown" | "yes" | "no";

const userSlice = createSlice({
  name: "user",
  initialState: {
    authenticated: false,
    emailVerified: "unknown",
    apiUser: null,
    refreshing: false,
  } as {
    authenticated: boolean,
    emailVerified: EmailVerificationState,
    apiUser: ApiUser | null,
    refreshing: boolean,
  },
  reducers: {
    userLogout(state) {
      state.authenticated = false;
      state.apiUser = null;
      state.emailVerified = "unknown";
    },
    userLogin(
      state,
      action: PayloadAction<ApiUser>
    ) {
      state.authenticated = true;
      state.apiUser = action.payload;
    },
    userEmailVerificationState(state, action: PayloadAction<EmailVerificationState>) {
      state.emailVerified = action.payload;
    },

    authRefreshing(state, action: PayloadAction<boolean>) {
      state.refreshing = action.payload;
    }
  },
});

// Extract the action creators object and the reducer
const { actions, reducer } = userSlice;

// Extract and export each action creator by name
export const { userLogout, userLogin, authRefreshing, userEmailVerificationState } = actions;

// Export the reducer, either as a default or named export
export default reducer;

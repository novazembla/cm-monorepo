import { createSlice, PayloadAction} from "@reduxjs/toolkit";
import type { ApiUser } from "~/services/user";

type EmailVerificationState = "unknown" | "yes" | "no";

type UserLoginPayload = {
  apiUser: ApiUser;
  expires: string;
}

type UserProfileUpdate = {
  firstName: string;
  lastName: string;
  emailVerified: EmailVerificationState | undefined;
}

const userSlice = createSlice({
  name: "user",
  initialState: {
    authenticated: false,
    apiUser: null,
    emailVerified: "unknown",
    refreshing: false,
    expires: new Date().toISOString(),
  } as {
    authenticated: boolean,
    emailVerified: EmailVerificationState,
    apiUser: ApiUser | null,
    refreshing: boolean,
    expires: string,
  },
  reducers: {
    userProfileUpdate(state, action: PayloadAction<UserProfileUpdate>) {
      if (state.apiUser)
        state.apiUser = {
          ...state.apiUser,
          ...{
            firstName: action.payload.firstName,
            lastName: action.payload.lastName,
          }
        };
      
      if (action.payload.emailVerified)
        state.emailVerified = action.payload.emailVerified;
    },
    userLogout(state) {
      state.authenticated = false;
      state.apiUser = null;
      state.emailVerified = "unknown";
      state.expires = new Date().toISOString();
    },
    userLogin(
      state,
      action: PayloadAction<UserLoginPayload>
    ) {
      state.authenticated = true;
      state.apiUser = action.payload.apiUser;
      state.expires = action.payload.expires;
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
export const { userLogout, userLogin, authRefreshing, userEmailVerificationState, userProfileUpdate } = actions;

// Export the reducer, either as a default or named export
export default reducer;

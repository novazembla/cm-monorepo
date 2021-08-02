import { createSlice, PayloadAction } from "@reduxjs/toolkit";


import { AppSettings, AppSetting } from "~/config";

const settingSlice = createSlice({
  name: "settings",
  initialState: {
    settings: {}
  } as {
    settings: AppSettings,
  },
  reducers: {
    settingUpdate(state, action: PayloadAction<AppSetting>) {
      state.settings = {
        ...state.settings,
        [action.payload.key]: action.payload.value,
      };
    },
    settingsSet(state, action: PayloadAction<AppSettings>) {
      state.settings = action.payload;
    },
  },
});

// Extract the action creators object and the reducer
const { actions, reducer } = settingSlice;

// Extract and export each action creator by name
export const { settingUpdate, settingsSet } = actions;

// Export the reducer, either as a default or named export
export default reducer;

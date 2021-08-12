import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppModule } from "~/types";

const modulesSlice = createSlice({
  name: "modules",
  initialState: {
    modules: {}
  } as {
    modules: Record<string, AppModule>,
  },
  reducers: {
    modulesSet(state, action: PayloadAction<Record<string, AppModule>>) {
      state.modules = action.payload;
    },
  },
});

// Extract the action creators object and the reducer
const { actions, reducer } = modulesSlice;

// Extract and export each action creator by name
export const { modulesSet } = actions;

// Export the reducer, either as a default or named export
export default reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type RouterInfo = {
  current: string | undefined;
  previous: string | undefined;
};

const routerSlice = createSlice({
  name: "router",
  initialState: {
    router :{
      current: undefined,
      previous: undefined,
    }as RouterInfo
  } ,
  reducers: {
    setPreviousRoute(state, action: PayloadAction<string>) {
      state.router = {
        previous: state.router.current,
        current: action.payload,
      };
    },
  },
});

// Extract the action creators object and the reducer
const { actions, reducer } = routerSlice;

// Extract and export each action creator by name
export const { setPreviousRoute } = actions;

// Export the reducer, either as a default or named export
export default reducer;

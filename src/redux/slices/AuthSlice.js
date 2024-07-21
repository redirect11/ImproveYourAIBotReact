import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    token: null,
    userName: null,
    baseUrl: null
};

export const authSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUserName: (state, action) => {
      state.userName = action.payload;
    },
    setBaseUrl: (state, action) => {
      state.baseUrl = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setToken, setUserName, setBaseUrl  } = authSlice.actions

export default authSlice.reducer
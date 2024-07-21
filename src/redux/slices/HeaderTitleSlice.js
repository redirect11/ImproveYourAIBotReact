import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    title: 'Settings'
};


export const headerTitleSlice = createSlice({
  name: 'title',
  initialState,
  reducers: {
    setTitle: (state, action) => {
      state.title = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setTitle } = headerTitleSlice.actions

export default headerTitleSlice.reducer
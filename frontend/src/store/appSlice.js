import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarShow: true,
  theme: 'light',
  sidebarUnfoldable: true
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppState: (state, action) => {
      return { ...state, ...action.payload }
    },
    resetUser: (state) => {
      state.user = { avatar: '', name: '', email: '', token: '' }
    },
  },
})

export const { setAppState, resetUser } = appSlice.actions
export default appSlice.reducer

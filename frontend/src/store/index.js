import { configureStore } from '@reduxjs/toolkit'
import appReducer from './appSlice'
import authReducer from './authSlice'
import schoolReducer from './schoolSlice'

const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    school: schoolReducer
  },
})

export default store

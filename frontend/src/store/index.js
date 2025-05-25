import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./appSlice";
import authReducer from "./authSlice";
import schoolReducer from "./schoolSlice";
import chatReducer from "./chatSlice";
import toastReducer from "./toastSlice";
import financeReducer from './financeSlice'

const store = configureStore({
	reducer: {
		app: appReducer,
		auth: authReducer,
		school: schoolReducer,
		chat: chatReducer,
		toast: toastReducer,
		finance: financeReducer,
	},
});

export default store;

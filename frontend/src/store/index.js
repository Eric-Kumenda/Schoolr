import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./appSlice";
import authReducer from "./authSlice";
import schoolReducer from "./schoolSlice";
import chatReducer from "./chatSlice";

const store = configureStore({
	reducer: {
		app: appReducer,
		auth: authReducer,
		school: schoolReducer,
		chat: chatReducer,
	},
});

export default store;

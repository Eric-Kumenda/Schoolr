import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";

import App from "./App.jsx";
import store from "./store";
import { injectStore } from "./utils/axios";
import { GoogleOAuthProvider } from "@react-oauth/google";

injectStore(store);

createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<StrictMode>
			<GoogleOAuthProvider clientId={import.meta.env.GOOGLE_CLIENT_ID}>
				<App />
			</GoogleOAuthProvider>
		</StrictMode>
	</Provider>
);

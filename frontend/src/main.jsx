import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";

// Import all of Bootstrap's JS
import "@coreui/coreui/dist/css/coreui.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "core-js";

// Import our custom CSS
import "../scss/custom.scss";

import App from "./App.jsx";
import store from "./store.ts";

createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<StrictMode>
			<App />
		</StrictMode>
	</Provider>
);

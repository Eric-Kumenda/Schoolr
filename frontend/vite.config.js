import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import https from "https";

const agent = new https.Agent({
	ca: fs.readFileSync(path.resolve(__dirname, "cert/localhost+2.pem")),
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: "0.0.0.0",
		port: 5173, // Vite port
		proxy: {
			"/api": {
				target: "https://localhost:5000",
				changeOrigin: true,
				secure: true,
				agent,
				logLevel: "debug",
			},
			"/socket.io": {
				target: "https://localhost:5000", // Make sure socket.io requests are proxied as well
				ws: true, // Enable WebSocket proxy
				secure: true,
				agent,
				logLevel: "debug",
			},
		},
		https: {
			key: fs.readFileSync(
				path.resolve(__dirname, "cert/localhost+2-key.pem")
			),
			cert: fs.readFileSync(
				path.resolve(__dirname, "cert/localhost+2.pem")
			),
		},
	},
});

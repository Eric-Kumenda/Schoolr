// src/components/MiniCallView.jsx
import { CButton } from "@coreui/react";
import React, { useRef, useEffect } from "react";

const MiniCallView = ({ localStream, remoteStream, onClose, onHangUp }) => {
	const localVideoRef = useRef(null);
	const remoteVideoRef = useRef(null);
	const miniCallViewRef = useRef(null);
	let isDragging = false;
	let offsetX, offsetY;

	useEffect(() => {
		if (localVideoRef.current) {
			localVideoRef.current.srcObject = localStream;
		}
		if (remoteVideoRef.current) {
			remoteVideoRef.current.srcObject = remoteStream;
		}
	}, [localStream, remoteStream]);

	useEffect(() => {
		const miniCallViewElement = miniCallViewRef.current;

		const handleMouseDown = (e) => {
			isDragging = true;
			offsetX =
				e.clientX - miniCallViewElement.getBoundingClientRect().left;
			offsetY =
				e.clientY - miniCallViewElement.getBoundingClientRect().top;
			miniCallViewElement.style.cursor = "grabbing";
		};

		const handleMouseMove = (e) => {
			if (!isDragging) return;
			const x = e.clientX - offsetX;
			const y = e.clientY - offsetY;
			miniCallViewElement.style.left = `${x}px`;
			miniCallViewElement.style.top = `${y}px`;
		};

		const handleMouseUp = () => {
			isDragging = false;
			miniCallViewElement.style.cursor = "grab";
		};

		miniCallViewElement.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			miniCallViewElement.removeEventListener(
				"mousedown",
				handleMouseDown
			);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, []);

	return (
		<div
			ref={miniCallViewRef}
			className="border rounded shadow d-flex flex-column bg-body-secondary"
			style={{
				position: "fixed",
				bottom: "20px",
				right: "20px",
				width: "250px",
				height: "200px",
				zIndex: 1000,
				cursor: "grab",
			}}>
			<button
				onClick={onClose}
                className="p-1 border-0 bg-body opacity-5 rounded"
				style={{
					cursor: "pointer",
					alignSelf: "flex-end",
				}}>
				<i className="fa-solid fa-arrows-maximize fs-4" />
				{/* You might need to include Font Awesome or a similar icon library */}
			</button>
			<div style={{ flexGrow: 1, position: "relative" }}>
				<video
					ref={remoteVideoRef}
					autoPlay
					style={{
						width: "100%",
						height: "100%",
						objectFit: "cover",
					}}
				/>
				<video
					ref={localVideoRef}
					autoPlay
					muted
                    className="border border-secondary rounded"
					style={{
						position: "absolute",
						bottom: "5px",
						right: "5px",
						width: "60px",
						height: "45px",
						zIndex: 1,
					}}
				/>
			</div>

			<CButton color="danger" onClick={onHangUp}>
				Hang Up
			</CButton>
		</div>
	);
};

export default MiniCallView;

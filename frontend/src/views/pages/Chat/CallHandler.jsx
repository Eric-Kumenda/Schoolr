// src/components/CallHandler.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
	CModal,
	CModalHeader,
	CModalTitle,
	CModalBody,
	CModalFooter,
	CButton,
} from "@coreui/react";
import socket from "../../../socket"; // Adjust path as needed
import { useSelector } from "react-redux";
import MiniCallView from "./MiniCallView";

const iceServers = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		// Add your TURN server configuration here
		{ urls: "stun:stun.l.google.com:5349" },
		{ urls: "stun:stun1.l.google.com:3478" },
		{ urls: "stun:stun1.l.google.com:5349" },
		{ urls: "stun:stun2.l.google.com:19302" },
		{ urls: "stun:stun2.l.google.com:5349" },
		{ urls: "stun:stun3.l.google.com:3478" },
		{ urls: "stun:stun3.l.google.com:5349" },
		{ urls: "stun:stun4.l.google.com:19302" },
		{ urls: "stun:stun4.l.google.com:5349" },
	],
};

const CallHandler = () => {
	const [incomingCall, setIncomingCall] = useState(null);
	const [incomingCallModalVisible, setIncomingCallModalVisible] =
		useState(false);
	const [callActive, setCallActive] = useState(false);
	const [callActiveModalVisible, setCallActiveModalVisible] = useState(false);
	const [isMiniCallActive, setIsMiniCallActive] = useState(false); // Mini-viewer state
	const [peerConnection, setPeerConnection] = useState(null);
	const [localStream, setLocalStream] = useState(null);
	const [remoteStream, setRemoteStream] = useState(null);
	const localVideoRefFull = useRef(null);
	const remoteVideoRefFull = useRef(null);
	const userId = useSelector((state) => state.auth.userId);
	const currentOutgoingCall = useSelector(
		(state) => state.chat.currentOutgoingCall
	);

	const handleIncomingCall = useCallback((data) => {
		setIncomingCall(data);
		setIncomingCallModalVisible(true);
	}, []);

	const acceptCall = useCallback(async () => {
		setCallActive(true);
		setCallActiveModalVisible(true);
		const stream = await startWebRTC(
			false,
			incomingCall.type,
			incomingCall.caller,
			incomingCall.conversationId
		);
		setLocalStream(stream);
		setIncomingCallModalVisible(false);
		socket.emit("call-accepted", {
			recipient: incomingCall.caller,
			conversationId: incomingCall.conversationId,
		});
	}, [incomingCall]);

	const rejectCall = useCallback(() => {
		socket.emit("call-rejected", {
			recipient: incomingCall.caller,
			conversationId: incomingCall.conversationId,
		});
		setIncomingCall(null);
		setIncomingCallModalVisible(false);
	}, [incomingCall]);

	const startWebRTC = useCallback(
		async (isCaller, callType, remoteUserId, conversationId) => {
			console.log(
				"startWebRTC CALLED (Receiver) " +
					callType +
					remoteUserId +
					conversationId
			);
			const pc = new RTCPeerConnection(iceServers);
			pc.remoteUserId = remoteUserId;

			pc.onicecandidate = (event) => {
				if (event.candidate && pc.remoteUserId) {
					console.log("Ice Candidate called");
					socket.emit("ice-candidate", {
						candidate: event.candidate,
						recipient: pc.remoteUserId,
						caller: userId,
						conversationId: conversationId,
					});
				}
			};

			pc.ontrack = (event) => {
				console.log("Remote track received:", event);
				if (event.streams && event.streams[0]) {
					setRemoteStream(event.streams[0]);
					if (remoteVideoRefFull.current) {
						remoteVideoRefFull.current.srcObject = event.streams[0];
					}
				}
			};

			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
					video: callType === "video",
				});
				setLocalStream(stream);
				if (localVideoRefFull.current) {
					localVideoRefFull.current.srcObject = stream;
				}
				stream
					.getTracks()
					.forEach((track) => pc.addTrack(track, stream));

				if (isCaller) {
					const offer = await pc.createOffer();
					//console.log(offer);
					await pc.setLocalDescription(offer);
					// socket.emit("offer", {
					// 	sdp: offer,
					// 	recipient: remoteUserId,
					// 	caller: userId,
					// 	conversationId: conversationId,
					// 	type: callType,
					// });

					await pc.setRemoteDescription(
						new RTCSessionDescription(offer)
					);
					const answer = await pc.createAnswer();
					await pc.setLocalDescription(answer);
				}
				setCallActive(true);
				setCallActiveModalVisible(true);
				setPeerConnection(pc);
				return stream;
			} catch (error) {
				console.error("Error getting user media:", error);
			}
		},
		[userId]
	);

	const handleReceiveOffer = useCallback(
		async (data) => {
			if (!peerConnection) {
				console.log("No active peer conn");
				const stream = await startWebRTC(
					true,
					data.type,
					data.caller,
					data.conversationId
				);
				setLocalStream(stream);
				peerConnection.remoteUserId = data.caller;
			}
			if (peerConnection) {
				try {
					console.log(
						"CALLER SIGNALING STATE BEFORE setRemoteDescription (ANSWER):",
						peerConnection.signalingState
					); // <---- ADD THIS

					await peerConnection.setRemoteDescription(
						new RTCSessionDescription(data.sdp)
					);
					console.log(
						"CALLER REMOTE DESCRIPTION SET (ANSWER):",
						data.sdp
					);

					const answer = await peerConnection.createAnswer();
					//console.log(answer);
					await peerConnection.setLocalDescription(answer);
					socket.emit("answer", {
						sdp: answer,
						recipient: data.caller,
						caller: userId,
						conversationId: data.conversationId,
					});
					setCallActive(true);
					setCallActiveModalVisible(true);
					setIncomingCallModalVisible(false);
				} catch (error) {
					console.error("Error handling offer:", error);
				}
			}
		},
		[startWebRTC, userId, peerConnection]
	);

	const handleReceiveAnswer = useCallback(
		async (data) => {
			if (peerConnection) {
				try {
					await peerConnection.setRemoteDescription(
						new RTCSessionDescription(data.sdp)
					);
					console.log("CALLER REMOTE DESCRIPTION:", data.sdp); // <---- ADD THIS

					setCallActive(true);
					setCallActiveModalVisible(true);
				} catch (error) {
					console.error("Error handling answer:", error);
				}
			}
		},
		[peerConnection]
	);

	const handleReceiveIceCandidate = useCallback(
		async (data) => {
			try {
				if (peerConnection && data.candidate) {
					await peerConnection.addIceCandidate(data.candidate);
					console.log("handleReceiveIceCandidate" + peerConnection);
				}
			} catch (error) {
				console.error("Error adding ICE candidate:", error);
			}
		},
		[peerConnection]
	);

	const hangUpCall = useCallback(() => {
		if (peerConnection && peerConnection.remoteUserId) {
			socket.emit("hang-up", {
				recipient: peerConnection.remoteUserId,
				conversationId: incomingCall?.conversationId,
			});
			peerConnection.close();
			setPeerConnection(null);
		}
		if (localStream) {
			localStream.getTracks().forEach((track) => track.stop());
			setLocalStream(null);
		}
		setRemoteStream(null);
		setCallActive(false);
		setCallActiveModalVisible(false);
		setIsMiniCallActive(false);
		//setLocalStream(null)
		setIncomingCall(null);
		setIncomingCallModalVisible(false);
	}, [peerConnection, localStream, incomingCall]);

	const switchToMiniCall = useCallback(() => {
		setCallActiveModalVisible(false);
		setIsMiniCallActive(true);
	}, []);

	const switchToFullCall = useCallback(() => {
		setIsMiniCallActive(false);
		setCallActiveModalVisible(true);
		localVideoRefFull.current.srcObject = localStream;
		remoteVideoRefFull.current.srcObject = remoteStream;
	}, []);

	useEffect(() => {
		socket.on("incoming-call", handleIncomingCall);
		socket.on("call-accepted", async () => {
			setCallActive(true);
			await startWebRTC(
				true,
				currentOutgoingCall.type,
				userId,
				currentOutgoingCall.conversationId
			);
			setCallActiveModalVisible(true);
			setIncomingCallModalVisible(false);
		});
		socket.on("call-rejected", () => {
			setIncomingCallModalVisible(false);
			setCallActiveModalVisible(true);
		});
		socket.on("offer", handleReceiveOffer);
		socket.on("answer", handleReceiveAnswer);
		socket.on("ice-candidate", handleReceiveIceCandidate);
		socket.on("hang-up", () => {
			if (peerConnection) {
				peerConnection.close();
				setPeerConnection(null);
			}
			if (localStream) {
				localStream.getTracks().forEach((track) => track.stop());
				setLocalStream(null);
			}
			setRemoteStream(null);
			setCallActive(false);
			setCallActiveModalVisible(false);
			setIncomingCall(null);
			setIncomingCallModalVisible(false);
		});

		return () => {
			socket.off("incoming-call", handleIncomingCall);
			socket.off("call-accepted");
			socket.off("call-rejected");
			socket.off("offer", handleReceiveOffer);
			socket.off("answer", handleReceiveAnswer);
			socket.off("ice-candidate", handleReceiveIceCandidate);
			socket.off("hang-up");
			if (peerConnection) {
				peerConnection.close();
			}
			if (localStream) {
				localStream.getTracks().forEach((track) => track.stop());
			}
		};
	}, [
		socket,
		handleIncomingCall,
		handleReceiveOffer,
		handleReceiveAnswer,
		handleReceiveIceCandidate,
		hangUpCall,
	]);

	useEffect(() => {
		console.log(peerConnection?.signalingState);
		if (remoteStream) {
			// <---- ADD THIS
			console.log("REMOTE STREAM STATE UPDATED:", remoteStream);
		}
		if (localStream) {
			// <---- ADD THIS
			console.log("Local STREAM STATE UPDATED:", localStream);
		}
		if (localVideoRefFull.current && localStream) {
			localVideoRefFull.current.srcObject = localStream;
		}
		if (remoteVideoRefFull.current && remoteStream) {
			remoteVideoRefFull.current.srcObject = remoteStream;
		}
	}, [localStream, remoteStream, peerConnection]);

	return (
		<>
			{/* Incoming Call Modal */}
			<CModal
				visible={incomingCallModalVisible}
				onClose={() => setIncomingCallModalVisible(false)}
				centered
				backdrop="static"
				keyboard={false}>
				<CModalHeader>
					<CModalTitle>Incoming Call</CModalTitle>
				</CModalHeader>
				<CModalBody>
					<p>
						{incomingCall?.callerName} is calling you for a{" "}
						{incomingCall?.type} call.
					</p>
				</CModalBody>
				<CModalFooter>
					<CButton color="secondary" onClick={rejectCall}>
						Reject
					</CButton>
					<CButton color="success" onClick={acceptCall}>
						Accept
					</CButton>
				</CModalFooter>
			</CModal>

			{/* Active Call Modal */}
			<CModal
				visible={callActiveModalVisible}
				onClose={switchToMiniCall}
				centered
				size="lg"
				backdrop="static"
				keyboard={false}>
				<CModalHeader>
					<CModalTitle>Call in Progress</CModalTitle>
				</CModalHeader>

				<CModalBody
					className="d-flex justify-content-center align-items-center position-relative"
					style={{ minHeight: "400px" }}>
					<div className="row row-cols-2 gx-3 gy-2">
						<video
							ref={remoteVideoRefFull}
							autoPlay
							className="col border border-info bg-info-subtle"
							style={{
								objectFit: "cover",
							}}
						/>
						<video
							ref={localVideoRefFull}
							autoPlay
							muted
							className="col border border-primary rounded bg-warning-subtle"
							style={{
								objectFit: "cover",
							}}
						/>
					</div>
				</CModalBody>
				<CModalFooter className="justify-content-center">
					<CButton color="danger" onClick={hangUpCall}>
						Hang Up
					</CButton>
				</CModalFooter>
			</CModal>

			{/* Mini Call View */}
			{isMiniCallActive && callActive && localStream && remoteStream ? (
				<MiniCallView
					localStream={localStream}
					remoteStream={remoteStream}
					onClose={switchToFullCall}
					onHangUp={hangUpCall}
				/>
			) : null}
		</>
	);
};

export default CallHandler;

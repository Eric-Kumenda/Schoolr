// pages/PendingRequests.jsx
import { useEffect, useState } from "react";
import axios from "../../../utils/axios";

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await axios.get("/join-requests", { withCredentials: true });
      setRequests(res.data);
    };
    fetchRequests();
  }, []);

  const handleDecision = async (id, action) => {
    try {
      await axios.patch(`/join-requests/${id}`, { action }, { withCredentials: true });
      setRequests(requests.filter((r) => r.id !== id)); // remove from UI
      alert(`Request ${action}d`);
    } catch (err) {
      console.error(err);
      alert("Failed to update request");
    }
  };

  return (
    <div>
      <h2>Pending Join Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        requests.map((req) => (
          <div key={req.id}>
            <p>{req.role} - {req.userId}</p>
            {req.proofUrl && <a href={req.proofUrl} target="_blank" rel="noreferrer">Proof</a>}
            <button onClick={() => handleDecision(req.id, "approve")}>Approve</button>
            <button onClick={() => handleDecision(req.id, "reject")}>Reject</button>
          </div>
        ))
      )}
    </div>
  );
}

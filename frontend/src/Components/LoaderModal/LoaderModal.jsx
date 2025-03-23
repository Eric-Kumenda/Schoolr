import React from "react";
import ReactDOM from "react-dom";
import "./LoaderModal.css"; // Import CSS for styling


const LoaderModal= ({ isLoading }) => {
  if (!isLoading) return null;

  return ReactDOM.createPortal(
    <div className="loader-overlay bg-body">
      <div className="progress"></div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default LoaderModal;
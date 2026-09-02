import React, { useState } from "react";

export default function EmergencyButton({ user, onEmergency }) {
  const [confirming, setConfirming] = useState(false);

  if (!user || user.role !== "patient") return null;

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    onEmergency();
    setConfirming(false);
  }

  return (
    <button
      className={`emergency-fab ${confirming ? "confirming" : ""}`}
      onClick={handleClick}
      title="Emergency Alert"
    >
      {confirming ? "TAP AGAIN TO CONFIRM" : "🚨 SOS"}
    </button>
  );
}

"use client";

import React, { useState } from "react";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import { LogOut } from "lucide-react";
import axios from "axios";

interface ExitButtonProps {
  visitorId: string;
  visitorName: string;
  onExitMarked: () => void;
}

export default function ExitButton({
  visitorId,
  visitorName,
  onExitMarked,
}: ExitButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMarkExit = async () => {
    setLoading(true);
    try {
      await axios.post("/api/resident/visitors/mark-exit", {
        visitorId,
      });
      setShowModal(false);
      onExitMarked();
    } catch (error) {
      console.error("Mark exit error:", error);
      alert("Failed to mark visitor exit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
        <LogOut className="h-4 w-4 mr-2" />
        Mark Exit
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Mark Visitor Exit"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure <strong>{visitorName}</strong> has left? This will
            notify the security guard to verify at the gate.
          </p>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleMarkExit}
              loading={loading}
              fullWidth
            >
              Confirm Exit
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

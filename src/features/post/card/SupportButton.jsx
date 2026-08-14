// src/components/card/SupportButton.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import useSupport from "./hooks/useSupport";

export default function SupportButton({
  creatorId,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    isSupporting,
    loading,
    toggle,
  } = useSupport(creatorId);

  const handleClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!creatorId || creatorId === user.id) {
      return;
    }

    await toggle();
  };

  if (!creatorId) {
    return null;
  }

  if (user?.id === creatorId) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={isSupporting}
      className={`
        flex items-center gap-2
        text-sm transition
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${
          isSupporting
            ? "text-yellow-400"
            : "text-gray-400 hover:text-yellow-300"
        }
      `}
    >
      {isSupporting ? "💛 Supporting" : "💛 Support"}
    </button>
  );
}
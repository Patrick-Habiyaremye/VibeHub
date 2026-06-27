import { Link } from "react-router-dom";
import { useState } from "react";
import pic from "../../assets/kesh.png";

export default function Logo() {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to="/feed"
      className="
        flex
        items-center
        gap-2
        group
        select-none
      "
    >
      {/* Logo Image */}
      {!imgError ? (
        <img
          src={pic}
          alt="VibeHub Logo"
          onError={() => setImgError(true)}
          className="
            w-10 h-10
            object-contain
            transition
            duration-300
            group-hover:scale-105
            group-hover:rotate-3
            drop-shadow-md
          "
        />
      ) : (
        // fallback icon
        <div
          className="
            w-10 h-10
            flex items-center justify-center
            bg-yellow-500
            text-black
            font-bold
            rounded-lg
            text-sm
          "
        >
          VH
        </div>
      )}

      {/* Text */}
      <span
        className="
          text-xl
          font-bold
          text-yellow-400
          group-hover:text-yellow-300
          transition
        "
      >
        VibeHub
      </span>
    </Link>
  );
}
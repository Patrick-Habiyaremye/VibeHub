import React from "react";

export default function ContentMedia({ children }) {
  return (
    <div
      className="
        w-full
        aspect-[4/5]
        bg-black
        overflow-hidden
        relative
        flex
        items-center
        justify-center
      "
    >
      {/* FORCE CHILD TO RESPECT SPACE */}
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}
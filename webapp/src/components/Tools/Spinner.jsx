import React from "react";

export default function Spinner({ className }) {
  return (
    <div className={(className ? className : "") + " spinner"}>
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

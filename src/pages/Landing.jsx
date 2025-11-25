import React from "react";
import { useNavigate } from "react-router-dom";

export default function Loading() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 md:px-8">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl md:text4xl font-bold text-blue-500 mb-4">
          Laundry Management System
        </h1>
        <p className="text-lg md:text-1xl text-gray-500 mb-8">
          Click the button to proceed
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="px-16 py-3 bg-gray-400 text-black text-lg font-semibold rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
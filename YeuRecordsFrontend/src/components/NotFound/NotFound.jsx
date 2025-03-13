import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col w-screen items-center justify-center h-screen bg-[#f1f1f1]">
      <h1
        className="text-[10rem] font-extrabold text-transparent bg-clip-text"
        style={{
          backgroundImage: "linear-gradient(to right, #000, #0f2181)",
        }}
      >
        404
      </h1>
      <p className="text-2xl md:text-3xl text-gray-800 font-semibold mt-4">
        Oops! We can't find that page.
      </p>
      <p className="text-gray-600 mt-2 text-center max-w-[400px]">
        The page you're looking for might have been removed or is temporarily
        unavailable.
      </p>
      <div className="mt-8">
        <Link to="/">
          <button className="px-6 py-3 text-white bg-[#000] rounded-lg shadow-lg transition-all duration-300">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

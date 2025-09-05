"use client";
import React from "react";
import HistoryList from "../_components/HistoryList";

function History() {
  return (
    <div className="relative z-0 min-h-screen py-12 px-6 md:px-16 lg:px-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-100 via-green-100 to-teal-100 animate-gradient-x blur-3xl opacity-40"></div>

      <div className="bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg p-6 md:p-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Consultation History
        </h2>
        <HistoryList />
      </div>

      <style jsx global>{`
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default History;

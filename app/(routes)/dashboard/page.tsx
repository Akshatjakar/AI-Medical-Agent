"use client";
import React from "react";
import HistoryList from "./_components/HistoryList";
import AddNewSessionDialog from "./_components/AddNewSessionDialog";
import DoctorAgentList from "./_components/DoctorAgentList";

function Dashboard() {
  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
        <h2 className="font-extrabold text-2xl tracking-tight">
          My Dashboard
        </h2>
        <AddNewSessionDialog />
      </div>

      {/* History Section */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Consultations
        </h3>
        <HistoryList />
      </div>

      {/* Doctor Section */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          AI Specialist Doctors
        </h3>
        <DoctorAgentList />
      </div>
    </div>
  );
}

export default Dashboard;

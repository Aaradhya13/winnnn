"use client";

import React, { useState } from "react";
import { useRegulatoryData } from "./RegulatoryDataContext";

export default function ComplianceTable() {
  const { data } = useRegulatoryData();
  const [tab, setTab] = useState("deadlines");

  // Try to find deadline-like columns
  const deadlineRows = data.filter(row => row.Due || row.Deadline || row.due || row.deadline);
  const activityRows = data.filter(row => row.Activity || row.activity);

  const statusColors: Record<string, string> = {
    High: "bg-red-600",
    Medium: "bg-yellow-500",
    Low: "bg-blue-600",
    Completed: "bg-green-600",
    Pending: "bg-yellow-500",
    "In Progress": "bg-blue-600",
  };

  return (
    <div className="bg-[#192132] rounded-xl p-6 shadow-md min-w-[320px] w-full md:w-[400px]">
      <div className="text-lg font-semibold text-white mb-1">Compliance & Activity</div>
      <div className="text-xs text-gray-400 mb-4">Track deadlines and recent system activity.</div>
      <div className="flex mb-4">
        <button
          className={`px-4 py-1 rounded-l-lg text-sm font-medium focus:outline-none transition-colors ${
            tab === "deadlines"
              ? "bg-[#22304a] text-white"
              : "bg-[#151c27] text-gray-400 hover:text-white"
          }`}
          onClick={() => setTab("deadlines")}
        >
          Upcoming Deadlines
        </button>
        <button
          className={`px-4 py-1 rounded-r-lg text-sm font-medium focus:outline-none transition-colors ${
            tab === "activity"
              ? "bg-[#22304a] text-white"
              : "bg-[#151c27] text-gray-400 hover:text-white"
          }`}
          onClick={() => setTab("activity")}
        >
          Recent Activity
        </button>
      </div>
      {tab === "deadlines" && (
        deadlineRows.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No deadline data in uploaded file.</div>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs">
                <th className="py-2 px-4">Regulation</th>
                <th className="py-2 px-4">Due Date</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {deadlineRows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-700 last:border-none">
                  <td className="py-2 px-4 text-sm">{row.Regulation || row.regulation || row.Activity || row.activity || "-"}</td>
                  <td className="py-2 px-4 text-sm">{row.Due || row.Deadline || row.due || row.deadline || "-"}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        statusColors[row.Status] || statusColors[row.status] || "bg-gray-500"
                      }`}
                    >
                      {row.Status || row.status || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
      {tab === "activity" && (
        activityRows.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No activity data in uploaded file.</div>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs">
                <th className="py-2 px-4">Activity</th>
                <th className="py-2 px-4">Time</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {activityRows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-700 last:border-none">
                  <td className="py-2 px-4 text-sm">{row.Activity || row.activity || "-"}</td>
                  <td className="py-2 px-4 text-sm">{row.Timestamp || row.timestamp || "-"}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        statusColors[row.Status] || statusColors[row.status] || "bg-gray-500"
                      }`}
                    >
                      {row.Status || row.status || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
} 
"use client";
import React from "react";

interface AlertCardProps {
  status: "High" | "Medium" | "Low";
  title: string;
  description: string;
  date?: string;
  open: boolean;
  onClick: () => void;
}

const statusColors: Record<string, string> = {
  High: "bg-red-800",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
};

export default function AlertCard({ status, title, description, date, open, onClick }: AlertCardProps) {
  return (
    <div
      className={`rounded-xl bg-[#151c27] border border-[#23272f] mb-4 shadow-sm transition-colors duration-150 cursor-pointer hover:bg-[#1e2533] ${open ? "ring-2 ring-blue-500" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center px-6 py-4 gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[status]}`}>{status}</span>
        <span className="font-medium text-base text-white flex-1">{title}</span>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 bg-[#192132] px-6 ${open ? "max-h-40 py-3" : "max-h-0 py-0"}`}
        style={{ borderTop: open ? "1px solid #23272f" : "none" }}
      >
        <div className="text-gray-300 text-sm mb-1">{description}</div>
        {date && <div className="text-xs text-gray-500 text-right">{date}</div>}
      </div>
    </div>
  );
} 
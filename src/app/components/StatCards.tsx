"use client";

import React, { useState } from "react";
import { useRegulatoryData } from "./RegulatoryDataContext";

export default function StatCards() {
  const { data, loading, error } = useRegulatoryData();
  const [showTooltip, setShowTooltip] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#192132] rounded-xl p-6 flex flex-col gap-2 shadow-md min-w-[180px]">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-8 bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="col-span-4 bg-[#192132] rounded-xl p-6 text-center">
          <div className="text-red-400 mb-2">Error loading dashboard data</div>
          <div className="text-gray-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  // Compute total emissions from context data
  const totalEmissions = data.reduce((sum, item) => {
    const val = parseFloat(item.Emissions ?? item.emissions ?? "0");
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Example: Compute risk score (customize as needed)
  const riskScore = data.length > 0 ? (totalEmissions / (data.length * 1000)).toFixed(1) : "-";
  const riskLevel = parseFloat(riskScore) > 5 ? "High" : "Low";

  const stats = [
    {
      title: data.length === 0 ? "-" : `${Math.round(totalEmissions).toLocaleString()} tons CO₂`,
      subtitle: "Total Carbon Footprint",
      label: "Current Emissions",
    },
    {
      title: data.length === 0 ? "-" : `${riskScore}`,
      subtitle: riskLevel === "High" ? "High Risk" : "Low Risk",
      label: "Compliance Risk Score",
      badge: riskLevel === "High" ? "High Risk" : "Low Risk",
      badgeColor: riskLevel === "High" ? "bg-red-600" : "bg-green-600",
      showInfo: true,
    },
    {
      title: data.length === 0 ? "-" : "Compliant",
      subtitle: data.length === 0 ? "No data" : "All systems operational",
      label: "Regulatory Scanner",
      badge: data.length === 0 ? undefined : "Active",
      badgeColor: "bg-green-600",
    },
    {
      title: data.length === 0 ? "-" : `${data.length} Records`,
      subtitle: data.length === 0 ? "No data" : "Records loaded",
      label: "System Status",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-[#192132] rounded-xl p-6 flex flex-col gap-2 shadow-md min-w-[180px] relative"
        >
          {stat.label && (
            <div className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
              {stat.label}
              {stat.showInfo && (
                <div className="relative">
                  <button
                    className="text-gray-400 hover:text-white transition-colors"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onFocus={() => setShowTooltip(true)}
                    onBlur={() => setShowTooltip(false)}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {showTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
                      <div className="mb-2 font-semibold">How is this calculated?</div>
                      <div className="text-gray-300 leading-relaxed">
                        Compliance Risk Score = Total Emissions / (Number of Records * 1000)
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{stat.title}</span>
            {stat.badge && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${stat.badgeColor}`}>{stat.badge}</span>
            )}
          </div>
          <div className="text-xs text-gray-400">{stat.subtitle}</div>
        </div>
      ))}
    </div>
  );
} 
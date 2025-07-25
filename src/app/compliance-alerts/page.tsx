"use client";


import AlertCard from "../components/AlertCard";
import React, { useEffect, useState } from "react";

export default function ComplianceAlertsPage() {
  type AlertType = {
    urgency: "High" | "Medium" | "Low";
    type: string;
    message: string;
    timestamp?: string;
  };
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(null);


  // Fetch latest alerts
  const fetchAlerts = () => {
    setLoading(true);
    fetch("http://localhost:8000/ai-agent/latest")
      .then(res => res.json())
      .then(data => {
        setAlerts(data.alerts || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Generate alerts from backend

  // Sort and group alerts by urgency
  // Sort and group alerts by urgency, flatten for unique numeric index
  const sortedGroups = [
    { urgency: "High", alerts: alerts.filter(a => a.urgency === "High") },
    { urgency: "Medium", alerts: alerts.filter(a => a.urgency === "Medium") },
    { urgency: "Low", alerts: alerts.filter(a => a.urgency === "Low") },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#111827] via-[#1e293b] to-[#374151] text-white font-sans">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-blue-400 drop-shadow">Compliance Alerts</h1>
            {loading ? (
              <div className="text-gray-400 text-center py-8 animate-pulse">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No alerts found in the database.</div>
            ) : (
              <div className="space-y-10">
                {(() => {
                  let globalIdx = 0;
                  return sortedGroups.map(group =>
                    group.alerts.length > 0 ? (
                      <div key={group.urgency}>
                        <div className={`text-xl font-semibold mb-3 flex items-center gap-2 ${group.urgency === "High" ? "text-red-500" : group.urgency === "Medium" ? "text-yellow-400" : "text-green-400"}`}>
                          {group.urgency} Priority Alerts
                          <span className={`inline-block w-2 h-2 rounded-full ${group.urgency === "High" ? "bg-red-800" : group.urgency === "Medium" ? "bg-yellow-500" : "bg-green-500"}`}></span>
                        </div>
                        <div className="space-y-4">
                          {group.alerts.map((alert, idx) => {
                            const thisIdx = globalIdx;
                            globalIdx++;
                            return (
                              <AlertCard
                                key={group.urgency + thisIdx}
                                status={alert.urgency}
                                title={alert.type || "Compliance Alert"}
                                description={alert.message || ""}
                                open={openIdx === thisIdx}
                                onClick={() => setOpenIdx(openIdx === thisIdx ? null : thisIdx)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ) : null
                  );
                })()}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
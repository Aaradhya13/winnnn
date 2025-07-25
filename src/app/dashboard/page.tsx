import React from "react";
import StatCards from "../components/StatCards";
import BarChart from "../components/BarChart";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[#111827] text-white font-sans">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#111827]">
          <StatCards />
          <div className="mt-2">
            <BarChart />
          </div>
        </main>
      </div>
    </div>
  );
}

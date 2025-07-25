"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend
} from "recharts";

const COLORS = [
  "#3B82F6", "#06B6D4", "#10B981", "#F59E42", "#FBBF24",
  "#6366F1", "#EC4899", "#F87171", "#A78BFA", "#34D399"
];

export default function CarbonAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/ai-agent/analysis")
      .then(res => res.json())
      .then(setAnalysis)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !analysis) return <div className="text-white p-8">Loading...</div>;

  // Prepare data for charts, always default to 0
  const yearData = Object.entries(analysis.emissions_by_year || {}).map(([year, value]) => ({
    year, emissions: value ?? 0
  }));
  const industryData = Object.entries(analysis.emissions_by_industry || {}).map(([industry, value], idx) => ({
    industry,
    emissions: value ?? 0,
    fill: COLORS[idx % COLORS.length]
  }));

  return (
    <div className="flex min-h-screen bg-[#111827] text-white font-sans">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#111827]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center shadow-md w-full">
              <h2 className="text-lg font-semibold mb-2">Total Annual Emissions</h2>
              <p className="text-4xl font-bold text-blue-400">
                {((analysis.total_emissions ?? 0).toLocaleString())} tCO₂e
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center shadow-md w-full">
              <h2 className="text-lg font-semibold mb-2">Industries</h2>
              <ul className="text-gray-300 mt-2 text-center">
                {industryData.map(ind => (
                  <li key={ind.industry}>
                    {ind.industry}: {(ind.emissions ?? 0).toLocaleString()} tCO₂e
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 mt-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Emissions by Industry</h2>
              <div className="flex justify-between items-center mb-2"></div>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  data={industryData}
                  margin={{ top: 30, right: 30, left: 30, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#23272f" />
                  <XAxis
                    dataKey="industry"
                    tick={{ fill: '#9CA3AF', fontSize: 16, fontWeight: 600 }}
                    label={{
                      value: 'Industry',
                      position: 'bottom',
                      offset: 10,
                      fill: '#9CA3AF',
                      fontSize: 16
                    }}
                  />
                  <YAxis
                    tick={{ fill: '#9CA3AF', fontSize: 14 }}
                    tickFormatter={v => `${(v ?? 0).toLocaleString()} tCO₂e`}
                  />
                  <Tooltip
                    formatter={v => `${(v ?? 0).toLocaleString()} tCO₂e`}
                    labelFormatter={l => `Industry: ${l}`}
                    contentStyle={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      color: '#fff'
                    }}
                    wrapperStyle={{
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      border: 'none'
                    }}
                    cursor={false} // This disables the hover background!
                  />
                  <Bar dataKey="emissions" radius={[8, 8, 0, 0]}>
                    {industryData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

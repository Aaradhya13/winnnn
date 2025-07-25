"use client";

import React, { useState } from "react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useRegulatoryData } from "./RegulatoryDataContext";

interface ChartData {
  Industry: string;
  Abbr: string;
  TotalEmissions: number;
  fill: string;
}

const COLORS = ["#3B82F6", "#06B6D4", "#10B981", "#F59E42", "#FBBF24", "#6366F1", "#EC4899", "#F87171", "#A78BFA", "#34D399"];

function abbreviate(name: string) {
  if (!name) return "";
  // Custom abbreviations for common departments
  const map: Record<string, string> = {
    "Engineering": "Engineering",
    "Manufacturing": "Manufacturing",
    "Logistics": "Logistics",
    "Research & Development": "R&D",
    "Operations": "Operations",
    "Sales": "Sales",
    "Marketing": "Marketing",
    "Finance": "Finance",
    "Human Resources": "HR",
    "IT": "IT",
    "Power": "Power",
    "Cement": "Cement",
    "Tech": "Technology",
    "Power Plants": "Power",
    "Mining": "Mining",
    "Chemicals": "Chemicals",
    "Oil & Gas": "Oil & Gas",
  };
  return map[name] || name;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { Industry: string; TotalEmissions: number; }; value: number; }> }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#23272f', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 500, fontSize: 15, boxShadow: '0 2px 8px #0002' }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{payload[0].payload.Industry}</div>
        <div>CO₂ Emissions: <b>{payload[0].value.toLocaleString()} tons</b></div>
      </div>
    );
  }
  return null;
};

function formatYAxisTick(tick: number) {
  return tick.toLocaleString();
}

export default function BarChart() {
  const { data } = useRegulatoryData();
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");

  // Group by Industry and sum emissions
  const industryMap = new Map<string, number>();
  data.forEach(item => {
    const industry = item.Industry ?? item.industry;
    const emissions = parseFloat(item.Emissions ?? item.emissions ?? "0");
    if (industry && !isNaN(emissions)) {
      const current = industryMap.get(industry) || 0;
      industryMap.set(industry, current + emissions);
    }
  });
  const chartData = Array.from(industryMap.entries()).map(([industry, emissions], idx) => ({
    Industry: industry,
    Abbr: abbreviate(industry),
    TotalEmissions: Math.round(emissions),
    fill: COLORS[idx % COLORS.length],
  }));

  if (data.length === 0) {
    return (
      <div className="bg-[#192132] rounded-xl p-6 shadow-md flex-1 min-w-[320px]">
        <div className="text-lg font-semibold text-white mb-1">Emissions by Department</div>
        <div className="text-xs text-gray-400 mb-4">No data loaded.</div>
      </div>
    );
  }

  return (
    <div className="bg-[#192132] rounded-xl p-6 shadow-md flex-1 min-w-[320px]">
      <div className="text-lg font-semibold text-white mb-1">Emissions by Department</div>
      <div className="text-xs text-gray-400 mb-4">Monthly carbon emissions breakdown.</div>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={chartData} barCategoryGap={30} barGap={8} margin={{ top: 20, right: 30, left: 90, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#23272f" />
          <XAxis 
            dataKey="Abbr" 
            tick={{ fill: '#9CA3AF', fontSize: 16, fontWeight: 600 }}
            height={40}
            label={{ value: 'Carbon Emission Categories', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: 14 } }}
          />
          <YAxis 
            domain={[0, 'auto']}
            tick={{ fill: '#9CA3AF', fontSize: 14 }}
            tickFormatter={formatYAxisTick}
            axisLine={false}
            label={{ value: '', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: 14 } }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar 
            dataKey="TotalEmissions" 
            radius={[8, 8, 0, 0]}
            minPointSize={10}
            maxBarSize={60}
            onClick={(data: ChartData) => setSelectedIndustry(data.Industry || "")}
            >
            {chartData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.fill} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
      {selectedIndustry && (
        <div className="mt-4 p-3 bg-[#22304a] rounded-lg">
          <div className="text-sm text-gray-300">Selected Department:</div>
          <div className="text-lg font-semibold text-white">{selectedIndustry}</div>
        </div>
      )}
    </div>
  );
} 
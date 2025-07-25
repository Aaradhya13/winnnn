"use client";
import React, { useState } from "react";

interface Analysis {
  summary: string;
  potentialCosts: string;
  timeline: string;
  strictness: string;
  riskLevel: string;
  recommendations: string[];
  complianceActions: string[];
  companyInputs: any[];
  complianceCosts: any[];
}

interface ScenarioInputProps {
  scenario: string;
  setScenario: (scenario: string) => void;
}

const ScenarioInput = ({ scenario, setScenario }: ScenarioInputProps) => (
  <div className="bg-gray-800 p-6 rounded-lg mb-8">
    <h3 className="text-lg font-semibold mb-4">Describe Regulatory Scenario</h3>
    <textarea
      className="w-full p-3 bg-gray-700 rounded-md text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
      rows={5}
      placeholder="e.g., New carbon tax introduced, stricter emissions limits by 2030..."
      value={scenario}
      onChange={(e) => setScenario(e.target.value)}
    ></textarea>
  </div>
);

interface TimelineInputsProps {
  strictness: string;
  setStrictness: (strictness: string) => void;
  timeline: string;
  setTimeline: (timeline: string) => void;
}

const TimelineInputs = ({ strictness, setStrictness, timeline, setTimeline }: TimelineInputsProps) => (
  <div className="bg-gray-800 p-6 rounded-lg mb-8">
    <h3 className="text-lg font-semibold mb-4">Timeline & Strictness</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="strictness" className="block text-sm font-medium mb-2 text-gray-300">Regulation Strictness Level</label>
        <select 
          id="strictness" 
          className="w-full p-3 bg-gray-700 rounded-md text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          value={strictness}
          onChange={(e) => setStrictness(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Very High</option>
        </select>
      </div>
      <div>
        <label htmlFor="complianceTimeline" className="block text-sm font-medium mb-2 text-gray-300">Compliance Timeline (Years)</label>
        <input
          type="number"
          id="complianceTimeline"
          className="w-full p-3 bg-gray-700 rounded-md text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., 5"
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
        />
      </div>
    </div>
  </div>
);

interface SummaryOutputProps {
  analysis: Analysis | null;
  loading: boolean;
}

const SummaryOutput = ({ analysis, loading }: SummaryOutputProps) => (
  <div className="bg-gray-800 p-6 rounded-lg">
    <h3 className="text-lg font-semibold mb-4">Model Summary</h3>
    {loading ? (
      <div className="text-gray-300">
        <p>Analyzing scenario...</p>
      </div>
    ) : analysis ? (
      <div className="text-gray-300 space-y-3">
        <p><span className="font-semibold">Impact:</span> {analysis.summary}</p>
        <p><span className="font-semibold">Potential costs:</span> {analysis.potentialCosts}</p>
        <p><span className="font-semibold">Risk Level:</span> <span className={`font-bold ${
          analysis.riskLevel === 'High' ? 'text-red-400' : 
          analysis.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'
        }`}>{analysis.riskLevel}</span></p>
        <p><span className="font-semibold">Timeline:</span> {analysis.timeline}</p>
        
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Recommendations:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {analysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
        
        {analysis.complianceActions && analysis.complianceActions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Required Actions:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {analysis.complianceActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ) : (
      <div className="text-gray-300">
        <p>Enter a scenario above and click "Calculate Scenario" to see the analysis.</p>
      </div>
    )}
  </div>
);

export default function WhatIfCalculator() {
  const [scenario, setScenario] = useState("");
  const [strictness, setStrictness] = useState("Low");
  const [timeline, setTimeline] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calculateScenario = async () => {
    if (!scenario || !timeline) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/what-if-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          strictness,
          timeline: parseInt(timeline)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Failed to analyze scenario');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#111827] text-white font-sans">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#111827]">
          <h1 className="text-2xl font-bold mb-8">What-If Scenario Calculator</h1>
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ScenarioInput scenario={scenario} setScenario={setScenario} />
              <TimelineInputs 
                strictness={strictness} 
                setStrictness={setStrictness}
                timeline={timeline}
                setTimeline={setTimeline}
              />
              <button 
                onClick={calculateScenario}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 w-full"
              >
                {loading ? 'Analyzing...' : 'Calculate Scenario'}
              </button>
            </div>
            <SummaryOutput analysis={analysis} loading={loading} />
          </div>
          
          {/* Company Data Tables */}
          {analysis && (
            <div className="mt-8 space-y-8">
              {/* Company Inputs Table */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Company Inputs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Company</th>
                        <th className="px-6 py-3">Industry</th>
                        <th className="px-6 py-3">Revenue</th>
                        <th className="px-6 py-3">Emissions</th>
                        <th className="px-6 py-3">NumFacilities</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.companyInputs.map((company, index) => (
                        <tr key={index} className="bg-gray-800 border-b border-gray-700">
                          <td className="px-6 py-4 font-medium text-white">{company.company}</td>
                          <td className="px-6 py-4">{company.industry}</td>
                          <td className="px-6 py-4">{company.revenue}</td>
                          <td className="px-6 py-4">{company.emissions.toLocaleString()}</td>
                          <td className="px-6 py-4">{company.numFacilities}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Predicted Compliance Costs Table */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Predicted Compliance Costs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">#</th>
                        <th className="px-6 py-3">Company</th>
                        <th className="px-6 py-3">Industry</th>
                        <th className="px-6 py-3">Revenue</th>
                        <th className="px-6 py-3">Emissions</th>
                        <th className="px-6 py-3">NumFacilities</th>
                        <th className="px-6 py-3">Predicted Cost ($M)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.complianceCosts.map((company, index) => (
                        <tr key={index} className="bg-gray-800 border-b border-gray-700">
                          <td className="px-6 py-4 font-medium text-white">{index}</td>
                          <td className="px-6 py-4 font-medium text-white">{company.company}</td>
                          <td className="px-6 py-4">{company.industry}</td>
                          <td className="px-6 py-4">{company.revenue}</td>
                          <td className="px-6 py-4">{company.emissions.toLocaleString()}</td>
                          <td className="px-6 py-4">{company.numFacilities}</td>
                          <td className="px-6 py-4 font-semibold text-green-400">{company.predictedCost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

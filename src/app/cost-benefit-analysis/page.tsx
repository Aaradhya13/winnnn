"use client";
import React, { useState } from "react";
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
ChartJS.register(BarElement);

interface Analysis {
  selectedCompany: string;
  companyData: {
    initialCost: string;
    annualSavings: string;
    roi: string;
    paybackPeriod: string;
    implementationTime: string;
  };
  roiRankings: any[];
  strategies: any[];
  recommendations: string[];
  chartData: {
    costs: number[];
    savings: number[];
    strategies: string[];
    roi: number[];
  };
}

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  fileName: string;
}

const FileUpload = ({ onFileUpload, fileName }: FileUploadProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Upload Cost-Benefit Data (CSV)</h3>
      <div className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-6 h-6 mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-400">CSV file (multi-company supported)</p>
            {fileName && <p className="text-xs text-green-400 mt-2">Uploaded: {fileName}</p>}
          </div>
          <input id="dropzone-file" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
        </label>
      </div> 
    </div>
  );
};


interface ROIRankingGraphsProps {
  analysis: Analysis | null;
  loading: boolean;
}

// Simple ROI Bar Chart component

export default function CostBenefitAnalysis() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [showAnalyze, setShowAnalyze] = useState(false);

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileData(content);
    };
    reader.readAsText(file);
  };

  // Send CSV to FastAPI backend and update analysis
  const analyzeData = async () => {
    setError("");
    if (!fileData || !fileName) {
      setError("Please upload a CSV file first");
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const formData = new FormData();
      const blob = new Blob([fileData], { type: 'text/csv' });
      formData.append('file', blob, fileName);
      const response = await fetch('http://localhost:8000/cost-benefit-analysis/analyze', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const result = await response.json();
      console.log("API result:", result);
      if (result.results && result.results.length > 0 && result.companies && result.companies.length > 0) {
        setAllResults(result.results);
        setCompanyOptions(result.companies);
        setShowAnalyze(true);
        setSelectedCompany("");
      } else {
        setAnalysis(null);
        setCompanyOptions([]);
        setShowAnalyze(false);
        setError("No company data found in analysis results.");
      }
    } catch (err) {
      setAnalysis(null);
      setCompanyOptions([]);
      setShowAnalyze(false);
      setError("Failed to analyze data. " + (err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  };

  // Show ROI table only after user clicks Analyze for selected company
  const handleAnalyzeCompany = () => {
    if (!selectedCompany || allResults.length === 0) return;
    const companyData = allResults.find((r: { company: string }) => r.company === selectedCompany);
    if (companyData) {
      setAnalysis({
        selectedCompany: companyData.company,
        companyData: companyData.companyData,
        roiRankings: companyData.roiRankings,
        strategies: companyData.strategies,
        recommendations: companyData.recommendations,
        chartData: {
          costs: companyData.strategies.map((s: any) => s.cost),
          savings: companyData.strategies.map((s: any) => s.savings),
          strategies: companyData.strategies.map((s: any) => s.strategy),
          roi: companyData.strategies.map((s: any) => s.roi),
        },
      });
    }
  };

  // Remove effect that auto-shows analysis

  return (
    <div className="flex min-h-screen bg-[#111827] text-white font-sans">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#111827]">
          <h1 className="text-2xl font-bold mb-8">Cost-Benefit Analysis</h1>
          {/* Error display */}
          {error && (
            <div className="bg-red-900 text-red-300 p-4 mb-4 rounded-lg text-center">
              {error}
            </div>
          )}
          {/* File Upload */}
          <div className="mb-6">
            <FileUpload onFileUpload={handleFileUpload} fileName={fileName} />
            <button 
              onClick={analyzeData}
              disabled={!fileData || loading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {/* Company Dropdown and Analyze Button */}
          {showAnalyze && companyOptions.length > 0 && (
            <div className="mb-8 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Select Company</h3>
              <select 
                className="w-full p-3 bg-gray-700 rounded-md text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500 mb-4"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <option value="">Choose a company</option>
                {companyOptions.map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
              <button 
                onClick={handleAnalyzeCompany}
                disabled={!selectedCompany}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Analyze
              </button>
            </div>
          )}
          {/* ROI Rankings Table Only */}
          {analysis && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">ROI Rankings for {analysis.selectedCompany}</h3>
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                    <tr>
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">Strategy</th>
                      <th className="px-6 py-3">Cost</th>
                      <th className="px-6 py-3">Savings</th>
                      <th className="px-6 py-3">Waste Reduction</th>
                      <th className="px-6 py-3">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.strategies.map((strategy, index) => (
                      <tr key={index} className="bg-gray-800 border-b border-gray-700">
                        <td className="px-6 py-4 font-medium text-white">{index}</td>
                        <td className="px-6 py-4">{strategy.strategy}</td>
                        <td className="px-6 py-4">${strategy.cost.toLocaleString()}</td>
                        <td className="px-6 py-4">${strategy.savings.toLocaleString()}</td>
                        <td className="px-6 py-4">{strategy.waste_reduction}</td>
                        <td className="px-6 py-4 text-green-400 font-semibold">{strategy.roi.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* ROI Bar Chart */}
              <h3 className="text-lg font-semibold mb-4">ROI Bar Chart (per Strategy)</h3>
              <div className="bg-gray-900 p-4 rounded-lg mb-8">
                <Bar
                  data={{
                    labels: analysis.strategies.map((s) => s.strategy),
                    datasets: [
                      {
                        label: 'ROI (%)',
                        data: analysis.strategies.map((s) => s.roi),
                        backgroundColor: '#2563eb',
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    scales: {
                      x: {
                        title: { display: true, text: 'Strategy', color: '#fff' },
                        ticks: { color: '#fff' },
                        grid: { color: '#374151' },
                      },
                      y: {
                        title: { display: true, text: 'ROI (%)', color: '#fff' },
                        ticks: { color: '#fff' },
                        grid: { color: '#374151' },
                      },
                    },
                  }}
                />
              </div>
              {/* Benefit Line Chart */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <Line
                  data={{
                    labels: analysis.strategies.map((s) => s.strategy),
                    datasets: [
                      {
                        label: '', // Remove label so legend doesn't show
                        data: analysis.strategies.map((s) => s.savings),
                        borderColor: '#34d399',
                        backgroundColor: 'rgba(52,211,153,0.2)',
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: '#34d399',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    scales: {
                      x: {
                        title: { display: true, text: 'Strategy', color: '#fff' },
                        ticks: { color: '#fff' },
                        grid: { color: '#374151' },
                      },
                      y: {
                        title: { display: true, text: 'Projected Savings', color: '#fff' },
                        ticks: { color: '#fff' },
                        grid: { color: '#374151' },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}
          {/* Empty state if no analysis yet */}
          {!analysis && !loading && (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <div className="text-gray-300">Upload a CSV file and click Upload to see companies. Then select a company and click Analyze to see ROI rankings.</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

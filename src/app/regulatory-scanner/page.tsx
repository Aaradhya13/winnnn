"use client";
import React, { useRef, useState, useEffect } from "react";

export default function RegulatoryScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Auto-dismiss alert after 3 seconds
  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => setSaveStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setLoading(true);
    setError(null);
    setSummary([]);
    setAlerts([]);
    setSaveStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://localhost:8000/ai-agent/analyze", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to analyze file");
      }
      const data = await res.json();
      setSummary(data.summary || []);
      setAlerts(data.alerts || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveStatus(null);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/ai-agent/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, alerts }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save results");
      }
      setSaveStatus("Results and file saved to database!");
      setSummary([]);
      setAlerts([]);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#111827] text-white font-sans relative">
      {/* Success Alert (toast style) */}
      {saveStatus && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span>{saveStatus}</span>
          <button className="ml-4 text-white hover:text-gray-200" onClick={() => setSaveStatus(null)}>&times;</button>
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#111827]">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Regulatory Scanner</h1>
              <p className="text-gray-400">Upload and analyze regulatory compliance data for your organization</p>
            </div>
            {/* File Upload Section */}
            <div className="bg-[#1f2937] border border-[#374151] rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Upload Emissions Data</h2>
                  <p className="text-gray-400 text-sm">Upload CSV files to analyze regulatory compliance</p>
                </div>
              </div>
              <div className="border-2 border-dashed border-[#4b5563] rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-300 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">CSV files only</p>
                </label>
                {selectedFile && (
                  <div className="mt-2 text-gray-300">Selected file: <span className="font-semibold">{selectedFile.name}</span></div>
                )}
                {loading && <div className="mt-4 text-blue-400">Analyzing file...</div>}
                {error && <div className="mt-4 text-red-400">{error}</div>}
              </div>
            </div>
            {/* Results Section */}
            <div className="bg-[#1f2937] border border-[#374151] rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4">AI Agent Results</h3>
              {summary.length === 0 && alerts.length === 0 && !loading && !error && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 text-lg">No data uploaded yet</p>
                  <p className="text-gray-500 text-sm">Upload a CSV file to see the AI agent's analysis</p>
                </div>
              )}
              {summary.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Summary</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-[#374151]">
                          {Object.keys(summary[0]).map((header) => (
                            <th key={header} className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#374151]">
                        {summary.map((row, i) => (
                          <tr key={i} className="hover:bg-[#2d3748] transition-colors">
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="px-4 py-3 text-sm text-gray-300">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {alerts.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-yellow-400 mb-2">Alerts</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                    {alerts.map((alert, idx) => (
                      <li key={idx} className="mb-1">
                        <span className="font-semibold">[{alert.urgency}]</span> {alert.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(summary.length > 0 || alerts.length > 0) && selectedFile && (
                <button
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                  onClick={handleSave}
                  disabled={loading}
                >
                  Save to Database
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

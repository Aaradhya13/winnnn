"use client";
import React, { useState } from "react";

interface Analysis {
  fileName: string;
  overallRiskScore: number;
  riskLevel: string;
  keyRiskAreas: string[];
  recommendations: string[];
  complianceMetrics: {
    regulatoryCompliance: number;
    dataPrivacy: number;
    environmentalImpact: number;
    operationalRisk: number;
  };
  actionItems: any[];
  timeline: any;
  companyRiskData: any[];
}

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onAnalyze: () => void;
  fileName: string;
  loading: boolean;
  hasFile: boolean;
}

const FileUpload = ({ onFileUpload, onAnalyze, fileName, loading, hasFile }: FileUploadProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Upload Risk Input File</h3>
      <div className="flex items-center justify-center w-full mb-4">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-6 h-6 mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-400">CSV, XLSX, or other supported formats</p>
            {fileName && <p className="text-xs text-green-400 mt-2">Uploaded: {fileName}</p>}
          </div>
          <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
      <button 
        onClick={onAnalyze}
        disabled={!hasFile || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
      >
        {loading ? 'Analyzing...' : 'Analyze Risk'}
      </button>
    </div>
  );
};

interface AnalysisResultsProps {
  analysis: Analysis | null;
}


// Risk Metrics Chart
const RiskMetricsChart = ({ analysis }: { analysis: Analysis }) => (
  <div className="bg-gray-800 p-6 rounded-lg">
    <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
    <div className="space-y-4">
      {Object.entries(analysis.complianceMetrics).map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const percentage = value;
        return (
          <div key={key} className="flex items-center space-x-4">
            <div className="w-32 text-sm text-gray-300">{label}</div>
            <div className="flex-1 bg-gray-700 rounded-full h-4 relative">
              <div 
                className={`h-4 rounded-full ${
                  percentage > 70 ? 'bg-red-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                {percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// Company Risk Comparison Chart
const CompanyRiskChart = ({ analysis }: { analysis: Analysis }) => (
  <div className="bg-gray-800 p-6 rounded-lg">
    <h3 className="text-lg font-semibold mb-4">Company Risk Comparison</h3>
    <div className="space-y-3">
      {analysis.companyRiskData.slice(0, 5).map((company, index) => {
        const maxCost = Math.max(...analysis.companyRiskData.map(c => c.penalty_cost));
        const percentage = (company.penalty_cost / maxCost) * 100;
        return (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-24 text-sm text-gray-300 truncate">{company.company}</div>
            <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
              <div 
                className={`h-6 rounded-full ${
                  company.recommended_action === 'Fix Compliance Issue' ? 'bg-red-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${percentage}%` }}
              >
                <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-semibold text-white">
                  ${company.penalty_cost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const AnalysisResults = ({ analysis }: AnalysisResultsProps) => (
  <div className="bg-gray-800 p-6 rounded-lg">
    <h3 className="text-lg font-semibold mb-4">Analysis Summary</h3>
    {analysis ? (
      <div className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-bold mb-2 ${
            analysis.riskLevel === 'High' || analysis.riskLevel === 'Very High' ? 'text-red-400' : 
            analysis.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {analysis.overallRiskScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Overall Risk Score</div>
          <div className={`text-lg font-semibold ${
            analysis.riskLevel === 'High' || analysis.riskLevel === 'Very High' ? 'text-red-400' : 
            analysis.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {analysis.riskLevel}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-gray-300">Key Risk Areas</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.keyRiskAreas.map((area, index) => (
              <span key={index} className="bg-red-600 text-white px-2 py-1 rounded text-sm">
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="text-gray-300 text-center py-8">
        <p>Upload a file and click analyze to see results.</p>
      </div>
    )}
  </div>
);

interface RecommendedActionsChartProps {
  analysis: Analysis | null;
}

const RecommendedActionsChart = ({ analysis }: RecommendedActionsChartProps) => (
  <div className="bg-gray-800 p-6 rounded-lg">
    <h3 className="text-lg font-semibold mb-4">Recommended Actions</h3>
    {analysis && analysis.recommendations ? (
      <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
        {analysis.recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    ) : (
      <div className="h-64 bg-gray-700 rounded-md flex items-center justify-center text-gray-400">
        <p>Recommendations will appear here.</p>
      </div>
    )}
  </div>
);

export default function ComplianceRiskCalculator() {
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState("");
  // Removed error state since backend logic is removed

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileData(content);
      // Don't auto-analyze, wait for user to click analyze button
    };
    reader.readAsText(file);
  };


  // Integrate with FastAPI backend
const analyzeRisk = async () => {
    if (!fileData || !fileName) return;
    setLoading(true);
    setAnalysis(null);
    try {
      // Prepare file for backend
      const formData = new FormData();
      const blob = new Blob([fileData], { type: 'text/csv' });
      formData.append('file', blob, fileName);
      const response = await fetch('http://localhost:8000/compliance-risk-calculator/analyze', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      // Map backend results to frontend structure
      if (result.results) {
        setAnalysis({
          fileName,
          overallRiskScore: 0, // Not provided by backend
          riskLevel: '', // Not provided by backend
          keyRiskAreas: [], // Not provided by backend
          recommendations: [], // Not provided by backend
          complianceMetrics: {
            regulatoryCompliance: 0,
            dataPrivacy: 0,
            environmentalImpact: 0,
            operationalRisk: 0,
          },
          actionItems: [],
          timeline: null,
          companyRiskData: result.results,
        });
      } else {
        setAnalysis(null);
      }
    } catch (err) {
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for downloadReport function
  const downloadReport = () => {
    alert('Download functionality will be available after backend integration.');
  };

  return (
    <div className="flex min-h-screen bg-[#111827] text-white font-sans">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#111827]">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-2xl font-bold">Compliance Risk Calculator</h1>
            <button 
              onClick={downloadReport}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Download Risk Report (CSV)
            </button>
          </div>
          {/* Error display removed since error state is gone */}
          {/* Upload and Analyze Section */}
          <div className="mb-8">
            <FileUpload 
              onFileUpload={handleFileUpload} 
              onAnalyze={analyzeRisk}
              fileName={fileName} 
              loading={loading}
              hasFile={!!fileData}
            />
          </div>
          
          {/* Analysis Results */}
          {loading ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <div className="text-gray-300">Analyzing risk data...</div>
            </div>
          ) : analysis && analysis.companyRiskData ? (
            (() => {
              // Filtered data
              const filteredData = filterAction
                ? analysis.companyRiskData.filter(c => c.recommended_action === filterAction)
                : analysis.companyRiskData;
              return (
                <div className="bg-gray-800 p-6 rounded-lg w-full">
                  <h3 className="text-lg font-semibold mb-4">Compliance Risk Analysis Results</h3>

                  {/* Bar Chart for Savings If Fixed by Company & Pie Chart */}
                  <div className="mb-8 flex flex-col md:flex-row gap-8 w-full">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-2 text-gray-300">Savings If Fixed (Bar Chart)</h4>
                      <div className="w-full overflow-x-auto">
                        <svg
                          width="100%"
                          height="260"
                          viewBox={`0 0 ${filteredData.length * 80 + 120} 260`}
                          preserveAspectRatio="xMinYMin meet"
                        >
                          {/* Y-axis */}
                          <line x1="80" y1="20" x2="80" y2="200" stroke="#d1d5db" strokeWidth="2" />
                          {/* X-axis */}
                          <line x1="80" y1="200" x2={filteredData.length * 80 + 80} y2="200" stroke="#d1d5db" strokeWidth="2" />
                          {/* Y-axis labels (0, max) */}
                          <text x="50" y="200" fill="#d1d5db" fontSize="12">0</text>
                          <text x="40" y="40" fill="#d1d5db" fontSize="12">{filteredData.length > 0 ? Math.max(...filteredData.map(c => Math.abs(c.savings_if_fixed))).toLocaleString() : 0}</text>
                          {/* Bars */}
                          {(() => {
                            const maxValue = filteredData.length > 0 ? Math.max(...filteredData.map(c => Math.abs(c.savings_if_fixed))) : 1;
                            return filteredData.map((company, idx) => {
                              const barHeight = (Math.abs(company.savings_if_fixed) / maxValue) * 160;
                              return (
                                <g key={company.company}>
                                  <rect
                                    x={100 + idx * 80}
                                    y={200 - barHeight}
                                    width="48"
                                    height={barHeight}
                                    fill={company.savings_if_fixed >= 0 ? '#34D399' : '#F87171'}
                                  />
                                  {/* Company label (x-axis, rotated) */}
                                  <text x={124 + idx * 80} y="225" textAnchor="end" fill="#d1d5db" fontSize="12" transform={`rotate(-45,${124 + idx * 80},225)`}>{company.company}</text>
                                  {/* Value label above bar */}
                                  <text x={124 + idx * 80} y={200 - barHeight - 8} textAnchor="middle" fill={company.savings_if_fixed >= 0 ? '#34D399' : '#F87171'} fontSize="12">
                                    {company.savings_if_fixed >= 0 ? '+' : '-'}${Math.abs(company.savings_if_fixed).toLocaleString()}
                                  </text>
                                </g>
                              );
                            });
                          })()}
                        </svg>
                      </div>
                    </div>
                    {/* Pie Chart for Recommended Actions */}
                    <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
                      <h4 className="font-semibold mb-2 text-gray-300">Recommended Actions (Pie Chart)</h4>
                      <div className="w-full flex flex-col items-center">
                        <svg
                          width="100%"
                          height="160"
                          viewBox="0 0 160 160"
                          preserveAspectRatio="xMinYMin meet"
                        >
                          {(() => {
                            const actionCounts = filteredData.reduce((acc, curr) => {
                              acc[curr.recommended_action] = (acc[curr.recommended_action] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);
                            const total = Object.values(actionCounts).map(Number).reduce((a, b) => a + b, 0);
                            let startAngle = 0;
                            const colors = ['#34D399', '#F87171', '#60A5FA', '#FBBF24'];
                            const actions = Object.keys(actionCounts);
                            return actions.map((action, idx) => {
                              const value = actionCounts[action];
                              const angle = (value / total) * 2 * Math.PI;
                              const x1 = 80 + 70 * Math.cos(startAngle);
                              const y1 = 80 + 70 * Math.sin(startAngle);
                              const x2 = 80 + 70 * Math.cos(startAngle + angle);
                              const y2 = 80 + 70 * Math.sin(startAngle + angle);
                              const largeArcFlag = angle > Math.PI ? 1 : 0;
                              const pathData = `M80,80 L${x1},${y1} A70,70 0 ${largeArcFlag},1 ${x2},${y2} Z`;
                              const slice = (
                                <path key={action} d={pathData} fill={colors[idx % colors.length]} />
                              );
                              startAngle += angle;
                              return slice;
                            });
                          })()}
                          {/* Center circle for donut effect */}
                          <circle cx="80" cy="80" r="40" fill="#111827" />
                        </svg>
                        {/* Legend with more spacing and spread text */}
                        <div className="flex flex-col items-start mt-4 w-full">
                          {(() => {
                            const actionCounts = filteredData.reduce((acc, curr) => {
                              acc[curr.recommended_action] = (acc[curr.recommended_action] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);
                            const actions = Object.keys(actionCounts);
                            const colors = ['#34D399', '#F87171', '#60A5FA', '#FBBF24'];
                            return actions.map((action, idx) => (
                              <div key={action} className="flex items-center mb-3">
                                <div style={{ width: 18, height: 18, background: colors[idx % colors.length], borderRadius: 4, marginRight: 12 }}></div>
                                <span style={{ color: '#d1d5db', fontSize: 15, letterSpacing: 1, fontWeight: 500 }}>{action}</span>
                                <span style={{ color: '#d1d5db', fontSize: 15, marginLeft: 10 }}>({actionCounts[action]})</span>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                          <th className="px-6 py-3">#</th>
                          <th className="px-6 py-3">Company</th>
                          <th className="px-6 py-3">Compliance Cost</th>
                          <th className="px-6 py-3">Penalty Cost</th>
                          <th className="px-6 py-3">Savings If Fixed</th>
                          <th className="px-6 py-3">Recommended Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((company, index) => (
                          <tr key={index} className="bg-gray-800 border-b border-gray-700">
                            <td className="px-6 py-4 font-medium text-white">{index}</td>
                            <td className="px-6 py-4 font-medium text-white">{company.company}</td>
                            <td className="px-6 py-4">${company.compliance_cost.toLocaleString()}</td>
                            <td className="px-6 py-4">${company.penalty_cost.toLocaleString()}</td>
                            <td className={`px-6 py-4 font-semibold ${
                              company.savings_if_fixed >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {company.savings_if_fixed >= 0 ? '+' : '-'}${Math.abs(company.savings_if_fixed).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">{company.recommended_action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Compliance Cost vs Penalty Cost Bar Chart & Filtering UI */}
                  <div className="mb-8 flex flex-col md:flex-row gap-8 w-full">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-2 text-gray-300">Compliance Cost vs Penalty Cost (Bar Chart)</h4>
                      <div className="w-full overflow-x-auto">
                        <svg
                          width="100%"
                          height="260"
                          viewBox={`0 0 ${filteredData.length * 80 + 120} 260`}
                          preserveAspectRatio="xMinYMin meet"
                        >
                          {/* Y-axis */}
                          <line x1="80" y1="20" x2="80" y2="200" stroke="#d1d5db" strokeWidth="2" />
                          {/* X-axis */}
                          <line x1="80" y1="200" x2={filteredData.length * 80 + 80} y2="200" stroke="#d1d5db" strokeWidth="2" />
                          {/* Y-axis labels (0, max) */}
                          <text x="50" y="200" fill="#d1d5db" fontSize="12">0</text>
                          <text x="40" y="40" fill="#d1d5db" fontSize="12">{filteredData.length > 0 ? Math.max(...filteredData.map(c => Math.max(c.compliance_cost, c.penalty_cost))).toLocaleString() : 0}</text>
                          {/* Bars */}
                          {(() => {
                            const maxValue = filteredData.length > 0 ? Math.max(...filteredData.map(c => Math.max(c.compliance_cost, c.penalty_cost))) : 1;
                            return filteredData.map((company, idx) => {
                              const complianceBarHeight = (company.compliance_cost / maxValue) * 160;
                              const penaltyBarHeight = (company.penalty_cost / maxValue) * 160;
                              return (
                                <g key={company.company}>
                                  {/* Compliance Cost Bar */}
                                  <rect
                                    x={100 + idx * 80}
                                    y={200 - complianceBarHeight}
                                    width="20"
                                    height={complianceBarHeight}
                                    fill="#60A5FA"
                                  />
                                  {/* Penalty Cost Bar */}
                                  <rect
                                    x={120 + idx * 80}
                                    y={200 - penaltyBarHeight}
                                    width="20"
                                    height={penaltyBarHeight}
                                    fill="#FBBF24"
                                  />
                                  {/* Company label (x-axis, rotated) */}
                                  <text x={124 + idx * 80} y="225" textAnchor="end" fill="#d1d5db" fontSize="12" transform={`rotate(-45,${124 + idx * 80},225)`}>{company.company}</text>
                                </g>
                              );
                            });
                          })()}
                        </svg>
                        {/* Bar Chart Legend */}
                        <div className="flex flex-row gap-8 mt-4 items-center flex-wrap">
                          <div className="flex items-center mr-8 mb-2">
                            <div style={{ width: 18, height: 18, background: '#60A5FA', borderRadius: 4, marginRight: 8 }}></div>
                            <span style={{ color: '#d1d5db', fontSize: 15, letterSpacing: 1, fontWeight: 500 }}>Compliance Cost (Blue)</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <div style={{ width: 18, height: 18, background: '#FBBF24', borderRadius: 4, marginRight: 8 }}></div>
                            <span style={{ color: '#d1d5db', fontSize: 15, letterSpacing: 1, fontWeight: 500 }}>Penalty Cost (Yellow)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Filtering UI */}
                    <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
                      <h4 className="font-semibold mb-2 text-gray-300">Filter by Recommended Action</h4>
                      <select
                        className="bg-gray-700 text-white p-2 rounded mb-4 w-full max-w-xs"
                        value={filterAction}
                        onChange={e => setFilterAction(e.target.value)}
                      >
                        <option value="">All</option>
                        {Array.from(new Set(analysis.companyRiskData.map(c => c.recommended_action))).map(action => (
                          <option key={action} value={action}>{action}</option>
                        ))}
                      </select>
                      <div className="text-gray-400 text-sm">Select an action to filter the table and charts.</div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <div className="text-gray-300">Upload a file and click analyze to see the risk assessment.</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

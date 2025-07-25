import React from "react";

const reportsData = [
  {
    id: 1,
    reportType: "Annual Emissions Report",
    dateRange: "2023-01-01 to 2023-12-31",
    generatedAt: "2024-01-15",
    format: "PDF",
  },
  {
    id: 2,
    reportType: "Compliance Report",
    dateRange: "2023-10-01 to 2023-12-31",
    generatedAt: "2024-01-10",
    format: "CSV",
  },
  {
    id: 3,
    reportType: "Sustainability Performance Report",
    dateRange: "2023-01-01 to 2023-06-30",
    generatedAt: "2023-07-05",
    format: "XLSX",
  },
];

const ReportsList = () => (
  <div className="bg-gray-800 p-8 rounded-lg w-full max-w-6xl mx-auto">
    <h2 className="text-2xl font-bold mb-6 text-white">Generated Reports</h2>

    {/* Table for larger screens */}
    <div className="overflow-x-auto hidden md:block">
      <table className="w-full text-left text-gray-300">
        <thead className="bg-gray-700 text-gray-100 uppercase text-sm">
          <tr>
            <th className="p-4">Report Type</th>
            <th className="p-4">Date Range</th>
            <th className="p-4">Generated At</th>
            <th className="p-4">Format</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reportsData.map((report) => (
            <tr key={report.id} className="border-b border-gray-700 hover:bg-gray-700/50">
              <td className="p-4">{report.reportType}</td>
              <td className="p-4">{report.dateRange}</td>
              <td className="p-4">{report.generatedAt}</td>
              <td className="p-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${report.format === 'PDF' ? 'bg-red-600' : report.format === 'CSV' ? 'bg-green-600' : 'bg-blue-600'}`}>
                  {report.format}
                </span>
              </td>
              <td className="p-4">
                <a href="#" className="text-blue-400 hover:text-blue-300 font-semibold">Download</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Cards for smaller screens */}
    <div className="md:hidden space-y-4">
      {reportsData.map((report) => (
        <div key={report.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-white">{report.reportType}</h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${report.format === 'PDF' ? 'bg-red-600' : report.format === 'CSV' ? 'bg-green-600' : 'bg-blue-600'}`}>
              {report.format}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-1">Date Range: {report.dateRange}</p>
          <p className="text-sm text-gray-300 mb-3">Generated At: {report.generatedAt}</p>
          <a href="#" className="text-blue-400 hover:text-blue-300 font-semibold text-sm">Download Report</a>
        </div>
      ))}
    </div>
  </div>
);

export default function Reports() {
  return (
    <div className="flex min-h-screen bg-[#111827] text-white font-sans">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#111827] flex flex-col justify-start">
          <ReportsList />
        </main>
      </div>
    </div>
  );
}
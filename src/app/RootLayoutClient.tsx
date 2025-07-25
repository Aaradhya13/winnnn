"use client";
import Sidebar from "./components/Sidebar";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRegulatoryData } from "./components/RegulatoryDataContext";

interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export default function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("Acme Corp");
  const { user, login, logout } = useRegulatoryData();
  const pathname = usePathname();
  const router = useRouter();

  const companies = [
    "Acme Corp",
    "Tech Solutions Inc",
    "Green Energy Ltd",
    "Global Industries",
    "Innovation Labs"
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      login(JSON.parse(storedUser), token);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Don't show sidebar on landing page
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#111827] text-white font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        {/* Header with hamburger and profile */}
        <header className="flex items-center justify-between px-4 py-4 shadow-sm rounded-b-xl md:px-8">
          {/* Hamburger Menu */}
          <button
            className="text-white md:hidden focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          
          <div className="flex-grow" />
          
          {/* Company Selector and Profile */}
          <div className="flex items-center gap-4 relative">
            {/* Company Dropdown */}
            <div className="relative">
              <select 
                className="bg-[#22304a] text-white px-3 py-1 rounded-lg text-sm font-medium focus:outline-none"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Profile Icon */}
            <div className="relative">
              <div 
                className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:bg-gray-500 transition-colors"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                {user ? (
                  <span className="text-sm">
                    {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </span>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              
              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 bg-white text-black rounded-lg shadow-lg min-w-[200px] z-50 p-4">
                  {user ? (
                    <>
                      <div className="mb-2 font-semibold">{user.full_name || "User"}</div>
                      <div className="mb-2 text-xs text-gray-600">{user.email}</div>
                      <hr className="my-2" />
                      <a href="/profile" className="block py-1 hover:underline">Profile</a>
                      <a href="/settings" className="block py-1 hover:underline">Settings</a>
                      <hr className="my-2" />
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left py-1 text-red-600 hover:underline"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <a href="/login" className="block py-1 hover:underline">Login</a>
                      <a href="/register" className="block py-1 hover:underline">Register</a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#111827]">
          {children}
        </main>
      </div>
    </div>
  );
}
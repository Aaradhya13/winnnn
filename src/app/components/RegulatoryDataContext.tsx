"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface RegulatoryDataItem {
  Industry?: string;
  Emissions?: string;
  Due?: string;
  Deadline?: string;
  Regulation?: string;
  Compliance?: string;
  Status?: string;
  emissions?: string;
  industry?: string;
  [key: string]: any; 
}

export type RegulatoryData = RegulatoryDataItem[];

interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

interface RegulatoryDataContextType {
  data: RegulatoryData;
  setData: (data: RegulatoryData) => void;
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const RegulatoryDataContext = createContext<RegulatoryDataContextType | undefined>(undefined);

export function RegulatoryDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegulatoryData>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = (userData: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/dashboard/data');
      if (response.ok) {
        const result = await response.json();
        // Map the data to ensure compatibility with existing components
        const mappedData = (result.data || []).map((item: any) => ({
          ...item,
          // Ensure both formats are available for backward compatibility
          industry: item.Industry || item.industry_name,
          emissions: item.Emissions || item.emissions_amount,
          compliance_level: item.Compliance || item.compliance_status
        }));
        setData(mappedData);
        console.log('Data loaded from API:', result.message);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <RegulatoryDataContext.Provider value={{ data, setData, user, login, logout, loading, error, refreshData }}>
      {children}
    </RegulatoryDataContext.Provider>
  );
}

export function useRegulatoryData() {
  const context = useContext(RegulatoryDataContext);
  if (!context) {
    throw new Error("useRegulatoryData must be used within a RegulatoryDataProvider");
  }
  return context;
}
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSchoolYears, SchoolYear } from '../services/schoolYearService';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'selectedSchoolYearId';

interface SchoolYearContextType {
  years: SchoolYear[];
  selectedYear: SchoolYear | null;
  currentYear: SchoolYear | null;
  isCurrentYear: boolean;
  selectYear: (id: string) => void;
  loading: boolean;
}

const SchoolYearContext = createContext<SchoolYearContextType | undefined>(undefined);

function readStoredYearId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeYearId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // The choice is simply not remembered
  }
}

export function SchoolYearProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [years, setYears] = useState<SchoolYear[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(readStoredYearId());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSchoolYears().then((data) => {
      setYears(data);
      setLoading(false);
    });
  }, [user]);

  const currentYear = years.find((year) => year.is_current) || years[0] || null;
  const selectedYear = years.find((year) => year.id === selectedId) || currentYear;

  const selectYear = (id: string) => {
    setSelectedId(id);
    storeYearId(id);
  };

  return (
    <SchoolYearContext.Provider
      value={{
        years,
        selectedYear,
        currentYear,
        isCurrentYear: !!selectedYear && selectedYear.id === currentYear?.id,
        selectYear,
        loading
      }}
    >
      {children}
    </SchoolYearContext.Provider>
  );
}

export function useSchoolYear() {
  const context = useContext(SchoolYearContext);
  if (context === undefined) {
    throw new Error('useSchoolYear must be used within a SchoolYearProvider');
  }
  return context;
}

import { createContext, useContext, ReactNode } from 'react';
import { useHolidayData } from '@/hooks/useHolidayData';
import { HOLIDAY } from '@/configs/holidays';

interface HolidayContextValue {
  holidays: Map<string, HOLIDAY>;
  restDays: Map<string, HOLIDAY>;
  workdays: Map<string, HOLIDAY>;
  isLoading: boolean;
}

const HolidayContext = createContext<HolidayContextValue | undefined>(undefined);

export const HolidayProvider = ({ children }: { children: ReactNode }) => {
  const holidayData = useHolidayData();

  return (
    <HolidayContext.Provider value={holidayData}>
      {children}
    </HolidayContext.Provider>
  );
};

export const useHoliday = () => {
  const context = useContext(HolidayContext);
  if (context === undefined) {
    throw new Error('useHoliday must be used within a HolidayProvider');
  }
  return context;
};

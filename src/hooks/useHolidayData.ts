import { useState, useEffect } from 'react';
import { getHolidayData, HolidayData } from '@/services/holidayService';
import { holidays, restDays, workdays } from '@/configs/holidays';

// 初始 fallback 数据
const fallbackData: HolidayData = {
  holidays,
  restDays,
  workdays,
};

console.log('[HolidayData] Fallback data loaded:', {
  holidays: holidays.size,
  restDays: restDays.size,
  workdays: workdays.size,
});

export const useHolidayData = () => {
  // 初始状态直接使用 fallback 数据，避免空白期
  const [holidayData, setHolidayData] = useState<HolidayData>(fallbackData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadHolidayData = async () => {
      console.log('[HolidayData] Starting to load holiday data...');
      setIsLoading(true);
      try {
        const data = await getHolidayData(fallbackData);
        console.log('[HolidayData] Data loaded:', {
          holidays: data.holidays.size,
          restDays: data.restDays.size,
          workdays: data.workdays.size,
        });
        setHolidayData(data);
      } catch (error) {
        console.warn('[HolidayData] Failed to load holiday data:', error);
        // 出错时保持使用 fallback（已经在初始状态设置）
      } finally {
        setIsLoading(false);
      }
    };

    loadHolidayData();
  }, []);

  return {
    ...holidayData,
    isLoading,
  };
};

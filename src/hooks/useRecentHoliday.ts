import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { HolidayDetails, holidayDetails, HOLIDAY } from '@/configs/holidays';

type NearestHoliday = {
  date: Date;
  details: HolidayDetails;
  distanceOfDays: number;
};

const useNextHoliday = (date: Date, holidays: Map<string, HOLIDAY>): NearestHoliday | undefined => {
  const [nextHoliday, setNextHoliday] = useState<NearestHoliday>();

  useEffect(() => {
    let minDiff = Infinity;

    for (const [dateStr, holiday] of holidays) {
      const holidayDate = dayjs(dateStr);
      const currentDayjs = dayjs(date);
      const diff = holidayDate.diff(currentDayjs);

      if (diff >= 0 && diff < minDiff) {
        minDiff = diff;
        const details = holidayDetails[holiday];
        const distanceOfDays = Math.ceil(diff / 86400000);
        setNextHoliday({
          date: holidayDate.toDate(),
          details: details,
          distanceOfDays,
        });
        break;
      }
    }
  }, [date, holidays]);

  return nextHoliday;
};

export default useNextHoliday;

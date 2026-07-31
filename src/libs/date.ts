import {
  HOLIDAY,
  holidayDetails,
} from '@/configs/holidays';
import { FirstDayOfWeek } from '@/hooks/usePreference';
import dayjs from 'dayjs';
import { I18n, Lunar, Solar } from 'lunar-typescript';

export const getPercentageOfYear = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1); // 当年的第一天
  const endOfYear = new Date(date.getFullYear(), 11, 31); // 当年的最后一天

  const totalMilliseconds = endOfYear.getTime() - startOfYear.getTime(); // 当年的总毫秒数
  const elapsedMilliseconds = date.getTime() - startOfYear.getTime(); // 已过去的毫秒数

  const percentage = (elapsedMilliseconds / totalMilliseconds) * 100; // 计算百分比

  return Math.round(percentage * 100) / 100; // 返回百分比，保留两位小数
};

export const getWorkday = (date: Date, workdays: Map<string, HOLIDAY>) => {
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  const holiday = workdays.get(dateStr);
  return holiday;
};

export const getSolarTerm = (date: Date, language: string = 'zh') => {
  // 设置语言
  if (language.startsWith('en')) {
    I18n.setLanguage('en');
  } else {
    I18n.setLanguage('zh');
  }
  
  const lunarDate = Lunar.fromDate(date);
  const solarTerm = lunarDate.getJieQi();
  return solarTerm;
};

export const getRestDay = (date: Date, restDays: Map<string, HOLIDAY>) => {
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  const holiday = restDays.get(dateStr);
  return holiday;
};

export const getFestivals = (date: Date, language: string = 'zh') => {
  // 设置语言
  if (language.startsWith('en')) {
    I18n.setLanguage('en');
  } else {
    I18n.setLanguage('zh');
  }
  
  const solarDate = Solar.fromDate(date);
  const lunarDate = Lunar.fromDate(date);

  const solarFestivals = solarDate.getFestivals();
  const lunarFestivals = lunarDate.getFestivals();

  const festival = [...lunarFestivals, ...solarFestivals];

  return festival;
};

export const getHoliday = (date: Date, holidays: Map<string, HOLIDAY>) => {
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  const holiday = holidays.get(dateStr);
  return holiday;
};

export type HolidaySelect = {
  value: HOLIDAY;
  label: string;
  date: string;
};

export const getHolidays = (holidays: Map<string, HOLIDAY>): HolidaySelect[] => {
  // 使用 Map 来去重，key 为假期类型，value 为该假期的第一个日期
  const uniqueHolidays = new Map<HOLIDAY, string>();
  
  Array.from(holidays).forEach(([date, holiday]) => {
    if (!uniqueHolidays.has(holiday)) {
      uniqueHolidays.set(holiday, date);
    }
  });
  
  const result = Array.from(uniqueHolidays).map(([holiday, date]) => ({
    value: holiday,
    label: holidayDetails[holiday].chinese,
    date: date,
  }));
  
  return result;
};

// 将农历中文日期转换为英文
const convertLunarDateToEnglish = (chineseDate: string): string => {
  // 农历数字映射
  const numberMap: Record<string, string> = {
    '初一': '1st', '初二': '2nd', '初三': '3rd', '初四': '4th', '初五': '5th',
    '初六': '6th', '初七': '7th', '初八': '8th', '初九': '9th', '初十': '10th',
    '十一': '11th', '十二': '12th', '十三': '13th', '十四': '14th', '十五': '15th',
    '十六': '16th', '十七': '17th', '十八': '18th', '十九': '19th', '二十': '20th',
    '廿一': '21st', '廿二': '22nd', '廿三': '23rd', '廿四': '24th', '廿五': '25th',
    '廿六': '26th', '廿七': '27th', '廿八': '28th', '廿九': '29th', '三十': '30th',
  };

  // 月份映射
  const monthMap: Record<string, string> = {
    '正月': 'Jan', '二月': 'Feb', '三月': 'Mar', '四月': 'Apr', '五月': 'May', '六月': 'Jun',
    '七月': 'Jul', '八月': 'Aug', '九月': 'Sep', '十月': 'Oct', '冬月': 'Nov', '腊月': 'Dec',
  };

  // 检查是否是月份格式（如"正月"）
  if (chineseDate.endsWith('月')) {
    return monthMap[chineseDate] || chineseDate;
  }

  // 返回对应的英文日期
  return numberMap[chineseDate] || chineseDate;
};

export const getLunarDate = (date: Date, language: string = 'zh') => {
  // 设置 lunar-typescript 库的语言
  if (language.startsWith('en')) {
    I18n.setLanguage('en');
  } else {
    I18n.setLanguage('zh');
  }
  
  const lunarDate = Lunar.fromDate(date);

  if (lunarDate.getDay() === 1) {
    const monthChinese = `${lunarDate.getMonthInChinese()}月`;
    if (language.startsWith('en')) {
      return convertLunarDateToEnglish(monthChinese);
    }
    return monthChinese;
  }

  const dayChinese = lunarDate.getDayInChinese();
  if (language.startsWith('en')) {
    return convertLunarDateToEnglish(dayChinese);
  }
  return dayChinese;
};

export const generateDateList = (
  startDate: Date,
  endDate: Date,
  firstDayOfWeek: FirstDayOfWeek
): Date[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const isFirstDayOfWeekSunday = firstDayOfWeek === FirstDayOfWeek.Sunday;
  const isFirstDayOfWeekMonday = firstDayOfWeek === FirstDayOfWeek.Monday;

  let startDayOfWeek = start.getDay();
  let endDayOfWeek = end.getDay();

  // 根据 firstDayOfWeek 调整开始日期和结束日期
  // 如果 firstDayOfWeek 是周一，那么周日的值应该是 7
  if (isFirstDayOfWeekMonday) {
    if (startDayOfWeek === 0) {
      startDayOfWeek = 7;
    }
    if (endDayOfWeek === 0) {
      endDayOfWeek = 7;
    }
  }

  const startDifference = startDayOfWeek - (isFirstDayOfWeekSunday ? 0 : 1);

  start.setDate(start.getDate() - startDifference);

  const endDifference = (isFirstDayOfWeekSunday ? 6 : 7) - endDayOfWeek;

  end.setDate(end.getDate() + endDifference);

  const dateList: Date[] = [];

  // 循环生成日期列表
  while (start <= end) {
    dateList.push(new Date(start));
    start.setDate(start.getDate() + 1);
  }

  return dateList;
};

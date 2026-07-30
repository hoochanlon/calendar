import { HOLIDAY } from '@/configs/holidays';

export interface HolidayData {
  holidays: Map<string, HOLIDAY>;
  restDays: Map<string, HOLIDAY>;
  workdays: Map<string, HOLIDAY>;
}

interface ApiHolidayItem {
  holiday: boolean;
  name: string;
  wage: number;
  date: string;
  rest?: number;
  after?: boolean;
  target?: string;
}

interface HolidayApiResponse {
  holiday?: Record<string, ApiHolidayItem>;
  restDays?: Record<string, ApiHolidayItem>;
  workdays?: Record<string, ApiHolidayItem>;
}

// 使用备用 API 或直接返回 fallback
const HOLIDAY_API_URL = 'https://timor.tech/api/holiday/year';
const CACHE_KEY = 'calendar_holiday_data';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7天

// 从本地存储获取缓存
const getCache = (): { data: HolidayApiResponse; timestamp: number } | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Failed to get holiday cache:', e);
  }
  return null;
};

// 保存到本地存储
const setCache = (data: HolidayApiResponse) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.warn('Failed to set holiday cache:', e);
  }
};

// 映射 API 返回的节日名称到内部 HOLIDAY 枚举
const mapHolidayName = (name: string): HOLIDAY => {
  const mapping: Record<string, HOLIDAY> = {
    '元旦': HOLIDAY.NEW_YEARS_DAY,
    '春节': HOLIDAY.SPRING_FESTIVAL,
    '除夕': HOLIDAY.SPRING_FESTIVAL,
    '初一': HOLIDAY.SPRING_FESTIVAL,
    '初二': HOLIDAY.SPRING_FESTIVAL,
    '初三': HOLIDAY.SPRING_FESTIVAL,
    '初四': HOLIDAY.SPRING_FESTIVAL,
    '初五': HOLIDAY.SPRING_FESTIVAL,
    '初六': HOLIDAY.SPRING_FESTIVAL,
    '初七': HOLIDAY.SPRING_FESTIVAL,
    '清明节': HOLIDAY.TOMB_SWEEPING_DAY,
    '劳动节': HOLIDAY.LABOUR_DAY,
    '端午节': HOLIDAY.DRAGON_BOAT_FESTIVAL,
    '中秋节': HOLIDAY.MID_AUTUMN_FESTIVAL,
    '国庆节': HOLIDAY.NATIONAL_DAY,
  };
  return mapping[name] || HOLIDAY.NEW_YEARS_DAY;
};

// 转换 API 数据为 Map 格式
const convertToMaps = (apiData: HolidayApiResponse): HolidayData => {
  const holidays = new Map<string, HOLIDAY>();
  const restDays = new Map<string, HOLIDAY>();
  const workdays = new Map<string, HOLIDAY>();

  // API 返回的数据格式：{ "MM-DD": { holiday: true, name: "节日名", date: "YYYY-MM-DD", ... } }
  if (apiData.holiday) {
    Object.entries(apiData.holiday).forEach(([_, item]) => {
      if (item.holiday && item.date) {
        const holiday = mapHolidayName(item.name);
        // 法定节假日只记录主要日期
        if (['元旦', '春节', '清明节', '劳动节', '端午节', '中秋节', '国庆节'].includes(item.name)) {
          holidays.set(item.date, holiday);
        }
        // 所有休息日
        restDays.set(item.date, holiday);
      } else if (!item.holiday && item.date) {
        // 调休工作日
        const holiday = item.target ? mapHolidayName(item.target) : mapHolidayName(item.name);
        workdays.set(item.date, holiday);
      }
    });
  }

  return { holidays, restDays, workdays };
};

// 从 API 获取假期数据
const fetchHolidayData = async (year: number): Promise<HolidayApiResponse | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    const response = await fetch(`${HOLIDAY_API_URL}/${year}`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // API 返回格式：{ holiday: { "MM-DD": {...}, ... } }
    // 转换为统一格式
    return { holiday: data.holiday || {} };
  } catch (error) {
    console.warn(`Failed to fetch holiday data for ${year}:`, error);
    return null;
  }
};

// 获取假期数据（带缓存和 fallback）
export const getHolidayData = async (
  fallbackData: HolidayData
): Promise<HolidayData> => {
  // 检查缓存
  const cached = getCache();
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.info('[HolidayService] Using cached holiday data');
    return convertToMaps(cached.data);
  }

  // 获取当前年份和下一年
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  try {
    // 并行获取多年数据
    const results = await Promise.all(
      years.map(year => fetchHolidayData(year))
    );

    // 合并多年数据
    const mergedData: HolidayApiResponse = {
      holiday: {},
    };

    let hasData = false;
    results.forEach(result => {
      if (result && result.holiday) {
        mergedData.holiday = { ...mergedData.holiday, ...result.holiday };
        if (Object.keys(result.holiday).length > 0) {
          hasData = true;
        }
      }
    });

    // 如果成功获取到数据，保存到缓存
    if (hasData) {
      console.info('[HolidayService] Fetched holiday data from API');
      setCache(mergedData);
      return convertToMaps(mergedData);
    }
  } catch (error) {
    console.warn('[HolidayService] Failed to get holiday data from API:', error);
  }

  // 如果 API 失败，返回 fallback 数据
  console.info('[HolidayService] Using fallback holiday data');
  return fallbackData;
};

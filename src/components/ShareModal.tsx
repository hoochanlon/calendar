import { ChevronDown } from '@/assets/icons';
import clsxm from '@/libs/clsxm';
import { downloadFromBase64 } from '@/libs/download';
import { useToPng } from '@hugocxl/react-to-image';
import { useMemo } from 'react';
import Calendar from './Calendar';
import { Checkbox, DatePickerWithRange, Divider } from './ui';
import { useShareModal } from '@/hooks/useShareModal';
import { usePreference } from '@/hooks/usePreference';
import { generateDateList } from '@/libs/date';
import { Day } from '@/interfaces/day';
import { generateDay } from '@/libs/day';
import useSharingSettings from '@/hooks/useSharingSettings';
import { useTranslation } from 'react-i18next';
import { useHoliday } from '@/contexts/HolidayContext';

const ShareModal = () => {
  const { isOpen, closeShareModal } = useShareModal();
  const { t, i18n } = useTranslation();
  const {
    highlightToday,
    setHighlightToday,
    completeWeek,
    setCompleteWeek,
    showHeader,
    setShowHeader,
    showFooter,
    setShowFooter,
    headerText,
    setHeaderText,
    footerText,
    setFooterText,
    showCustomArea,
    setShowCustomArea,
    startDate,
    endDate,
    isFullMonthSelected,
    handleDateChange,
  } = useSharingSettings();
  const {
    preference: { firstDayOfWeek, showDateContent, markWeekend },
  } = usePreference();
  const { holidays, restDays, workdays } = useHoliday();
  const [state, covertToPng, ref] = useToPng<HTMLDivElement>({
    onSuccess: (data) => {
      downloadFromBase64(data, `${headerText} - Calendar Remark.png`);
    },
  });

  const dayList = useMemo<Day[]>(() => {
    if (!startDate || !endDate) return [];

    const dateList = generateDateList(startDate, endDate, firstDayOfWeek);
    const dayList = dateList.map((date) => {
      return generateDay(date, { holidays, restDays, workdays }, [startDate, endDate], i18n.language);
    });
    return dayList;
  }, [startDate, endDate, firstDayOfWeek, holidays, restDays, workdays, i18n.language]);

  const handleSave = () => {
    if (state.status !== 'loading') {
      covertToPng();
    }
  };

  const handleClose = () => {
    closeShareModal();
    setShowCustomArea(false);
  };

  const renderCustomArea = () => {
    return (
      <div
        className={clsxm(
          'relative overflow-hidden transition-all duration-200 rounded-lg text-sm md:text-base',
          // 移动端：可折叠，有外边距
          'px-1 mt-2 mx-2 mb-2 md:m-0 md:px-3 md:py-3',
          showCustomArea && 'bg-blue-50 dark:bg-blue-900/30'
        )}
      >
        {/* 移动端显示折叠按钮，桌面端隐藏 */}
        <div
          className='flex items-center cursor-pointer select-none text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors md:hidden'
          onClick={() => setShowCustomArea(!showCustomArea)}
        >
          <ChevronDown
            className={clsxm(
              'size-6 transition-all duration-200 text-blue-600 dark:text-blue-400',
              showCustomArea && 'rotate-180'
            )}
          />
          <div className='font-semibold'>{t('share.customization')}</div>
        </div>
        
        {/* 桌面端显示标题，不可点击 */}
        <div className='hidden md:block mb-3 text-base font-semibold text-gray-900 dark:text-white'>
          {t('share.customization')}
        </div>
        
        <div
          className={clsxm(
            'transition-all duration-200 flex flex-col justify-center',
            // 移动端：可折叠
            'md:opacity-100 md:visible md:h-auto',
            showCustomArea
              ? 'h-52 opacity-100 visible'
              : 'h-0 opacity-0 invisible md:opacity-100 md:visible'
          )}
        >
          {(showCustomArea || true) && (
            <>
              <Divider direction='horizontal' className='my-2 bg-blue-200 dark:bg-blue-700 md:hidden' />
              <div className='flex flex-col gap-3 py-2 text-gray-900 dark:text-white'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-center gap-2'>
                    <span className='text-nowrap min-w-[4rem]'>{t('share.highlightToday')}</span>
                    <Checkbox
                      checked={highlightToday}
                      onChange={() => setHighlightToday(!highlightToday)}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-nowrap min-w-[4rem]'>{t('share.completeWeek')}</span>
                    <Checkbox
                      checked={completeWeek}
                      onChange={() => setCompleteWeek(!completeWeek)}
                    />
                  </div>
                </div>
                
                {/* 显示头部和显示底部开关并排 */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-center gap-2'>
                    <span className='text-nowrap min-w-[4rem]'>{t('share.showHeader')}</span>
                    <Checkbox
                      checked={showHeader}
                      onChange={() => setShowHeader(!showHeader)}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-nowrap min-w-[4rem]'>{t('share.showFooter')}</span>
                    <Checkbox
                      checked={showFooter}
                      onChange={() => setShowFooter(!showFooter)}
                    />
                  </div>
                </div>
                
                <div className='flex items-center justify-center w-full gap-2'>
                  <span className='text-nowrap'>{t('share.headerContent')}</span>
                  <input
                    type='text'
                    placeholder={t('share.headerPlaceholder')}
                    maxLength={20}
                    value={headerText}
                    className='w-full px-2 py-1 text-sm transition-all duration-200 border border-gray-300 rounded-md dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed'
                    onChange={(e) => setHeaderText(e.target.value)}
                    disabled={!showHeader}
                  />
                </div>
                <div className='flex items-center justify-center w-full gap-2'>
                  <span className='text-nowrap'>{t('share.footerContent')}</span>
                  <input
                    type='text'
                    placeholder={t('share.footerPlaceholder')}
                    maxLength={20}
                    value={footerText}
                    className='w-full px-2 py-1 text-sm transition-all duration-200 border border-gray-300 rounded-md dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed'
                    onChange={(e) => setFooterText(e.target.value)}
                    disabled={!showFooter}
                  />
                </div>
                
                {/* 桌面端：按钮显示在定制化面板底部 */}
                <div className='hidden md:flex md:flex-col md:gap-3 md:mt-4 md:pt-4 md:border-t md:border-blue-200 md:dark:border-blue-700'>
                  <button
                    className='w-full px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-blue-600 rounded-md hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md'
                    onClick={() => handleSave()}
                  >
                    {t('share.download')}
                  </button>
                  <button
                    className='w-full px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-red-500 rounded-md hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md'
                    onClick={handleClose}
                  >
                    {t('common.close')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={clsxm(
        'fixed inset-0 z-20 flex justify-center items-center transition-all duration-300 invisible overflow-y-scroll',
        isOpen ? 'visible bg-black/40' : 'invisible'
      )}
    >
      <div className='absolute w-screen h-full px-2 pt-16 -translate-x-1/2 left-1/2 md:w-fit'>
        <div
          className={clsxm(
            'flex flex-col bg-white rounded-lg shadow-md transition-all duration-300 dark:bg-zinc-600',
            // 桌面端使用横向布局
            'md:flex-row md:max-w-7xl',
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          )}
        >
          {/* 左侧：日历预览区域 */}
          <div className='p-1 md:p-4 md:flex-1'>
            <div className='flex justify-center w-auto py-2'>
              <DatePickerWithRange
                from={startDate}
                to={endDate}
                max={366}
                onChange={handleDateChange}
              />
            </div>
            <div className='h-[50vh] md:h-[70vh] overflow-y-auto scrollbar-track-white dark:scrollbar-track-zinc-700 scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-500 scrollbar-thin scrollbar-thumb-rounded-full'>
              <div ref={ref} className='p-2 bg-white md:p-4 dark:bg-zinc-600'>
                <div className='bg-white dark:bg-zinc-800 w-full md:w-[37.5rem] rounded-lg md:shadow-lg shadow-slate-200 text-sm md:text-base overflow-hidden'>
                  {showHeader && (
                    <div className='w-full px-1 py-2 text-center md:px-2 md:py-4 bg-slate-100 dark:bg-zinc-900/20 dark:text-zinc-200'>
                      {headerText}
                    </div>
                  )}
                  <Calendar
                    isSharing
                    firstDayOfWeek={firstDayOfWeek}
                    showExtraDays={completeWeek}
                    showDateContent={showDateContent}
                    dayList={dayList}
                    highlightToday={highlightToday}
                    dimNonCurrentMonth={isFullMonthSelected}
                    markWeekend={markWeekend}
                  />
                  {showFooter && (
                    <div className='flex items-center justify-center w-full gap-1 px-1 py-2 text-sm md:gap-2 md:px-2 md:py-4 bg-slate-100 dark:bg-zinc-900/20 md:text-base dark:text-zinc-200'>
                      <img
                        src='/favicon.svg'
                        className='w-4 h-4 md:w-6 md:h-6'
                      />
                      <span>{footerText}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 移动端：定制化区域显示在日历下方 */}
            <div className='md:hidden'>
              {renderCustomArea()}
            </div>
          </div>
          
          {/* 桌面端：右侧定制化面板 */}
          <div className='hidden md:block md:w-80 lg:w-96 bg-gray-50 dark:bg-zinc-700 p-4 rounded-r-lg overflow-y-auto'>
            {renderCustomArea()}
          </div>
          
          {/* 底部按钮区 - 仅移动端显示 */}
          <div className='md:hidden'>
            <div className='w-full h-px bg-gray-300 dark:bg-zinc-500'></div>
            <div className='flex justify-end gap-4 px-6 py-4 bg-gray-50 dark:bg-zinc-700'>
              <button
                className='px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-red-500 rounded-md hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md'
                onClick={handleClose}
              >
                {t('common.close')}
              </button>
              <button
                className='px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-blue-600 rounded-md hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md'
                onClick={() => handleSave()}
              >
                {t('share.download')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

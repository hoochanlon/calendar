import clsxm from '@/libs/clsxm';
import { useState, useRef, useEffect } from 'react';

type YearSearchInputProps = {
  value: number;
  onChange: (year: number) => void;
  className?: string;
  minYear?: number;
  maxYear?: number;
};

const YearSearchInput = ({
  value,
  onChange,
  className,
  minYear = 1900,
  maxYear = 2200,
}: YearSearchInputProps) => {
  const [inputValue, setInputValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 同步外部值变化
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 只允许输入数字
    if (/^\d*$/.test(val) && val.length <= 4) {
      setInputValue(val);
    }
  };

  const handleInputBlur = () => {
    const numVal = Number(inputValue);
    if (!isNaN(numVal) && numVal >= minYear && numVal <= maxYear) {
      onChange(numVal);
    } else {
      // 输入错误，跳转到当前年
      const currentYear = new Date().getFullYear();
      onChange(currentYear);
      setInputValue(String(currentYear));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const numVal = Number(inputValue);
      if (!isNaN(numVal) && numVal >= minYear && numVal <= maxYear) {
        onChange(numVal);
        inputRef.current?.blur();
      } else {
        // 输入错误，跳转到当前年
        const currentYear = new Date().getFullYear();
        onChange(currentYear);
        setInputValue(String(currentYear));
        inputRef.current?.blur();
      }
    } else if (e.key === 'Escape') {
      setInputValue(String(value));
      inputRef.current?.blur();
    }
  };

  return (
    <div className={clsxm('relative', className)}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        className='w-16 md:w-20 text-center text-sm md:text-base font-medium px-1.5 md:px-3 py-0.5 md:py-1 transition-colors duration-200 bg-white border border-transparent rounded outline-none dark:bg-zinc-700 dark:text-zinc-100 hover:border-gray-600 dark:hover:border-zinc-400 focus:border-gray-600 dark:focus:border-zinc-400'
        placeholder="年份"
        maxLength={4}
      />
    </div>
  );
};

export default YearSearchInput;

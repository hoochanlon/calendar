import { ChevronDown } from '@/assets/icons';
import clsxm from '@/libs/clsxm';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

type DefaultOptionType = {
  label: React.ReactNode;
  value: string | number | undefined;
};

type DropdownProps<T extends DefaultOptionType> = {
  options: T[];
  value?: T['value'];
  className?: string;
  placeholder?: string;
  editable?: boolean;
  onChange: (item: T) => void;
};

const Dropdown = <T extends DefaultOptionType>({
  options,
  value,
  className,
  placeholder,
  editable = false,
  onChange,
}: DropdownProps<T>) => {
  const [active, setActive] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [inputValue, setInputValue] = useState('');
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef(new Map<T, HTMLSpanElement | null>());
  const currentItem = options.find((item) => item.value === value);

  // 计算下拉菜单位置 - 居中对齐
  const updatePosition = () => {
    if (triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      
      // 获取实际下拉菜单宽度，如果还没渲染则使用估算值
      let dropdownWidth;
      if (listRef.current && listRef.current.offsetWidth > 0) {
        dropdownWidth = listRef.current.offsetWidth;
      } else {
        // 更保守的估算：基于选项内容长度
        const maxOptionLength = Math.max(...options.map(opt => 
          typeof opt.label === 'string' ? opt.label.length : 10
        ));
        dropdownWidth = Math.max(maxOptionLength * 8 + 24, triggerRect.width, 100);
      }
      
      // 计算居中位置：按钮中心 - 下拉菜单宽度的一半
      const centerLeft = triggerRect.left + triggerRect.width / 2 - dropdownWidth / 2;
      
      setPosition({
        top: triggerRect.bottom + window.scrollY + 4, // 添加4px间距
        left: centerLeft + window.scrollX,
        width: triggerRect.width,
      });
    }
  };

  useEffect(() => {
    if (!currentItem) {
      return;
    }
    const currentRef = refs.current.get(currentItem);
    if (currentRef && listRef.current) {
      listRef.current.scrollTo({
        top: currentRef.offsetTop - 4,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    if (active) {
      setShouldRender(true);
      updatePosition();
      // 延迟触发动画，确保位置已设置
      const timer = setTimeout(() => setShowAnimation(true), 10);
      // 再次更新位置，使用实际渲染后的宽度
      const positionTimer = setTimeout(() => updatePosition(), 20);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      return () => {
        clearTimeout(timer);
        clearTimeout(positionTimer);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    } else {
      // 先触发消失动画
      setShowAnimation(false);
      // 延迟隐藏Portal，等待动画完成
      const hideTimer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(hideTimer);
    }
  }, [active]);

  const handleChange = (value: T) => {
    onChange(value);
    setActive(false);
    if (editable) {
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    // 尝试查找匹配的选项
    const numVal = Number(val);
    if (!isNaN(numVal)) {
      const matchedItem = options.find(opt => opt.value === numVal);
      if (matchedItem) {
        onChange(matchedItem);
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const numVal = Number(inputValue);
      if (!isNaN(numVal)) {
        const matchedItem = options.find(opt => opt.value === numVal);
        if (matchedItem) {
          onChange(matchedItem);
          setInputValue('');
          setActive(false);
        }
      }
    } else if (e.key === 'Escape') {
      setInputValue('');
      setActive(false);
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!active) {
      setActive(true);
    }
  };

  const handleToggle = () => {
    if (!active) {
      updatePosition();
    }
    setActive(!active);
  };

  const handleMouseLeave = () => {
    setActive(false);
  };

  return (
    <>
      <div
        className={clsxm('relative', className)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={triggerRef}
          className='flex items-center md:py-1 py-0.5 pl-1.5 pr-0.5 md:pl-3 md:pr-1 transition-colors duration-200 bg-white border border-transparent rounded cursor-pointer dark:bg-zinc-700 dark:text-zinc-100 hover:border-gray-600 dark:hover:border-zinc-400'
          onClick={editable ? undefined : handleToggle}
        >
          {editable ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue || (currentItem ? String(currentItem.label) : '')}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onClick={handleInputClick}
              placeholder={placeholder}
              className='w-full text-sm md:text-base font-medium bg-transparent outline-none dark:text-zinc-100'
            />
          ) : (
            <span className='text-sm md:text-base font-medium'>
              {currentItem ? currentItem.label : placeholder}
            </span>
          )}
          <ChevronDown
            className={clsxm(
              'w-4 h-4 md:w-6 md:h-6 ml-1 text-gray-500 dark:text-zinc-300 transition-transform duration-200',
              active && 'rotate-180'
            )}
          />
        </div>
      </div>
      {shouldRender && createPortal(
        <>
          {/* 透明连接区域，防止鼠标移动时意外隐藏 */}
          <div
            className='fixed z-[9998]'
            style={{
              top: `${position.top - 4}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              height: '4px',
            }}
            onMouseLeave={handleMouseLeave}
          />
          <div
            ref={listRef}
            className={clsxm(
                'fixed z-[9999] flex flex-col w-fit gap-1 p-1 overflow-hidden overflow-y-auto bg-white dark:bg-zinc-800 rounded shadow-lg max-h-60 md:max-h-96 dark:shadow-black/50 scrollbar-track-white dark:scrollbar-track-zinc-700 scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-500 scrollbar-thin scrollbar-thumb-rounded-full transition-all duration-300 ease-out',
                showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              minWidth: `${position.width}px`,
            }}
            onMouseLeave={handleMouseLeave}
          >
          {options.map((option) => (
            <span
              ref={(el) => refs.current.set(option, el)}
              key={option.value}
              className={clsxm(
                'text-zinc-600 dark:text-zinc-300 opacity-80 hover:opacity-100 whitespace-nowrap hover:text-slate-900 dark:hover:text-white inline-block w-full px-3 py-1 text-center border border-transparent rounded cursor-pointer hover:border-gray-600 dark:hover:border-zinc-400 transition-all duration-200 text-sm md:text-base',
                option.value === value &&
                  'bg-slate-200 dark:bg-zinc-600 opacity-100 text-slate-900 dark:text-white font-medium'
              )}
              onClick={() => handleChange(option)}
            >
              {option?.label}
            </span>
          ))}
           </div>
         </>,
         document.body
       )}
     </>
   );
};

export default Dropdown;

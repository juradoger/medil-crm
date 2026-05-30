// Layout de dos paneles lado a lado
import React from 'react';

const WIDTH_MAP = {
  '30': 'lg:w-[30%]',
  '40': 'lg:w-[40%]',
  '50': 'lg:w-1/2',
};

export function SplitScreenLayout({ leftPanel, rightPanel, leftWidth = '40' }) {
  const left  = WIDTH_MAP[leftWidth] ?? WIDTH_MAP['40'];
  const right = leftWidth === '30' ? 'lg:w-[70%]'
              : leftWidth === '40' ? 'lg:w-[60%]'
              : 'lg:w-1/2';

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4">
      <div className={`w-full ${left}`}>{leftPanel}</div>
      <div className={`w-full ${right}`}>{rightPanel}</div>
    </div>
  );
}

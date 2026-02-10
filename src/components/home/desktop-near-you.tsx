"use client";

import React, { useState } from 'react';
import Image from 'next/image';

type NearYouItem = {
  id: string;
  name: string;
  image: string;
};

const nearYouData: NearYouItem[] = [
  { id: 'iit-d', name: 'IIT-D', image: '/IITD.svg' },
  { id: 'du', name: 'DU', image: '/DU.svg' },
  { id: 'ggsiu', name: 'GGSIU', image: '/pears.svg' },
  { id: 'aiims', name: 'AIIMS', image: '/AIIMS.svg' },
  { id: 'dtu', name: 'DTU', image: '/DTU.jpg' },
  { id: 'nit', name: 'NIT-D', image: '/NIT.jpg' },
  { id: 'maharaja', name: 'Maharaja Agarsen', image: '/Maharaj Agarsen.jpg' },
  { id: 'ggsipu', name: 'GGSIPU', image: '/pears.svg' },
  { id: 'iit-delhi', name: 'IIT Delhi', image: '/IITD.svg' },
  { id: 'du-delhi', name: 'DU Delhi', image: '/DU.svg' },
  { id: 'aiims-delhi', name: 'AIIMS Delhi', image: '/AIIMS.svg' },
  { id: 'dtu-delhi', name: 'DTU Delhi', image: '/DTU.jpg' },
  { id: 'nit-delhi', name: 'NIT Delhi', image: '/NIT.jpg' },
  { id: 'maharaja-agarsen', name: 'Maharaja Agarsen', image: '/Maharaj Agarsen.jpg' },
  { id: 'ggsipu-delhi', name: 'GGSIPU Delhi', image: '/pears.svg' },
  { id: 'iit-d-campus', name: 'IIT-D Campus', image: '/IITD.svg' },
  { id: 'du-campus', name: 'DU Campus', image: '/DU.svg' },
  { id: 'ggsiu-campus', name: 'GGSIU Campus', image: '/pears.svg' },
  { id: 'aiims-campus', name: 'AIIMS Campus', image: '/AIIMS.svg' },
  { id: 'dtu-campus', name: 'DTU Campus', image: '/DTU.jpg' },
  { id: 'nit-campus', name: 'NIT Campus', image: '/NIT.jpg' },
  { id: 'maharaja-campus', name: 'Maharaja Campus', image: '/Maharaj Agarsen.jpg' },
  { id: 'ggsipu-campus', name: 'GGSIPU Campus', image: '/pears.svg' },
  { id: 'iit-d-main', name: 'IIT-D Main', image: '/IITD.svg' },
  { id: 'du-main', name: 'DU Main', image: '/DU.svg' },
  { id: 'ggsiu-main', name: 'GGSIU Main', image: '/pears.svg' },
  { id: 'aiims-main', name: 'AIIMS Main', image: '/AIIMS.svg' },
  { id: 'dtu-main', name: 'DTU Main', image: '/DTU.jpg' },
  { id: 'nit-main', name: 'NIT Main', image: '/NIT.jpg' },
  { id: 'maharaja-main', name: 'Maharaja Main', image: '/Maharaj Agarsen.jpg' },
  { id: 'ggsipu-main', name: 'GGSIPU Main', image: '/pears.svg' },
];

export default function DesktopNearYou() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getGridItems = (): React.ReactNode[] => {
    if (!isExpanded) {
      // Collapsed state: 5 items + More button for single column layout
      const items = nearYouData.slice(0, 5).map((item) => (
        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
          {/* Icon */}
          <div 
            className="w-[50px] h-[50px] rounded-[10px] flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ backgroundColor: '#f7f7f7' }}
          >
            <Image
              src={item.image}
              alt={item.name}
              width={50}
              height={50}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Text Label */}
          <span className="text-[13px] font-medium text-black truncate">
            {item.name}
          </span>
        </div>
      ));

      // Add More button
      items.push(
        <button
          key="more-button"
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors mt-2"
        >
          <span className="text-[13px] font-medium text-black">Show More</span>
          <svg
            className="w-4 h-4 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      );

      return items;
    } else {
      // Expanded state: All items in single column with scroll
      const items: React.ReactNode[] = [];
      
      nearYouData.forEach((item, index) => {
        // Add regular item
        items.push(
          <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            {/* Icon */}
            <div 
              className="w-[50px] h-[50px] rounded-[10px] flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ backgroundColor: '#f7f7f7' }}
            >
              <Image
                src={item.image}
                alt={item.name}
                width={50}
                height={50}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Text Label */}
            <span className="text-[13px] font-medium text-black truncate">
              {item.name}
            </span>
          </div>
        );
      });

      // Add Less button at the end
      items.push(
        <button
          key="less-button"
          onClick={() => setIsExpanded(false)}
          className="flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors mt-2 sticky bottom-0 bg-white"
        >
          <span className="text-[13px] font-medium text-black">Show Less</span>
          <svg
            className="w-4 h-4 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      );

      return items;
    }
  };

  return (
    <div className="w-full">
      {/* Title */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-black">
          Near You
        </h3>
      </div>
      
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {/* Items Grid - Single column for sidebar */}
        <div className="flex flex-col gap-3">
          {getGridItems()}
        </div>
      </div>
    </div>
  );
}

'use client';
import { HomePageFilters } from '@/constants/filters';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useSearchParams } from 'next/navigation';
import { formUrlQuery } from '@/lib/utils';
import { useRouter } from 'next/navigation';
const HomeFilters = () => {
  const searchParams = useSearchParams();
  const [active, setActive] = useState('');
  const router = useRouter();

  const handleTypeClick = (item: string) => {
    // if other params due to filtering are present
    if (active === item) {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'filter',
        value: null,
      });

      router.push(newUrl, { scroll: false });
    } else {
      setActive(item);
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'filter',
        value: item.toLowerCase(),
      });

      router.push(newUrl, { scroll: false });
    }
  };
  return (
    <div className="mt-10 hidden flex-wrap gap-3 md:flex">
      {HomePageFilters.map((item) => (
        <Button
          key={item.value}
          onClick={()=>handleTypeClick(item.value)}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none ${
            active === item.value
              ? 'bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400'
              : 'bg-light-800 text-light-500 hover:bg-light-900 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-400'
          }`}
        >
          {item.name}
        </Button>
      ))}
      ;
    </div>
  );
};

export default HomeFilters;

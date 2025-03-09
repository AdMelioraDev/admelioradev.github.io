'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Post } from '@/utils/mdx';

type SeriesNavigationProps = {
  series: {
    name: string;
    posts: Post[];
    currentOrder: number;
    totalCount: number;
  };
  prev: Post | null;
  next: Post | null;
};

export default function SeriesNavigation({ series, prev, next }: SeriesNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!series) return null;
  
  // 현재 진행 상태 계산 (퍼센트)
  const progress = Math.round((series.currentOrder / series.totalCount) * 100);

  return (
    <div className="my-6 border-t border-gray-200 dark:border-gray-800 pt-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <h3 className="text-md font-medium">
            {series.name} 시리즈
          </h3>
          <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
            ({series.currentOrder}/{series.totalCount})
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          {isOpen ? '목록 접기' : '시리즈 목록 보기'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div className="flex flex-col space-y-1 text-sm mb-3 border-t border-gray-200 dark:border-gray-800 pt-3 mt-2">
          {series.posts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className={`py-1 ${
                post.frontMatter.series?.order === series.currentOrder
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {post.frontMatter.series?.order}. {post.frontMatter.title}
            </Link>
          ))}
        </div>
      )}
      
      <div className="flex justify-between text-sm mb-4">
        {prev ? (
          <Link
            href={`/posts/${prev.slug}`}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            이전: {prev.frontMatter.title}
          </Link>
        ) : (
          <div></div>
        )}
        
        {next ? (
          <Link
            href={`/posts/${next.slug}`}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            다음: {next.frontMatter.title}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <div></div>
        )}
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 mt-0" style={{ height: '1px' }}>
        <div 
          className="bg-teal-200 dark:bg-teal-400" 
          style={{ width: `${progress}%`, height: '1px' }}
        ></div>
      </div>
    </div>
  );
}

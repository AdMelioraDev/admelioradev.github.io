"use client";

import React, { useState, useEffect } from "react";

// 터미널 컴포넌트 공통 타입
type TerminalBaseProps = {
  className?: string;
};

// 기본 터미널 컴포넌트 타입
type TerminalProps = TerminalBaseProps & {
  children: React.ReactNode;
  output?: boolean;
  commandToCopy?: string;
};

// 기본 터미널 컴포넌트
const Terminal: React.FC<TerminalProps> = ({
  children,
  output = false,
  className = "",
  commandToCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (commandToCopy) {
      try {
        await navigator.clipboard.writeText(commandToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  // 애니메이션 스타일을 DOM에 추가
  useEffect(() => {
    // 스타일 요소가 이미 존재하는지 확인
    const styleId = 'terminal-animation-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = animationStyles;
      document.head.appendChild(styleEl);
      
      // 컴포넌트 언마운트 시 스타일 제거
      return () => {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  }, []);

  return (
    <div 
      className={`font-mono text-sm rounded-md overflow-hidden mb-4 ${
        output 
          ? "bg-[#1a1b26] text-gray-200 border border-gray-800 dark:bg-[#1a1b26] dark:text-gray-200 dark:border-gray-800" 
          : "bg-[#f6f8fa] text-gray-800 border border-gray-200 dark:bg-[#1a1b26] dark:text-gray-200 dark:border-gray-800"
      } ${className}`}
    >
      <div className={`px-4 py-2 ${
        output 
          ? "bg-[#24283b]" 
          : "bg-[#e9ecef] dark:bg-[#24283b]"
      }`}>
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium">
            &gt;_ Terminal
          </div>
          {!output && commandToCopy && (
            <button 
              onClick={handleCopy}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="명령어 복사"
            >
              <span className="relative inline-block transition-transform duration-200 ease-in-out transform hover:scale-110 active:scale-90">
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 dark:text-green-400 animate-scale-fade" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </span>
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

// 명령어 문자열을 파싱하여 명령어와 인수를 분리하는 함수
const parseCommand = (commandStr: string): React.ReactNode => {
  const parts = commandStr.split(' ');
  if (parts.length === 0) return null;
  
  const command = parts[0];
  const args = parts.slice(1).join(' ');
  
  return (
    <>
      <span className="text-purple-600 dark:text-purple-400 font-semibold">{command}</span>
      {args && <span className="text-green-600 dark:text-green-400"> {args}</span>}
    </>
  );
};

// 여러 명령어와 출력을 하나의 터미널 창에 표시하는 컴포넌트
type CommandOutputPair = {
  command: string;
  output?: string;
};

type TerminalSessionProps = TerminalBaseProps & {
  commands: CommandOutputPair[];
};

export const TerminalSession: React.FC<TerminalSessionProps> = ({ 
  commands, 
  className = ""
}) => {
  const [copied, setCopied] = useState(false);
  
  // 애니메이션 스타일을 DOM에 추가
  useEffect(() => {
    // 스타일 요소가 이미 존재하는지 확인
    const styleId = 'terminal-animation-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = animationStyles;
      document.head.appendChild(styleEl);
      
      // 컴포넌트 언마운트 시 스타일 제거
      return () => {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  }, []);

  const handleCopy = async () => {
    try {
      // 명령어만 추출하여 복사
      const commandsText = commands.map(item => item.command).join('\n');
      await navigator.clipboard.writeText(commandsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className={`font-mono text-sm rounded-md overflow-hidden mb-4 bg-[#f6f8fa] text-gray-800 border border-gray-200 dark:bg-[#1a1b26] dark:text-gray-200 dark:border-gray-800 ${className}`}>
      <div className="px-4 py-2 bg-[#e9ecef] dark:bg-[#24283b]">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium">
            &gt;_ Terminal
          </div>
          <button 
            onClick={handleCopy}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="모든 명령어 복사"
          >
            <span className="relative inline-block transition-transform duration-200 ease-in-out transform hover:scale-110 active:scale-90">
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 dark:text-green-400 animate-scale-fade" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </span>
          </button>
        </div>
      </div>
      
      <div className="p-4 overflow-x-auto">
        {commands.map((item, index) => (
          <React.Fragment key={index}>
            <div className="mb-1">
              {parseCommand(item.command)}
            </div>
            
            {item.output && (
              <div className="mb-4 pl-0 text-gray-500 dark:text-gray-400">{item.output}</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// 애니메이션 키프레임 스타일
const animationStyles = `
  @keyframes scale-fade {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-scale-fade {
    animation: scale-fade 0.5s ease-in-out;
  }
  
  /* 클릭 시 크기 줄어드는 효과 */
  .active\\:scale-90:active {
    transform: scale(0.9);
  }
`;

// 기본 터미널 컴포넌트 내보내기
export default Terminal;

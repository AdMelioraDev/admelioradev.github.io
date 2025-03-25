"use client";

import React, { useState, useMemo } from "react";

type FileNode = {
  name: string;
  type: "file" | "directory";
  description?: string;
  children?: FileNode[];
};

type ProjectExplorerProps = {
  structure: string;
  className?: string;
  title?: string;
  showDescriptions?: boolean;
};

// 간단한 들여쓰기 기반 구조 문자열을 파싱하는 함수
const parseSimpleStructure = (structureStr: string): FileNode => {
  const lines = structureStr.trim().split("\n");
  
  // 루트 폴더 이름 추출
  const rootLine = lines[0].trim();
  const rootParts = rootLine.split(" // ");
  const rootName = rootParts[0].replace(/\/$/, "");
  const rootDescription = rootParts.length > 1 ? rootParts[1].trim() : undefined;
  
  const root: FileNode = {
    name: rootName,
    type: "directory",
    description: rootDescription,
    children: [],
  };
  
  // 현재 파싱 중인 노드의 스택
  const stack: { node: FileNode; level: number }[] = [{ node: root, level: 0 }];
  
  // 첫 번째 줄(루트)을 제외한 나머지 줄 처리
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // 들여쓰기 수준 계산 (공백 2개 = 1 레벨)
    const indentation = line.search(/\S|$/);
    const level = Math.floor(indentation / 2) + 1;
    
    // 파일/폴더 이름과 설명 추출
    const trimmedLine = line.trim();
    const parts = trimmedLine.split(" // ");
    const name = parts[0].trim();
    const description = parts.length > 1 ? parts[1].trim() : undefined;
    
    // 폴더인지 파일인지 판별 (이름 끝에 / 있으면 폴더)
    const isDirectory = name.endsWith("/");
    const cleanName = isDirectory ? name.slice(0, -1) : name;
    
    const newNode: FileNode = {
      name: cleanName,
      type: isDirectory ? "directory" : "file",
      description,
      children: isDirectory ? [] : undefined,
    };
    
    // 적절한 부모 노드 찾기
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    
    const parent = stack[stack.length - 1].node;
    if (parent.children) {
      parent.children.push(newNode);
    }
    
    if (isDirectory) {
      stack.push({ node: newNode, level });
    }
  }
  
  return root;
};

// 파일 아이콘 가져오기
const getFileIcon = () => {
  // 모든 파일 아이콘은 A4 용지처럼 직사각형에 가깝게, 오른쪽 상단이 접힌 모양으로 통일
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 2H9V4C9 4.55228 9.44772 5 10 5H12.5V13C12.5 13.5523 12.0523 14 11.5 14H4.5C3.94772 14 3.5 13.5523 3.5 13V3C3.5 2.44772 3.94772 2 4.5 2Z" stroke="#6B7280" strokeWidth="1" fill="none" />
      <path d="M9 2L12.5 5" stroke="#6B7280" strokeWidth="1" fill="none" />
    </svg>
  );
};

// 폴더 아이콘
const FolderIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M14 4.5V12.5C14 13.0523 13.5523 13.5 13 13.5H3C2.44772 13.5 2 13.0523 2 12.5V3.5C2 2.94772 2.44772 2.5 3 2.5H7L8.5 4H13C13.5523 4 14 4.22386 14 4.5Z" 
      stroke="#757575" 
      strokeWidth="1" 
      fill="none"
    />
  </svg>
);

// 화살표 아이콘 컴포넌트
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    className={`w-3 h-3 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-90' : ''}`}
    viewBox="0 0 16 16" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M6 12L10 8L6 4" />
  </svg>
);

// 메인 프로젝트 구조 컴포넌트
const ProjectExplorer: React.FC<ProjectExplorerProps> = ({ 
  structure, 
  title = "프로젝트 구조",
  showDescriptions = false
}) => {
  const parsedStructure = parseSimpleStructure(structure);
  
  // 파일 노드 렌더링 컴포넌트
  const FileTreeNode = ({ 
    node, 
    level = 0,
    showDescriptions: showDesc
  }: { 
    node: FileNode; 
    level?: number;
    showDescriptions: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(true);
    
    const toggleOpen = () => {
      if (node.type === "directory") {
        setIsOpen(!isOpen);
      }
    };
    
    // 디렉토리 먼저, 파일 나중에 정렬
    const sortedChildren = useMemo(() => node.children ? [...node.children].sort((a, b) => {
      // 디렉토리가 파일보다 먼저 오도록 정렬
      if (a.type === 'directory' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'directory') return 1;
      
      // 같은 타입이면 이름순으로 정렬
      return a.name.localeCompare(b.name);
    }) : [], [node.children]);
    
    // 하위 요소가 있는지 확인
    const hasChildren = useMemo(() => 
      node.type === "directory" && node.children && node.children.length > 0
    , [node.type, node.children]);
    
    return (
      <div className="file-node relative">
        <div 
          className={`flex items-start py-1 relative ${node.type === "directory" ? "cursor-pointer" : ""}`}
          onClick={toggleOpen}
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          {/* 하위 요소가 있는 디렉토리에만 화살표 표시 */}
          <span className="mr-1 w-3 flex-shrink-0 mt-1">
            {hasChildren ? <ChevronIcon isOpen={isOpen} /> : <span className="w-3"></span>}
          </span>
          
          <span className="mr-2 flex-shrink-0 mt-1">
            {node.type === "directory" ? (
              <FolderIcon />
            ) : (
              getFileIcon()
            )}
          </span>
          
          <div className="flex flex-col sm:block">
            <span className={`${node.type === "directory" ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
              {node.name}
            </span>
            
            {/* 모바일에서만 보이는 설명 */}
            {node.description && showDesc && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 break-words sm:hidden">
                <span className="opacity-70">{`// `}</span>{node.description}
              </div>
            )}
          </div>
          
          {/* 데스크톱에서만 보이는 설명 (절대 위치로 고정) */}
          {node.description && showDesc && (
            <div className="hidden sm:block absolute text-xs text-gray-500 dark:text-gray-400 break-words" style={{ left: "16rem" }}>
              <span className="opacity-70">{`// `}</span>{node.description}
            </div>
          )}
        </div>
        
        {node.type === "directory" && isOpen && node.children && (
          <div className="directory-children">
            {sortedChildren.map((child, index) => (
              <FileTreeNode 
                key={`${child.name}-${index}`} 
                node={child} 
                level={level + 1}
                showDescriptions={showDesc}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="mb-6 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 text-sm">
      <div className="px-4 py-2 bg-[#e9ecef] dark:bg-[#1a1b26]">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium">
            {title}
          </div>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-[#24283b]">
        <div className="project-explorer-container">
          <FileTreeNode 
            node={parsedStructure}
            showDescriptions={showDescriptions}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectExplorer;

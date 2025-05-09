"use client";

import React, { useState, useMemo } from "react";

type FileNode = {
  name: string;
  type: "file" | "directory";
  description?: string;
  detailedDescription?: string;
  status?: "added" | "removed";
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
  
  // 상태 표시(@+/@-)가 있는지 확인
  let rootName = rootParts[0].trim();
  let rootStatus: "added" | "removed" | undefined;
  
  if (rootName.includes("@+")) {
    rootName = rootName.replace("@+", "").trim();
    rootStatus = "added";
  } else if (rootName.includes("@-")) {
    rootName = rootName.replace("@-", "").trim();
    rootStatus = "removed";
  }
  
  // 설명과 상세 설명 추출
  let rootDescription: string | undefined;
  let rootDetailedDescription: string | undefined;
  
  if (rootParts.length > 1) {
    const descriptionParts = rootParts[1].split(" ## ");
    rootDescription = descriptionParts[0].trim();
    rootDetailedDescription = descriptionParts.length > 1 ? descriptionParts[1].trim() : undefined;
  }
  
  const root: FileNode = {
    name: rootName,
    type: "directory",
    description: rootDescription,
    detailedDescription: rootDetailedDescription,
    status: rootStatus,
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
    let name = parts[0].trim();
    
    // 상태 표시(@+/@-)가 있는지 확인
    let status: "added" | "removed" | undefined;
    
    if (name.includes("@+")) {
      name = name.replace("@+", "").trim();
      status = "added";
    } else if (name.includes("@-")) {
      name = name.replace("@-", "").trim();
      status = "removed";
    }
    
    // 설명과 상세 설명 추출
    let description: string | undefined;
    let detailedDescription: string | undefined;
    
    if (parts.length > 1) {
      const descriptionParts = parts[1].split(" ## ");
      description = descriptionParts[0].trim();
      detailedDescription = descriptionParts.length > 1 ? descriptionParts[1].trim() : undefined;
    }
    
    // 폴더인지 파일인지 판별 (이름 끝에 / 있으면 폴더)
    const isDirectory = name.endsWith("/");
    const cleanName = isDirectory ? name.slice(0, -1) : name;
    
    const newNode: FileNode = {
      name: cleanName,
      type: isDirectory ? "directory" : "file",
      description,
      detailedDescription,
      status,
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

// 드롭다운 아이콘 컴포넌트
const DropdownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
    viewBox="0 0 16 16" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M2 6L8 12L14 6" />
  </svg>
);

// 상태 표시 아이콘 컴포넌트
const StatusIcon = ({ status, isFile }: { status?: "added" | "removed"; isFile?: boolean }) => {
  if (!status) return null;
  
  return status === "added" ? (
    <span className={`absolute -bottom-1 ${isFile ? 'right-[0.1rem]' : 'right-0'} text-green-600 font-bold text-xs drop-shadow-md`}>
      +
    </span>
  ) : (
    <span className="absolute -bottom-1 right-0 text-red-600 font-bold text-[0.85rem] drop-shadow-md">
      <span className="inline-block transform scale-x-125">-</span>
    </span>
  );
};

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
    const [showDetailedDesc, setShowDetailedDesc] = useState(false);
    
    const toggleOpen = () => {
      if (node.type === "directory") {
        setIsOpen(!isOpen);
      }
    };
    
    const toggleDetailedDesc = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowDetailedDesc(!showDetailedDesc);
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
    
    // 상세 설명이 있는지 확인
    const hasDetailedDesc = node.detailedDescription !== undefined;
    
    return (
      <div className={`file-node relative ${showDetailedDesc ? 'mb-2' : ''}`}>
        <div 
          className={`flex items-start py-1 relative ${node.type === "directory" ? "cursor-pointer" : ""}`}
          onClick={toggleOpen}
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          {/* 하위 요소가 있는 디렉토리에만 화살표 표시 */}
          <span className="mr-1 w-3 flex-shrink-0 mt-1">
            {hasChildren ? <ChevronIcon isOpen={isOpen} /> : <span className="w-3"></span>}
          </span>
          
          <span className="mr-2 flex-shrink-0 mt-1 relative">
            {node.type === "directory" ? (
              <>
                <FolderIcon />
                <StatusIcon status={node.status} />
              </>
            ) : (
              <>
                {getFileIcon()}
                <StatusIcon status={node.status} isFile={true} />
              </>
            )}
          </span>
          
          <div className="flex flex-col sm:block">
            <span className={`${node.type === "directory" ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
              {node.name}
            </span>
            
            {/* 모바일에서만 보이는 설명 */}
            {node.description && showDesc && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 break-words sm:hidden">
                <span className="opacity-70 mr-1">{`//`}</span>{node.description}
                {hasDetailedDesc && (
                  <button 
                    className="ml-1 inline-flex items-center"
                    onClick={toggleDetailedDesc}
                    aria-label={showDetailedDesc ? "접기" : "펼치기"}
                  >
                    <DropdownIcon isOpen={showDetailedDesc} />
                  </button>
                )}
              </div>
            )}
            
            {/* 모바일에서만 보이는 상세 설명. 상세 설명 카드 스타일 배경색은 여기에서 설정한다. */}
            {hasDetailedDesc && showDetailedDesc && showDesc && (
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 mb-1 py-1.5 px-2 bg-gray-100 dark:bg-[#2a3042] rounded-md sm:hidden inline-block">
                {node.detailedDescription}
              </div>
            )}
          </div>
          
          {/* 데스크톱에서만 보이는 설명 (절대 위치로 고정) */}
          {node.description && showDesc && (
            <div className="hidden sm:flex absolute text-xs text-gray-500 dark:text-gray-400 break-words items-center" style={{ left: "16rem" }}>
              <span className="opacity-70 mr-1">{`//`}</span>{node.description}
              {hasDetailedDesc && (
                <button 
                  className="ml-1 inline-flex items-center"
                  onClick={toggleDetailedDesc}
                  aria-label={showDetailedDesc ? "접기" : "펼치기"}
                >
                  <DropdownIcon isOpen={showDetailedDesc} />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* 상세 설명 - 데스크탑. 상세 설명 카드 스타일 배경색은 여기에서 설정한다. */}
        {hasDetailedDesc && showDetailedDesc && showDesc && (
          <div className="hidden sm:block mt-1 mb-3 relative">
            <div className="text-xs text-gray-600 dark:text-gray-300 py-1.5 px-2 bg-gray-100 dark:bg-[#2a3042] rounded-md ml-[16rem] shadow-sm inline-block">
              {node.detailedDescription}
            </div>
          </div>
        )}
        
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
      <div className="px-4 py-2 bg-[#e9ecef] dark:bg-[#24283b]">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
            {title}
          </div>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-[#1a1b26]">
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

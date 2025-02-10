import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  output: 'export',  // 정적 HTML 내보내기 설정
  images: {
    unoptimized: true, // GitHub Pages에서는 이미지 최적화 서버를 실행할 수 없으므로
  },
  // basePath는 일단 제거
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)

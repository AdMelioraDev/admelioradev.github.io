import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'src/content/posts')

export type PostMetadata = {
  title: string
  date: string
  datetime?: string
  description: string
  tags?: string[]
  slug: string
  published?: boolean
  series?: {
    name: string
    order: number
  }
}

export type Post = {
  slug: string
  frontMatter: PostMetadata
  content: string
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  return {
    slug: realSlug,
    frontMatter: {
      title: data.title,
      date: data.date,
      datetime: data.datetime,
      description: data.description,
      tags: data.tags || [],
      slug: realSlug,
      published: data.published !== false, // 기본값은 true
      series: data.series || undefined
    },
    content
  }
}

export function getAllPosts(options = { includeUnpublished: false }): Post[] {
  // 개발 환경에서는 미발행 포스트도 포함
  const isDevelopment = process.env.NODE_ENV === 'development'
  const shouldIncludeUnpublished = isDevelopment || options.includeUnpublished
  
  const slugs = fs.readdirSync(postsDirectory)
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter(post => shouldIncludeUnpublished || post.frontMatter.published !== false)
    .sort((post1, post2) => {
      const date1 = post1.frontMatter.datetime || post1.frontMatter.date;
      const date2 = post2.frontMatter.datetime || post2.frontMatter.date;
      return date1 > date2 ? -1 : 1;
    })
  
  return posts
}

// 시리즈에 속한 포스트들을 가져오는 함수
export function getSeriesPosts(seriesName: string, options = { includeUnpublished: false }): Post[] {
  const allPosts = getAllPosts(options);
  
  // 시리즈에 속한 포스트들만 필터링
  const seriesPosts = allPosts.filter(post => 
    post.frontMatter.series && post.frontMatter.series.name === seriesName
  );
  
  // 시리즈 순서대로 정렬
  return seriesPosts.sort((a, b) => {
    const orderA = a.frontMatter.series?.order || 0;
    const orderB = b.frontMatter.series?.order || 0;
    return orderA - orderB;
  });
}

// 현재 포스트의 이전/다음 포스트 가져오기
export function getSeriesNavigation(currentSlug: string, options = { includeUnpublished: false }) {
  const currentPost = getPostBySlug(currentSlug);
  
  // 시리즈에 속하지 않은 경우 null 반환
  if (!currentPost.frontMatter.series) {
    return { series: null, prev: null, next: null };
  }
  
  const seriesName = currentPost.frontMatter.series.name;
  const currentOrder = currentPost.frontMatter.series.order;
  const seriesPosts = getSeriesPosts(seriesName, options);
  
  // 이전 포스트 찾기
  const prev = seriesPosts.find(post => 
    post.frontMatter.series?.order === currentOrder - 1
  ) || null;
  
  // 다음 포스트 찾기
  const next = seriesPosts.find(post => 
    post.frontMatter.series?.order === currentOrder + 1
  ) || null;
  
  return {
    series: {
      name: seriesName,
      posts: seriesPosts,
      currentOrder,
      totalCount: seriesPosts.length
    },
    prev,
    next
  };
}

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
      published: data.published !== false // 기본값은 true
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

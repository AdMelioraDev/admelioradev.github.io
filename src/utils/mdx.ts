import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'src/content/posts')

export type PostMetadata = {
  title: string
  date: string
  datetime: string
  description: string
  tags: string[]
  slug: string
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  return {
    slug: realSlug,
    frontMatter: {
      ...data,
      tags: data.tags || []
    },
    content
  }
}

export function getAllPosts() {
  const slugs = fs.readdirSync(postsDirectory)
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .sort((post1, post2) => {
      const date1 = post1.frontMatter.datetime || post1.frontMatter.date;
      const date2 = post2.frontMatter.datetime || post2.frontMatter.date;
      return date1 > date2 ? -1 : 1;
    })
  
  return posts
}

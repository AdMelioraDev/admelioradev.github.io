import { getPostBySlug, getAllPosts } from '@/utils/mdx'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function Post({ params }: { params: { slug: string } }) {
  const { frontMatter, content } = getPostBySlug(params.slug)
  
  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <Link href="/" className="text-blue-500 hover:underline mb-8 inline-block">
        ← 목록으로 돌아가기
      </Link>
      
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{frontMatter.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {frontMatter.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {tag}
              </span>
            ))}
          </div>
          <time className="text-gray-500">{frontMatter.date}</time>
        </header>
        
        <div className="prose prose-lg max-w-none">
          <MDXRemote source={content} />
        </div>
      </article>
    </main>
  )
}

import { getAllPosts } from '@/utils/mdx'
import Link from 'next/link'

export default function Home() {
  const posts = getAllPosts()
  
  return (
    <main className="min-h-screen py-12 px-6 max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">AdMelioraDev</h1>
        <p className="text-lg text-gray-600">C++, Go, Rust, 그리고 현대적인 웹 개발에 대한 이야기</p>
      </header>
      
      <div className="grid gap-8">
        {posts.map((post) => (
          <Link href={`/posts/${post.slug}`} key={post.slug}>
            <article className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-all hover:shadow-lg cursor-pointer">
              <h2 className="text-2xl font-bold mb-2">{post.frontMatter.title}</h2>
              <p className="text-gray-600 mb-4">{post.frontMatter.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.frontMatter.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
              <time className="text-sm text-gray-500">
                {post.frontMatter.date}
              </time>
            </article>
          </Link>
        ))}
      </div>
    </main>
  )
}

import { getAllPosts } from '@/utils/mdx'
import Link from 'next/link'

export default function Home() {
  const posts = getAllPosts()
  
  return (
    <main className="min-h-screen py-12 px-6 max-w-4xl mx-auto">
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-4">AdMelioraDev</h1>
        <p className="text-xl text-gray-600">매일 더 나은 개발을 위하여</p>
      </header>
      
      <div className="space-y-12">
        {posts.map((post) => (
          <article key={post.slug} className="group border border-[#333333] rounded-lg p-6">
            <time className="text-sm text-gray-500 mb-2 block">
              {post.frontMatter.date}
            </time>
            <Link href={`/posts/${post.slug}`}>
              <h2 className="text-xl font-bold mb-3 text-[#0070f3] hover:text-white transition-colors cursor-pointer">
                {post.frontMatter.title}
              </h2>
            </Link>
            <p className="text-base text-white mb-4 leading-relaxed opacity-80">
              {post.frontMatter.description}
            </p>
            <Link 
              href={`/posts/${post.slug}`}
              className="inline-flex items-center px-3 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#888888] hover:text-white transition-colors rounded group font-medium text-sm"
            >
              Read More
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}

import { getAllPosts } from '@/utils/mdx'
import Link from 'next/link'

export default function Home() {
  const posts = getAllPosts()
  
  return (
    <main className="min-h-screen py-12 px-6 max-w-7xl mx-auto">
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-4">AdMelioraDev</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">매일 더 나은 개발을 위하여</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.slug} className="group border border-gray-200 dark:border-[#333333] rounded-lg p-6 h-full flex flex-col">
            <time className="text-sm text-gray-500 mb-2 block">
              {post.frontMatter.date}
            </time>
            <Link href={`/posts/${post.slug}`} className="flex-grow">
              <h2 className="text-xl font-bold mb-3 text-[#0070f3] hover:text-blue-700 dark:hover:text-white transition-colors cursor-pointer">
                {post.frontMatter.title}
              </h2>
              <p className="text-sm text-gray-700 dark:text-white mb-4 leading-relaxed">
                {post.frontMatter.description}
              </p>
            </Link>
            <Link 
              href={`/posts/${post.slug}`}
              className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-[#1A1A1A] dark:hover:bg-[#2A2A2A] text-[#888888] hover:text-gray-700 dark:hover:text-white transition-colors rounded group font-medium text-sm"
            >
              Read More
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}

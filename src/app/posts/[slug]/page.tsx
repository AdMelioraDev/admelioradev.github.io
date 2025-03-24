import { getPostBySlug, getAllPosts, getSeriesNavigation } from '@/utils/mdx'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { Metadata } from 'next'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import SeriesNavigation from '@/app/components/SeriesNavigation'
import { TerminalSession } from '@/app/components/Terminal'
import ProjectExplorer from '@/app/components/ProjectExplorer'

dayjs.locale('ko')

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  return {
    title: post.frontMatter.title,
    description: post.frontMatter.description,
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function Post({ params }: PageProps) {
  const resolvedParams = await params
  const { frontMatter, content } = await getPostBySlug(resolvedParams.slug)
  const seriesNavigation = await getSeriesNavigation(resolvedParams.slug, { includeUnpublished: process.env.NODE_ENV === 'development' })
  
  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <Link href="/" className="text-blue-500 hover:underline mb-8 inline-block">
        ← 목록으로 돌아가기
      </Link>
      
      <article>
        <header className="mb-8">
          <time className="text-gray-500 mb-4 block">
            {dayjs(frontMatter.date).format('YYYY년 M월 D일, dddd')}
          </time>
          <h1 className="text-4xl font-bold mb-4">{frontMatter.title}</h1>
          <div className="h-8">
            {frontMatter.tags && Array.isArray(frontMatter.tags) && frontMatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {frontMatter.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>
        
        {seriesNavigation.series && (
          <SeriesNavigation 
            series={seriesNavigation.series} 
            prev={seriesNavigation.prev} 
            next={seriesNavigation.next} 
          />
        )}
        
        {!seriesNavigation.series && (
          <div className="border-t border-gray-200 dark:border-[#333333] mt-4 mb-8">
          </div>
        )}
        
        <div className="prose max-w-none dark:prose-invert">
          <MDXRemote 
            source={content} 
            components={{
              TerminalSession,
              ProjectExplorer
            }} 
          />
        </div>
      </article>
    </main>
  )
}

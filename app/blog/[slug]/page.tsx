import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Hash } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { POSTS, getPost } from '@/lib/posts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Not found' };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    keywords: post.keywords.join(', '),
    author: { '@type': 'Organization', name: 'brocco.dev' },
    publisher: {
      '@type': 'Organization',
      name: 'brocco.dev',
      logo: { '@type': 'ImageObject', url: 'https://brocco-site.vercel.app/icon.png' },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <main>
        <article className="pt-32 pb-16 md:pt-40">
          <div className="container-x max-w-2xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-[12.5px] text-ink-faint hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              All posts
            </Link>

            <p className="mt-6 inline-flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              <span>{post.date}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingMinutes} min
              </span>
            </p>

            <h1 className="mt-3 text-display-lg">
              <span className="text-grad">{post.title}</span>
            </h1>

            <p className="mt-5 text-[17px] leading-relaxed text-ink-dim">{post.intro}</p>

            <p className="mt-6 inline-flex flex-wrap items-center gap-2 text-[12px] text-ink-faint">
              <Hash className="h-3 w-3" />
              {post.keywords.map((k, i) => (
                <span key={k}>
                  {k}
                  {i < post.keywords.length - 1 && ','}
                </span>
              ))}
            </p>

            {/* Outline rendered as a real article-ish skeleton. Long-form prose
                fills in iteratively; today's value is the SEO + structure. */}
            <div className="mt-12 space-y-12">
              {post.outline.map((sec) => (
                <section key={sec.h2}>
                  <h2 className="text-[24px] font-semibold tracking-tight">
                    <span className="font-serif italic font-normal text-grad-brand">{sec.h2}</span>
                  </h2>
                  <p className="mt-3 text-[15.5px] leading-relaxed text-ink-dim">
                    Long-form copy in progress. The outline below is what this section will cover. Open the dashboard to see brocco run the patterns described here.
                  </p>
                  <ul className="mt-4 space-y-2 pl-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
                    {sec.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="mt-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                Try it for yourself
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">
                Run the workflow in this article inside <Link href="/app" className="text-cyan-glow underline-offset-4 hover:underline">/app</Link>. Demo mode runs without a key; bring your Anthropic key for live Claude calls.
              </p>
            </div>
          </div>
        </article>
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

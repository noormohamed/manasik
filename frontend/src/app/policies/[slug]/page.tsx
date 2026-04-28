import { notFound } from 'next/navigation';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import type { Document } from '@contentful/rich-text-types';
import type { Options } from '@contentful/rich-text-react-renderer';
import type { Metadata } from 'next';

import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import PageBannerTitle from '@/components/Common/PageBannerTitle';
import { getPolicyBySlug, getAllPolicySlugs } from '@/lib/contentful';

const styles = `
  .page-banner-area::before {
    display: none !important;
  }
`;

// ---------------------------------------------------------------------------
// ISR cache duration — re-fetches from Contentful after this many seconds.
// Controlled via CONTENTFUL_REVALIDATE_DAYS in .env.local (default: 7 days).
// ---------------------------------------------------------------------------
export const revalidate =
  parseInt(process.env.CONTENTFUL_REVALIDATE_DAYS ?? '7', 10) * 86_400;

// Allow slugs not returned by generateStaticParams to be rendered on-demand.
export const dynamicParams = true;

// ---------------------------------------------------------------------------
// Rich text render options — maps Contentful block/mark nodes to plain HTML
// elements that are already styled by the site's .main-content-text CSS.
// ---------------------------------------------------------------------------
const richTextOptions: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
    [MARKS.UNDERLINE]: (text) => <u>{text}</u>,
    [MARKS.CODE]: (text) => <code>{text}</code>,
  },
  renderNode: {
    [BLOCKS.HEADING_1]: (_node, children) => <h2>{children}</h2>,
    [BLOCKS.HEADING_2]: (_node, children) => <h3>{children}</h3>,
    [BLOCKS.HEADING_3]: (_node, children) => <h3>{children}</h3>,
    [BLOCKS.HEADING_4]: (_node, children) => <h4>{children}</h4>,
    [BLOCKS.PARAGRAPH]: (_node, children) => <p>{children}</p>,
    [BLOCKS.UL_LIST]: (_node, children) => <ul>{children}</ul>,
    [BLOCKS.OL_LIST]: (_node, children) => <ol>{children}</ol>,
    [BLOCKS.LIST_ITEM]: (_node, children) => <li>{children}</li>,
    [BLOCKS.QUOTE]: (_node, children) => <blockquote>{children}</blockquote>,
    [BLOCKS.HR]: () => <hr />,
  },
};

// ---------------------------------------------------------------------------
// Static params — pre-renders all published policy pages at build time.
// Falls back to an empty array (on-demand rendering) if Contentful is
// unreachable during the build.
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  try {
    const slugs = await getAllPolicySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const policy = await getPolicyBySlug(params.slug);
    if (!policy) return { title: 'Not Found | Manasik' };
    return {
      title: `${String(policy.fields.title)} | Manasik`,
    };
  } catch {
    return { title: 'Policy | Manasik' };
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function PolicyPage({ params }: PageProps) {
  const policy = await getPolicyBySlug(params.slug);

  if (!policy) notFound();

  const { title, context } = policy.fields;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Navbar />

      <PageBannerTitle
        title={String(title)}
        homeText="Home"
        homeUrl="/"
        image="/images/page-banner/page-banner-img-1.jpg"
      />

      <div className="ptb-40" style={{ marginLeft: '-180px', marginBottom: '100px' }}>
        <div className="container">
          <div className="main-content-text">
            {context && documentToReactComponents(context as Document, richTextOptions)}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

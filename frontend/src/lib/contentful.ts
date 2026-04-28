import { createClient, EntryFieldTypes, type Entry } from 'contentful';

/**
 * Contentful content type skeleton for "compliance" entries.
 *
 * Required content type setup in Contentful:
 *   Content type ID : compliance
 *   Fields:
 *     slug    – Short text (required, unique)
 *     title   – Short text (required)
 *     context – Rich text  (required)
 */
export type PolicyPageSkeleton = {
  contentTypeId: 'compliance';
  fields: {
    slug: EntryFieldTypes.Symbol;
    title: EntryFieldTypes.Symbol;
    context: EntryFieldTypes.RichText;
  };
};

export type PolicyEntry = Entry<PolicyPageSkeleton>;

// ---------------------------------------------------------------------------
// Client factory — called per-request so env vars are always read at runtime.
// Pass `preview: true` to use the Preview API (returns unpublished drafts).
// ---------------------------------------------------------------------------
function createContentfulClient(preview = false) {
  const space = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const previewToken = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;

  if (!space || !accessToken) {
    throw new Error(
      'Contentful is not configured. ' +
        'Ensure CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN are set in .env.local.'
    );
  }

  if (preview && !previewToken) {
    throw new Error(
      'Contentful preview is not configured. ' +
        'Ensure CONTENTFUL_PREVIEW_ACCESS_TOKEN is set in .env.local.'
    );
  }

  return preview
    ? createClient({ space, accessToken: previewToken!, host: 'preview.contentful.com' })
    : createClient({ space, accessToken });
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetch a single policy entry by its slug field.
 * Returns `null` when no matching entry exists.
 * Pass `preview: true` to fetch unpublished drafts via the Preview API.
 */
export async function getPolicyBySlug(
  slug: string,
  { preview = false }: { preview?: boolean } = {}
): Promise<PolicyEntry | null> {
  const client = createContentfulClient(preview);

  const response = await client.getEntries<PolicyPageSkeleton>({
    content_type: 'compliance',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...({ 'fields.slug': slug } as any),
    limit: 1,
    include: 2,
  });

  return response.items[0] ?? null;
}

/**
 * Fetch all policy slugs.
 * Pass `preview: true` to include unpublished drafts via the Preview API.
 * Used by `generateStaticParams` to pre-render pages at build time.
 */
export async function getAllPolicySlugs(
  { preview = false }: { preview?: boolean } = {}
): Promise<string[]> {
  const client = createContentfulClient(preview);

  const response = await client.getEntries<PolicyPageSkeleton>({
    content_type: 'compliance',
    select: ['fields.slug'] as never,
  });

  return response.items.map((entry) => String(entry.fields.slug));
}

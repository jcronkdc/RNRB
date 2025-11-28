import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { generateBreadcrumbSchema, JsonLd } from '@/lib/seo';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Ensure home is always first
  const allItems = [{ name: 'Home', url: 'https://cronkwaters.com' }, ...items];

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(allItems)} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol
          className="flex items-center gap-2 text-sm"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;

            return (
              <li
                key={item.url}
                className="flex items-center gap-2"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {!isLast ? (
                  <>
                    <Link
                      href={item.url}
                      className="hover:underline"
                      style={{ color: 'var(--muted)' }}
                      itemProp="item"
                    >
                      <span itemProp="name">{item.name}</span>
                    </Link>
                    <meta itemProp="position" content={String(index + 1)} />
                    <ChevronRight
                      className="h-4 w-4"
                      style={{ color: 'var(--muted)' }}
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <>
                    <span style={{ color: 'var(--text)' }} itemProp="name" aria-current="page">
                      {item.name}
                    </span>
                    <meta itemProp="position" content={String(index + 1)} />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

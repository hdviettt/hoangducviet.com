export function createWebSiteSchema(params: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: params.name,
    description: params.description,
    url: params.url,
  };
}

export function createPersonSchema(params: {
  name: string;
  url: string;
  description?: string;
  image?: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: params.name,
    url: params.url,
    ...(params.description && { description: params.description }),
    ...(params.image && { image: params.image }),
    ...(params.sameAs?.length && { sameAs: params.sameAs }),
  };
}

export function createBlogPostingSchema(params: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  authorName: string;
  authorUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: params.title,
    description: params.description,
    url: params.url,
    datePublished: params.datePublished,
    ...(params.dateModified && { dateModified: params.dateModified }),
    ...(params.image && { image: params.image }),
    author: {
      "@type": "Person",
      name: params.authorName,
      url: params.authorUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": params.url,
    },
  };
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

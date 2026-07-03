import {
  IDENTITY,
  ORG_ID,
  PERSON_ID,
  PROFILEPAGE_ID,
  SAME_AS,
  SITE_ORIGIN,
  WEBSITE_ID,
} from "./identity";

// The homepage entity graph — one connected @graph that declares this site as
// the canonical home of the Person entity. WebSite → ProfilePage → Person →
// Organization are cross-linked by @id so crawlers read them as one identity,
// not four loose nodes. This is the piece that makes hoangducviet.com the
// entity home rather than just another page that mentions the name.
export function createEntityGraph(params?: {
  description?: string;
  image?: string;
  dateModified?: string;
}) {
  const description = params?.description || IDENTITY.description;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_ORIGIN,
        name: IDENTITY.name,
        description,
        inLanguage: "en",
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "ProfilePage",
        "@id": PROFILEPAGE_ID,
        url: SITE_ORIGIN,
        name: IDENTITY.name,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": PERSON_ID },
        mainEntity: { "@id": PERSON_ID },
        inLanguage: "en",
        ...(params?.dateModified && { dateModified: params.dateModified }),
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: IDENTITY.name,
        alternateName: IDENTITY.alternateName,
        givenName: IDENTITY.givenName,
        familyName: IDENTITY.familyName,
        url: SITE_ORIGIN,
        ...(params?.image && { image: params.image }),
        email: IDENTITY.email,
        jobTitle: IDENTITY.jobTitle,
        description,
        worksFor: { "@id": ORG_ID },
        knowsAbout: [...IDENTITY.knowsAbout],
        sameAs: SAME_AS,
      },
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: IDENTITY.employer.name,
        url: IDENTITY.employer.url,
      },
    ],
  };
}

// The /about page. A distinct AboutPage that resolves to the SAME #person node
// as the homepage — it corroborates the entity home rather than competing with
// it, and gives AI a clean declarative bio surface to lift.
export function createAboutPageSchema(params?: { description?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_ORIGIN}/about#aboutpage`,
    url: `${SITE_ORIGIN}/about`,
    name: `About — ${IDENTITY.name}`,
    description: params?.description || IDENTITY.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: { "@id": PERSON_ID },
    inLanguage: "en",
  };
}

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
    // Reference the same #person node the homepage defines (not a fresh inline
    // author) so every post corroborates one entity across the whole site.
    author: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: params.authorName,
      url: params.authorUrl,
      sameAs: SAME_AS,
    },
    isPartOf: { "@id": WEBSITE_ID },
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

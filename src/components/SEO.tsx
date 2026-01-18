import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: "website" | "article";
  image?: string;
  article?: {
    author: string;
    publishedTime: string;
    modifiedTime?: string;
    category?: string;
  };
  noIndex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
}

const BASE_URL = "https://peakflow-blog.netlify.app";
const DEFAULT_IMAGE = "/og-image.png";
const SITE_NAME = "PeakFlow";

const SEO = ({
  title,
  description,
  canonical,
  type = "website",
  image,
  article,
  noIndex = false,
  breadcrumbs,
}: SEOProps) => {
  const location = useLocation();
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const fullImage = image?.startsWith("http") ? image : `${BASE_URL}${image || DEFAULT_IMAGE}`;
  const canonicalUrl = canonical || `${BASE_URL}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper to update or create link tag
    const setLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Basic meta tags
    setMeta("description", description);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
    
    // Open Graph tags
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:image", fullImage, true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:locale", "en_US", true);

    // Twitter Card tags
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", fullImage);
    setMeta("twitter:url", canonicalUrl);

    // Article-specific meta tags
    if (type === "article" && article) {
      setMeta("article:author", article.author, true);
      setMeta("article:published_time", article.publishedTime, true);
      if (article.modifiedTime) {
        setMeta("article:modified_time", article.modifiedTime, true);
      }
      if (article.category) {
        setMeta("article:section", article.category, true);
      }
    }

    // Canonical link
    setLink("canonical", canonicalUrl);

    // Clean up JSON-LD on unmount
    return () => {
      const scripts = document.querySelectorAll('script[data-seo]');
      scripts.forEach(script => script.remove());
    };
  }, [fullTitle, description, canonicalUrl, fullImage, type, article, noIndex]);

  // Add JSON-LD structured data
  useEffect(() => {
    // Remove existing SEO scripts
    const existingScripts = document.querySelectorAll('script[data-seo]');
    existingScripts.forEach(script => script.remove());

    const scripts: { type: string; data: Record<string, unknown> }[] = [];

    // Main schema (Article or WebSite)
    if (type === "article" && article) {
      scripts.push({
        type: "article",
        data: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: description,
          image: fullImage,
          author: {
            "@type": "Person",
            name: article.author,
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            logo: {
              "@type": "ImageObject",
              url: `${BASE_URL}/favicon.png`,
            },
          },
          datePublished: article.publishedTime,
          dateModified: article.modifiedTime || article.publishedTime,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
          },
        },
      });
    } else {
      scripts.push({
        type: "website",
        data: {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          description: description,
          url: BASE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${BASE_URL}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            logo: {
              "@type": "ImageObject",
              url: `${BASE_URL}/favicon.png`,
            },
          },
        },
      });
    }

    // Breadcrumb schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      scripts.push({
        type: "breadcrumb",
        data: {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
          })),
        },
      });
    }

    // Organization schema (always include)
    scripts.push({
      type: "organization",
      data: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: BASE_URL,
        logo: `${BASE_URL}/favicon.png`,
        sameAs: [
          "https://twitter.com/peakflow",
        ],
      },
    });

    // Add all scripts to head
    scripts.forEach(({ type, data }) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", type);
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });
  }, [title, description, fullImage, type, article, canonicalUrl, breadcrumbs]);

  return null;
};

export default SEO;

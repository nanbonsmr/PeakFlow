import { useEffect } from "react";

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
}

const BASE_URL = "https://echo-perspective.lovable.app";
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
}: SEOProps) => {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const fullImage = image?.startsWith("http") ? image : `${BASE_URL}${image || DEFAULT_IMAGE}`;
  const canonicalUrl = canonical || (typeof window !== "undefined" ? window.location.href.split("?")[0] : BASE_URL);

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
    setMeta("og:site_name", SITE_NAME, true);

    // Twitter Card tags
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", fullImage);

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
      const existingScript = document.querySelector('script[data-seo="json-ld"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [fullTitle, description, canonicalUrl, fullImage, type, article, noIndex]);

  // Add JSON-LD structured data
  useEffect(() => {
    const existingScript = document.querySelector('script[data-seo="json-ld"]');
    if (existingScript) {
      existingScript.remove();
    }

    let jsonLd: Record<string, unknown>;

    if (type === "article" && article) {
      jsonLd = {
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
      };
    } else {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        description: description,
        url: BASE_URL,
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/favicon.png`,
          },
        },
      };
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo", "json-ld");
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }, [title, description, fullImage, type, article, canonicalUrl]);

  return null;
};

export default SEO;

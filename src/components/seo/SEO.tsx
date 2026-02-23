import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
}

const DEFAULT_TITLE = 'Clarity Studio | Stacks Smart Contract IDE';
const DEFAULT_DESCRIPTION = 'Build, test, and deploy Clarity smart contracts on Stacks (Bitcoin L2) directly in your browser. The fastest development environment for Clarity contracts with real-time validation and deployment.';
const DEFAULT_KEYWORDS = [
  // Primary keywords
  'Clarity',
  'Stacks',
  'Clarity Smart Contracts',
  'Stacks Development',
  'Clarity Studio',
  'Clarity IDE',
  // Secondary keywords
  'Web3 Development',
  'Blockchain Development',
  'Smart Contract IDE',
  'Stacks Blockchain',
  'Stacks Testnet',
  'Bitcoin L2',
  // Long-tail keywords
  'Build Clarity Smart Contracts',
  'Deploy on Stacks',
  'Clarity Contract Development',
  'Clarity Smart Contract Testing',
  'Stacks Development Environment',
  'Stacks Testnet Deployment',
  'Clarity Contract IDE',
  // Related terms
  'Clarinet',
  'SIP-010',
  'SIP-009',
  'Zero Setup Development',
  'Browser-based IDE'
];

const DEFAULT_IMAGE = 'https://claritystudio.app/og-image.png';
const DEFAULT_URL = 'https://claritystudio.app';

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url = DEFAULT_URL,
  type = 'website'
}: SEOProps) {
  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | Clarity Studio`;

  useEffect(() => {
    // Update meta tags
    document.title = fullTitle;
    
    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords.join(', '));

    // OpenGraph meta tags
    updateMetaTag('og:title', fullTitle);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'Clarity Studio - Stacks Smart Contract IDE');

    // Twitter meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@ClarityStudio');

    // Additional meta tags for SEO
    updateMetaTag('application-name', 'Clarity Studio - Stacks Smart Contract IDE');
    updateMetaTag('apple-mobile-web-app-title', 'Clarity Studio');
    updateMetaTag('theme-color', '#000000');
    updateMetaTag('robots', 'index, follow, max-image-preview:large');
    updateMetaTag('googlebot', 'index, follow');
    updateMetaTag('author', 'Clarity Studio');
    updateMetaTag('language', 'English');

    // Mobile meta tags
    updateMetaTag('format-detection', 'telephone=no');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);

    // Add JSON-LD structured data
    addStructuredData({
      title: fullTitle,
      description,
      image,
      url
    });
  }, [fullTitle, description, keywords, image, url, type]);

  return null;
}

function updateMetaTag(name: string, content: string) {
  // Try to find existing meta tag
  let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  
  // Create new meta tag if it doesn't exist
  if (!meta) {
    meta = document.createElement('meta');
    // Use property for og: and twitter: tags, name for others
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }
  
  // Update content
  meta.setAttribute('content', content);
}

function addStructuredData({ 
  title, 
  description, 
  image, 
  url 
}: { 
  title: string; 
  description: string; 
  image: string; 
  url: string; 
}) {
  // Remove any existing structured data
  const existingScript = document.querySelector('#structured-data');
  if (existingScript) {
    existingScript.remove();
  }

  // Create structured data script
  const script = document.createElement('script');
  script.setAttribute('id', 'structured-data');
  script.setAttribute('type', 'application/ld+json');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    description: description,
    image: image,
    url: url,
    applicationCategory: 'DevelopmentApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    author: {
      '@type': 'Organization',
      name: 'Clarity Studio',
      url: 'https://claritystudio.app'
    },
    browserRequirements: 'Requires a modern web browser with JavaScript enabled',
    featureList: [
      'Real-time Clarity validation',
      'Smart contract deployment',
      'Built-in contract interface',
      'Stacks testnet integration',
      'Zero setup required',
      'Browser-based development'
    ],
    keywords: DEFAULT_KEYWORDS.join(', '),
    softwareVersion: '1.0.0'
  };

  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}
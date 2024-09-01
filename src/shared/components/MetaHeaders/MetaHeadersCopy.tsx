import Head from 'next/head';
import { useEffect, useState } from 'react';

export interface IMetadata {
  ogTitle?: string;
  description?: string;
  jsonld?: string;
  sitemapURL?: string;
  canonical?: string;
  keywords?: string;
  type?: 'article' | 'website';
  image?: string;
  video?: {
    url?: string;
    secureUrl?: string;
    type?: string;
  };
  title?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'player'; // Añadir tipo de tarjeta de Twitter
}

export interface IMetaHeadersProps {
  metadata: IMetadata;
}

export const MetaHeaders = ({ metadata }: IMetaHeadersProps) => {
  const [dimensions, setDimensions] = useState<
  { width: string | null, height: string | null }>(
    { width: null, height: null },
  );
  const image = metadata?.image;

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        setDimensions({
          width: img.width?.toString() || '1200',
          height: img.height?.toString() || '630',
        });
      };
      img.onerror = (error) => {
        console.error('Error loading image:', error);
      };
    }
  }, [image]);

  return (
    <Head>
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={metadata?.ogTitle || ''} />
      <meta property="og:description" content={metadata?.description || ''} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={dimensions.width || '1200'} />
      <meta property="og:image:height" content={dimensions.height || '630'} />
      <meta property="og:image:alt" content={metadata?.ogTitle || ''} />
      <meta property="og:video" content={metadata?.video?.url || ''} />
      <meta property="og:video:secure_url" content={metadata?.video?.secureUrl || ''} />
      <meta property="og:video:type" content={metadata?.video?.type || ''} />
      <meta property="og:type" content={metadata?.type || ''} />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={metadata?.twitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={metadata?.title || ''} />
      <meta name="twitter:description" content={metadata?.description || ''} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={metadata?.title || ''} />
      {metadata?.video && (
        <>
          <meta name="twitter:player" content={metadata?.video?.url || ''} />
            {dimensions.width && <meta name="twitter:player:width" content={dimensions.width} />}
            {dimensions.height && <meta name="twitter:player:height" content={dimensions.height} />}
        </>
      )}

      {/* General Meta Tags */}
      <title>{metadata?.title || ''}</title>
      <meta name="description" key="desc" content={metadata?.description || ''} />
      <meta name="keywords" content={metadata?.keywords || ''} />
      <meta charSet="utf-8" />
      <link rel="canonical" href={metadata?.canonical} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata?.jsonld || '',
        }}
      />
    </Head>
  );
};

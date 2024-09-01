import Head from 'next/head';

import { useEffect, useState } from 'react';
import axios from 'axios';

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
}

export interface IMetaHeadersProps {
  metadata: IMetadata;
}

export const MetaHeaders = ({ metadata }: IMetaHeadersProps) => {
  const [dimensions, setDimensions] = useState({ width: null, height: null });
  const image = metadata?.image;

  useEffect(() => {
    const fetchImageDimensions = async () => {
      if (image) {
        try {
          const response = await axios.get(
            `https://api.imagekit.io/v1/files/metadata?url=${encodeURIComponent(image)}`,
            {
              auth: {
                username: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY || '',
                password: '',
              },
            },
          );
          const { width, height } = response.data;
          setDimensions({ width, height });
        } catch (error) {
          console.error('Error fetching image dimensions:', error);
        }
      }
    };
    fetchImageDimensions();
  }, [image]);

  return (
    <Head>
      <meta property="og:title" content={metadata?.ogTitle || ''} />
      <meta property="og:description" content={metadata?.description || ''} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={dimensions.width || ''} />
      <meta property="og:image:height" content={dimensions.height || ''} />
      <meta property="og:image:alt" content={metadata?.ogTitle || ''} />
      <meta property="og:video" content={metadata?.video?.url || ''} />
      {/* TWITTER TAGS */}
      <meta property="twitter:title" content={metadata?.title || ''} />
      <meta property="twitter:description" content={metadata?.description || ''} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:image:alt" content={metadata?.title || ''} />
      <meta property="twitter:video" content={metadata?.video?.url || ''} />
      <meta property="og:video:secure_url" content={metadata?.video?.secureUrl || ''} />
      <meta property="og:video:type" content={metadata?.video?.type || ''} />
      <meta property="og:type" content={metadata?.type || ''} />
      <title>{metadata?.title || ''}</title>
      <meta name="description" key="desc" content={metadata?.description || ''} />
      <meta name="keywords" content={metadata?.keywords || ''} />
      <meta charSet="utf-8" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata?.jsonld || '',
        }}
      />
      <link rel="canonical" href={metadata.canonical} />
    </Head>
  );
};

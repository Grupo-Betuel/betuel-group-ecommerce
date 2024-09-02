import { NextSeo, ProductJsonLd } from 'next-seo';
import { useEffect, useState } from 'react';
import { ProductEntity } from '@shared/entities/ProductEntity';
import { CategoryEntity } from '@shared/entities/CategoryEntity';
import Head from 'next/head';
import { getProductUrl } from '../../../utils/seo.utils';

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
  twitterCard?: 'summary' | 'summary_large_image' | 'player';
  product?: ProductEntity;
  category?: CategoryEntity;
}

export interface IMetaHeadersProps {
  metadata: IMetadata;
}

export const MetaHeaders = ({ metadata }: IMetaHeadersProps) => {
  const [dimensions, setDimensions] = useState<{ width: number | null, height: number | null }>({
    width: null,
    height: null,
  });

  const image = metadata?.image;

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        setDimensions({
          width: img.width || 1200,
          height: img.height || 630,
        });
      };
      img.onerror = (error) => {
        console.error('Error loading image:', error);
      };
    }
  }, [image]);

  return (
    <Head>
      <NextSeo
        title={metadata?.title || 'Producto'}
        description={metadata?.description || 'Default description'}
        canonical={metadata?.canonical}
        openGraph={{
          type: metadata?.type || 'website',
          url: metadata?.canonical,
          title: metadata?.ogTitle || metadata?.title || 'Default OG Title',
          description: metadata?.description || 'Default OG Description',
          images: [
            {
              url: image || 'https://www.example.com/default-image.jpg',
              width: dimensions.width || 1200,
              height: dimensions.height || 630,
              alt: metadata?.ogTitle || 'Default Image Alt Text',
            },
          ],
          videos: (metadata?.video
            ? [
              {
                url: metadata?.video.url,
                secureUrl: metadata?.video.secureUrl,
                type: metadata?.video.type,
                width: dimensions.width || '1200',
                height: dimensions.height || '630',
              },
            ]
            : []) as any,
        }}
        twitter={{
          cardType: metadata?.twitterCard || 'summary',
          // title: metadata?.title || 'Default Twitter Title',
          // description: metadata?.description || 'Default Twitter Description',
          // image: image || 'https://www.example.com/default-image.jpg',
          // imageAlt: metadata?.title || 'Default Twitter Image Alt Text',
          // player: metadata?.video?.url,
          // playerWidth: dimensions.width,
          // playerHeight: dimensions.height,
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: metadata?.keywords || 'default, keywords, here',
          },
        ]}
      />
      {metadata?.product && (
        <ProductJsonLd
          productName={metadata.product.name}
          images={metadata.product.images}
          description={metadata.product.description}
          category={metadata.product.category?.title}
          // brand={metadata.product.brand}
          sku={metadata.product.shortID}
          offers={[
            {
              price: metadata.product.price,
              priceCurrency: 'DOP',
              url: getProductUrl(metadata.product),
              availability: 'https://schema.org/InStock',
            },
          ]}
        />
      )}
    </Head>
  );
};

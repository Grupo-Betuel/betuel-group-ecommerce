import { NextSeo, ProductJsonLd } from 'next-seo';
import { ProductEntity } from '@shared/entities/ProductEntity';
import { CategoryEntity } from '@shared/entities/CategoryEntity';
import { OpenGraphMedia } from 'next-seo/lib/types';
import { getProductUrl } from '../../../utils/seo.utils';

export interface IMetadata {
  ogTitle?: string;
  description?: string;
  jsonld?: string;
  sitemapURL?: string;
  canonical?: string;
  keywords?: string;
  type?: 'article' | 'website';
  image?: OpenGraphMedia;
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

export const MetaHeaders = ({ metadata }: IMetaHeadersProps) => (
  <>
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
            ...(metadata.image || {
              url: 'https://www.grupobetuel.store/images/wallpaper.png',
              width: 1200,
              height: 630,
            }),
            // url: metadata.image?.url || 'https://www.example.com/default-image.jpg',
            // width: metadata.image?.width || 1200,
            // height: dimensions.height || 630,
            alt: metadata?.ogTitle || 'Default Image Alt Text',
          },
        ],
        videos: (metadata?.video
          ? [
            {
              url: metadata?.video.url,
              secureUrl: metadata?.video.secureUrl,
              type: metadata?.video.type,
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
  </>
);

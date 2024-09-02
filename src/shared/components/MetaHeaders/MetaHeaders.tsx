import { NextSeo } from 'next-seo';
import { ProductEntity } from '@shared/entities/ProductEntity';
import { CategoryEntity } from '@shared/entities/CategoryEntity';
import { OpenGraphMedia } from 'next-seo/lib/types';
import Head from 'next/head';

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

const defaultMetadata: IMetadata = {
  image: {
    url: 'https://storage.googleapis.com/betuel-tech-photos/betueldance-wallpaper-1725296548339.png',
    width: 800,
    height: 392,
    alt: 'Grupo Betuel',
  },
  keywords: 'Tienda de Danza, Tecnologia, Ropa de Bebes, Variedades',
  title: 'Grupo Betuel Ecommerce | Tienda Virtual',
  description: 'Toda clase de articulos de danza, electronica, ropa de bebes entre otros',
  type: 'website',
  video: {
    url: '/images/video.mp4',
    secureUrl: '/images/video.mp4',
    type: 'video/mp4',
  },
};

export const MetaHeaders = ({ metadata }: IMetaHeadersProps) => {
  metadata = {
    ...defaultMetadata,
    ...metadata,
  };
  console.log(metadata, 'metadatos');
  return (
    <>
      <NextSeo
        title={metadata?.title || ''}
        description={metadata?.description || ''}
        canonical={metadata?.canonical}
        openGraph={{
          type: metadata?.type || 'website',
          url: metadata?.canonical,
          title: metadata?.ogTitle || metadata?.title || '',
          description: metadata?.description || '',
          images: [
            {
              ...(metadata.image || {} as any),
              alt: metadata?.ogTitle || 'Grupo Betuel',
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
          cardType: metadata?.twitterCard || 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: metadata?.keywords || 'default, keywords, here',
          },
        ]}
      />
      {metadata?.product && (
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: metadata?.jsonld || '',
          }}
        />
      </Head>
      )}
      {/* {metadata?.product && ( */}
      {/* <ProductJsonLd */}
      {/*   productName={metadata.product.name} */}
      {/*   images={metadata.product.images} */}
      {/*   description={metadata.product.description} */}
      {/*   category={metadata.product.category?.title} */}
      {/*     // brand={metadata.product.brand} */}
      {/*   sku={metadata.product.shortID} */}
      {/*   offers={[ */}
      {/*     { */}
      {/*       price: metadata.product.price, */}
      {/*       priceCurrency: 'DOP', */}
      {/*       url: getProductUrl(metadata.product), */}
      {/*       availability: 'https://schema.org/InStock', */}
      {/*     }, */}
      {/*   ]} */}
      {/* /> */}
      {/* )} */}
    </>
  );
};

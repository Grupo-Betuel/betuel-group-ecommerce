import { Company } from 'src/screens/Company';
import { GetStaticPaths, GetStaticProps } from 'next';
// import { handleCachedResourceHook } from '@shared/hooks/handleCachedResourceHook';
import { CompanyEntity } from '@shared/entities/CompanyEntity';
import axios from 'axios';
// import { MetaHeadersNative } from '@components/MetaHeaders/MetaHeadersNative';
import Head from 'next/head';
import { handleCachedCompany } from '../../utils/server-side.utils';
import { saveCompanySitemap } from '../../utils/fs.utils';

export default function CompanyProducts({
  metadata,
  cachedResources,
  productsPerCategory,
}: any) {
  // const { sitemapURL, jsonld, canonical } = handleCachedResourceHook(cachedResources);
  return (
    <>
      {/* <MetaHeadersNative */}
      {/*   metadata={{ */}
      {/*     ...metadata, */}
      {/*     jsonld, */}
      {/*     sitemapURL, */}
      {/*     canonical, */}
      {/*   }} */}
      {/* /> */}
      <Head>
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={metadata?.ogTitle || ''} />
        <meta property="og:description" content={metadata?.description || ''} />
        <meta property="og:image" content={metadata.image || 'https://www.grupobetuel.store/images/wallpaper.png'} />
        {/* <meta property="og:image:width" content={dimensions.width || '1200'} /> */}
        {/* <meta property="og:image:height" content={dimensions.height || '630'} /> */}
        <meta property="og:image:alt" content={metadata?.ogTitle || ''} />
        <meta property="og:video" content={metadata?.video?.url || ''} />
        <meta property="og:video:secure_url" content={metadata?.video?.secureUrl || ''} />
        <meta property="og:video:type" content={metadata?.video?.type || ''} />
        <meta property="og:type" content={metadata?.type || ''} />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content={metadata?.twitterCard || 'summary'} />
        <meta name="twitter:title" content={metadata?.title || ''} />
        <meta name="twitter:description" content={metadata?.description || ''} />
        <meta name="twitter:image" content={metadata.image || ''} />
        <meta name="twitter:image:alt" content={metadata?.title || ''} />
        {metadata?.video && (
        <>
          <meta
            name="twitter:player"
            content={metadata?.video?.url || 'https://www.grupobetuel.store/images/wallpaper.png'}
          />
          {/* {dimensions.width &&
          <meta name="twitter:player:width" content={dimensions.width} />} */}
          {/* {dimensions.height && <meta
      name="twitter:player:height" content={dimensions.height} />}
      */}
        </>
        )}

        {/* General Meta Tags */}
        <title>{metadata?.title || ''}</title>
        <meta name="description" key="desc" content={metadata?.description || ''} />
        <meta name="keywords" content={metadata?.keywords || ''} />
        <meta charSet="utf-8" />
        <link rel="canonical" href={metadata?.canonical} />
        {/* <script */}
        {/*     type="application/ld+json" */}
        {/*     dangerouslySetInnerHTML={{ */}
        {/*       __html: metadata?.jsonld || '', */}
        {/*     }} */}
        {/* /> */}
      </Head>

      <Company
        company={cachedResources?.data}
        productsPerCategoryData={productsPerCategory}
      />
    </>
  );
}

export const getStaticPaths: GetStaticPaths<{ company: string }> = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}api/companies`;
  const companies: CompanyEntity[] = (await axios.get<CompanyEntity[]>(url))
    .data;
  const companyPaths = companies.map((company) => {
    saveCompanySitemap(company);
    return {
      params: {
        company: company.companyId,
      },
    };
  });

  return {
    paths: companyPaths,
    fallback: 'blocking', // Indicates the type of fallback
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const companyName = context.params?.company as string;
  const cachedResources = await handleCachedCompany(companyName);

  const { data: currentCompany, productsPerCategory } = cachedResources;

  const keywords = `${currentCompany?.tags?.join(', ') || ''}`;
  return {
    props: {
      productsPerCategory: productsPerCategory || null,
      cachedResources,
      metadata: {
        keywords,
        title: `${currentCompany?.name} | ${currentCompany?.title}`,
        ogTitle: `${currentCompany?.name} | ${currentCompany?.title}`,
        description: currentCompany?.description || '',
        image: currentCompany?.wallpaper || currentCompany?.logo || '',
        type: 'website',
        video: {
          url: currentCompany?.video || '',
          secureUrl: currentCompany?.video || '',
          type: currentCompany?.video?.includes('mp4')
            ? 'video/mp4'
            : 'video/ogg',
        },
      },
    },
  };
};

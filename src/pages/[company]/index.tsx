import { Company } from 'src/screens/Company';
import { GetStaticPaths, GetStaticProps } from 'next';
import { handleCachedResourceHook } from '@shared/hooks/handleCachedResourceHook';
import { CompanyEntity } from '@shared/entities/CompanyEntity';
import axios from 'axios';
import { MetaHeadersNative } from '@components/MetaHeaders/MetaHeadersNative';
import { handleCachedCompany } from '../../utils/server-side.utils';
import { saveCompanySitemap } from '../../utils/fs.utils';

export default function CompanyProducts({
  metadata,
  cachedResources,
  productsPerCategory,
}: any) {
  const { sitemapURL, jsonld, canonical } = handleCachedResourceHook(cachedResources);
  return (
    <>
      <MetaHeadersNative
        metadata={{
          ...metadata,
          jsonld,
          sitemapURL,
          canonical,
        }}
      />
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
    fallback: true, // Indicates the type of fallback
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

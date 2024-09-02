import { Company } from 'src/screens/Company';
import { GetStaticPaths, GetStaticProps } from 'next';
import { CompanyEntity } from '@shared/entities/CompanyEntity';
import axios from 'axios';
import { IMetadata } from '@components/MetaHeaders/MetaHeaders';
import { ISSGPageProps } from '@interfaces/page.interface';
import { handleCachedCompany } from '../../utils/server-side.utils';
import { saveCompanySitemap } from '../../utils/fs.utils';
import { getImageDimensionsFromUrl } from '../../utils/image.utils';

export default function CompanyProducts({
  cachedResources,
  productsPerCategory,
}: any) {
  return (
    <Company
      company={cachedResources?.data}
      productsPerCategoryData={productsPerCategory}
    />
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
  const imageUrl = currentCompany?.wallpaper || currentCompany?.logo || '';
  const dimensions = await getImageDimensionsFromUrl(imageUrl);
  const image: IMetadata['image'] = {
    ...dimensions,
    url: imageUrl,
  };

  const props: ISSGPageProps = {
    productsPerCategory: productsPerCategory || undefined,
    cachedResources,
    metadata: {
      image,
      keywords,
      title: `${currentCompany?.name} | ${currentCompany?.title}`,
      ogTitle: `${currentCompany?.name} | ${currentCompany?.title}`,
      description: currentCompany?.description || '',
      type: 'website',
      video: {
        url: currentCompany?.video || '',
        secureUrl: currentCompany?.video || '',
        type: currentCompany?.video?.includes('mp4')
          ? 'video/mp4'
          : 'video/ogg',
      },
    },
  };
  return {
    props,
  };
};

import { Category } from '@screens/Category';
import { GetServerSideProps, GetStaticPaths } from 'next';
// import { CompanyEntity } from '@shared/entities/CompanyEntity';
import { IMetadata, MetaHeaders } from '@components/MetaHeaders/MetaHeaders';
// import { CategoryEntity } from '@shared/entities/CategoryEntity';
// import { getCachedResources } from '../../../utils/fs.utils';
import { handleCachedResourceHook } from '@shared/hooks/handleCachedResourceHook';
import { CategoryEntity } from '@shared/entities/CategoryEntity';
import axios from 'axios';
import { handleCachedCategories, handleCachedCompany, ICachedResourceResponse } from '../../../utils/server-side.utils';
import {
  getCategorySitemapFilePath, getCategorySiteMapUrL,
  getProductSiteMapUrL,
  handleSitemapsOnRobotFile,
  saveCategorySitemap,
} from '../../../utils/fs.utils';

export interface ICategoryProductsProps {
  metadata: IMetadata;
  cachedResources: ICachedResourceResponse<CategoryEntity>;
}
export default function CategoryProducts({ metadata, cachedResources }: ICategoryProductsProps) {
  const { sitemapURL, jsonld, canonical } = handleCachedResourceHook(cachedResources);

  return (
    <>
      <MetaHeaders metadata={{
        ...metadata, jsonld, sitemapURL, canonical,
      }}
      />
      <Category />
    </>
  );
}

export const getStaticPaths: GetStaticPaths<{ company: string, category: string }> = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}api/categories`;
  const { data: categorySlugs } = await axios.get<CategoryEntity[]>(url);
  const categoriesSitemaps: string[] = [];

  const categorySlugsPaths = categorySlugs.map((cat) => {
    if (process.env.NODE_ENV === 'production') {
      saveCategorySitemap(cat);
      categoriesSitemaps.push(getCategorySiteMapUrL(cat));
    }

    return ({
      params: {
        category: cat.slug,
        company: cat.company,
      },
    });
  });

  if (process.env.NODE_ENV === 'production') {
    // this will add all product sitemap to robots.txt
    handleSitemapsOnRobotFile(categoriesSitemaps);
  }
  return ({
    paths: categorySlugsPaths, // indicates that no page needs be created at build time
    fallback: true, // indicates the type of fallback
  });
};

export const getStaticProps: GetServerSideProps = async (context) => {
  /// / HANDLING COMPANY DATA
  const companyName = context.params?.company;
  // let currentCompany: CompanyEntity | undefined = await getCachedResources<CompanyEntity>(
  // companyName as string, 'companies');
  //
  // if (currentCompany) {
  //   handleCachedCompany(companyName as string);
  // } else {
  const { data: currentCompany } = await handleCachedCompany(companyName as string);
  // }

  /// / HANDLING PRODUCT DATA
  const categorySlug = context.params?.category as string;
  //
  // let currentCategory?: CategoryEntity | undefined = await getCachedResources<CategoryEntity>(
  // categorySlug as string,
  // 'categories');
  //
  // if (currentCategory?) {
  //   handleCachedCategories(categorySlug as string);
  // } else {
  const cachedResources = await handleCachedCategories(categorySlug as string);
  const currentCategory = cachedResources.data;
  // }
  const keywords = `${currentCategory?.tags?.join(', ') || ''} ${currentCompany?.tags?.join(', ') || ''}`;

  return {
    props: {
      cachedResources,
      metadata: {
        keywords,
        title: `${currentCategory?.title} | ${currentCompany?.name} ${currentCompany?.title}`,
        ogTitle: `${currentCategory?.title} | ${currentCompany?.name} ${currentCompany?.title}`,
        description:
          currentCategory?.description || currentCompany?.description || '',
        image: currentCategory?.wallpaper || currentCompany?.wallpaper || currentCompany?.logo || '',
        type: 'website',
        video: {
          url: currentCategory?.video || currentCompany?.video || '',
          secureUrl: currentCategory?.video || currentCompany?.video || '',
          type: (currentCategory?.video || currentCompany?.video || '').includes('mp4')
            ? 'video/mp4'
            : 'video/ogg',
        },
      },
    } as ICategoryProductsProps,
  };
};

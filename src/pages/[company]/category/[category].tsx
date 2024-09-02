import { Category } from '@screens/Category';
import { GetServerSideProps, GetStaticPaths } from 'next';
import { CategoryEntity } from '@shared/entities/CategoryEntity';
import axios from 'axios';
import { IMetadataNative } from '@components/MetaHeaders/MetaHeadersNative';
import { IMetadata } from '@components/MetaHeaders/MetaHeaders';
import { ISSGPageProps } from '@interfaces/page.interface';
import { handleCachedCategories, handleCachedCompany, ICachedResourceResponse } from '../../../utils/server-side.utils';
import {
  getCategorySiteMapUrL,
  handleSitemapsOnRobotFile,
  saveCategorySitemap,
} from '../../../utils/fs.utils';
import { getImageDimensionsFromUrl } from '../../../utils/image.utils';

export interface ICategoryProductsProps {
  metadata: IMetadataNative;
  cachedResources: ICachedResourceResponse<CategoryEntity>;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CategoryProducts(_props: ICategoryProductsProps) {
  return (
    <Category />
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
  const imageUrl = currentCategory?.wallpaper || currentCompany?.wallpaper || currentCompany?.logo || '';
  const dimensions = await getImageDimensionsFromUrl(imageUrl);
  const image: IMetadata['image'] = {
    ...dimensions,
    url: imageUrl,
  };

  const props: ISSGPageProps = {
    cachedResources,
    metadata: {
      image,
      keywords,
      title: `${currentCategory?.title} | ${currentCompany?.name} ${currentCompany?.title}`,
      ogTitle: `${currentCategory?.title} | ${currentCompany?.name} ${currentCompany?.title}`,
      description:
          currentCategory?.description || currentCompany?.description || '',
      type: 'website',
      video: {
        url: currentCategory?.video || currentCompany?.video || '',
        secureUrl: currentCategory?.video || currentCompany?.video || '',
        type: (currentCategory?.video || currentCompany?.video || '').includes('mp4')
          ? 'video/mp4'
          : 'video/ogg',
      },
    },
  };

  return {
    props,
  };
};

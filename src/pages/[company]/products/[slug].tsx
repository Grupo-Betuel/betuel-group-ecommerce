import { DetailView } from '@components/DetailView';
import { GetStaticPaths, GetStaticProps } from 'next';
import { CompanyEntity } from '@shared/entities/CompanyEntity';
import { IMetadata, MetaHeaders } from '@components/MetaHeaders/MetaHeaders';
import { ProductEntity } from '@shared/entities/ProductEntity';
import { handleCachedResourceHook } from '@shared/hooks/handleCachedResourceHook';
import axios from 'axios';
import sizeOf from 'image-size';
import {
  handleCachedCompany,
  handleCachedProduct,
  ICachedResourceResponse,
} from '../../../utils/server-side.utils';
import {
  getProductSiteMapUrL,
  handleSitemapsOnRobotFile,
  saveProductSitemap,
} from '../../../utils/fs.utils';
import { generateProductDescriptionFromParams } from '../../../utils/params.utils';

export interface IProductDetailsProps {
  metadata: IMetadata;
  currentCompany?: CompanyEntity;
  cachedResources: ICachedResourceResponse<ProductEntity>;
}

export default function ProductDetail({
  metadata,
  currentCompany,
  cachedResources,
}: IProductDetailsProps) {
  const { sitemapURL, jsonld, canonical } = handleCachedResourceHook(cachedResources);
  return (
    <div>
      <MetaHeaders
        metadata={{
          ...metadata,
          jsonld,
          sitemapURL,
          canonical,
        }}
      />
      <DetailView
        companyLogo={currentCompany?.logo}
        productDetails={cachedResources?.data}
        forceLoadProduct
      />
    </div>
  );
}
export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  const companyUrl = `${process.env.NEXT_PUBLIC_API_URL}api/companies`;
  const companies: CompanyEntity[] = (
    await axios.get<CompanyEntity[]>(companyUrl)
  ).data;
  let allProductSlugs: any[] = [];
  const productSitemaps: string[] = [];
  await Promise.all(
    companies.map(async (company) => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}api/products/slugs/${company.companyId}`;
      const { data: productSlugs } = await axios.get<ProductEntity[]>(url);
      const productSlugsPaths = productSlugs.map((product) => {
        if (process.env.NODE_ENV === 'production') {
          saveProductSitemap(product);
          productSitemaps.push(getProductSiteMapUrL(product));
        }

        return {
          params: {
            slug: product.slug,
            company: company.companyId,
          },
        };
      });

      if (process.env.NODE_ENV === 'production') {
        handleSitemapsOnRobotFile(productSitemaps);
      }

      allProductSlugs = [...allProductSlugs, ...productSlugsPaths];
    }),
  );
  return {
    paths: allProductSlugs, // indicates that no page needs be created at build time
    fallback: 'blocking', // indicates the type of fallback
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  try {
    /// / HANDLING PRODUCT DATA
    const productSlug = context.params?.slug as string;
    // let product: ProductEntity | undefined = await getCachedResources<ProductEntity>(
    // productSlug as string,
    // 'products');
    //
    // if (product) {
    //   handleCachedProduct(productSlug as string);
    // } else {
    const cachedProductResource = await handleCachedProduct(
      productSlug as string,
    );
    const product = cachedProductResource.data;
    // }

    /// / HANDLING COMPANY DATA
    const companyName = context.params?.company;
    // let currentCompany: CompanyEntity | undefined = await getCachedResources<CompanyEntity>(
    // companyName as string,
    // 'companies');

    // if (currentCompany) {
    //   handleCachedCompany(companyName as string);
    // } else {

    const cachedCompanyResource = await handleCachedCompany(
      companyName as string,
    );
    const { data: currentCompany } = cachedCompanyResource;
    // }

    const keywords = `${product?.tags?.join(', ') || ''} ${
      currentCompany?.tags?.join(', ') || ''
    }`;
    const description = `${product?.description || ''} ${
      product?.productParams
        ? `\n${generateProductDescriptionFromParams(product?.productParams)}\n`
        : ''
    }${currentCompany?.description || ''}`;
    const imageUrl = product?.image || currentCompany?.logo || '';
    const dimensions = await getImageDimensions(imageUrl);
    const image: IMetadata['image'] = {
      ...dimensions,
      url: imageUrl,

    };
    const props: IProductDetailsProps = {
      currentCompany,
      cachedResources: cachedProductResource,
      metadata: {
        product,
        keywords,
        title: `${product?.name} RD$${product?.price.toLocaleString()}${
          product?.category?.title ? ` | ${product?.category?.title}` : ''
        } | ${currentCompany?.title} ${currentCompany?.name}`,
        ogTitle: `${product?.name} RD$${product?.price.toLocaleString()} | ${
          product?.category?.title || currentCompany?.title
        }`,
        description,
        image,
        type: 'article',
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
      revalidate: 60,
      props,
    };
  } catch (error) {
    console.log('error while getting product products', error);
    throw error;
  }
};

const getImageDimensions = async (url: string) => {
  try {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const dimensions = sizeOf(data);
    return {
      width: dimensions.width || 1200,
      height: dimensions.height || 630,
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return {
      width: 1200,
      height: 630,
    };
  }
};

import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import { handleEntityHook } from '@shared/hooks/handleEntityHook';
import { IProductPerCategory } from '@shared/entities/ProductEntity';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { EndpointsAndEntityStateKeys } from '@shared/enums/endpoints.enum';
import { CompanyEntity } from '@shared/entities/CompanyEntity';
import { showProductDetailsHook } from '@shared/hooks/showProductDetailsHook';
import { useInfiniteScroll } from '@shared/hooks/useInfiniteScrollHook';
import { useImageCache } from '@shared/contexts/ImageCacheContext';
import styles from './Company.module.scss';

const DynamicScrollView = dynamic(
  () => import('@shared/components').then((mod) => mod.ScrollView),
  { ssr: false },
);

export interface CompanyProps {
  company?: CompanyEntity;
  productsPerCategoryData?: IProductPerCategory[];
}

export function Company({ company, productsPerCategoryData }: CompanyProps) {
  const router = useRouter();
  const { cacheImage } = useImageCache();
  const avoidInitialLoad = useMemo(
    () => !!productsPerCategoryData,
    [productsPerCategoryData],
  );

  const [companyName, setCompanyName] = useState<string>(
    (router.query.company || '') as string,
  );
  const [companyProducts, setCompanyProducts] = useState<IProductPerCategory[]>(
    productsPerCategoryData || [],
  );

  const {
    get: getCompany,
    [EndpointsAndEntityStateKeys.BY_REF_ID]: currentCompanyRes,
  } = handleEntityHook<CompanyEntity>('companies');
  const { goToProductDetail, ProductDetail } = showProductDetailsHook();

  const {
    infinityScrollData,
    loadMoreCallback,
    isLastPage,
    loading: loadingProducts,
  } = useInfiniteScroll<IProductPerCategory>('products', !avoidInitialLoad, {
    endpoint: EndpointsAndEntityStateKeys.PER_CATEGORY,
    slug: companyName,
    queryParams: {
      limit: 2,
      page: avoidInitialLoad ? 2 : 1,
    },
  });

  console.log('is last', isLastPage);
  const currentCompany: CompanyEntity = useMemo(
    () => currentCompanyRes?.data[0] || company || ({} as CompanyEntity),
    [currentCompanyRes?.data, company],
  );

  useEffect(() => {
    if (!companyName || company?._id) return;
    getCompany({
      endpoint: EndpointsAndEntityStateKeys.BY_REF_ID,
      slug: companyName,
    });
  }, [companyName, company]);

  useEffect(() => {
    const company = router.query.company as string;
    if (
      company
      && company !== companyName
      && !productsPerCategoryData?.length
    ) {
      setCompanyName(company);
    }
  }, [router.query]);

  useEffect(() => {
    if (infinityScrollData?.data?.length || productsPerCategoryData?.length) {
      const data = [
        ...(productsPerCategoryData || []),
        ...(infinityScrollData?.data || []),
      ].reduce<IProductPerCategory[]>((acc, item) => {
        const index = acc.findIndex(
          (i) => i.category._id === item.category._id,
        );
        if (index === -1) {
          acc.push(item);
        } else {
          // acc[index].products = [...acc[index].products, ...item.products];
        }
        return acc;
      }, []);
      setCompanyProducts(
        [...data],
      );
    }
  }, [infinityScrollData?.data]);

  useEffect(() => {
    if (currentCompany?.logo) {
      const fav = document.querySelector('link[rel="icon"]');
      fav?.setAttribute('href', currentCompany?.logo || '');
    }
  }, [currentCompany?.logo]);

  useEffect(() => {
    // Caching product images
    companyProducts.forEach((category) => {
      category.products.forEach((product) => {
        cacheImage(product.image);
      });
    });
  }, [companyProducts]);

  return (
    <>
      {loadingProducts && (
        <div className="loading">
          <Spin size="large" />
        </div>
      )}
      <div className={styles.CompanyWrapper}>
        {ProductDetail}
        <div className={styles.CompanyContent}>
          {companyProducts && (
            <div className={styles.CompanyContentProducts}>
              {companyProducts.map((categoryData, i) => {
                const category = categoryData.category;
                const categoryStock = categoryData.products.reduce(
                  (acc, product) => acc + product.stock,
                  0,
                );

                if (categoryStock <= 0 || categoryData.products.length <= 0) return null;

                return (
                  <DynamicScrollView
                    key={`scroll-view-category-${i}`}
                    wrapperClassName={
                      styles.CompanyContentProductsScrollViewCategories
                    }
                    seeMoreRoute={`/${category.company}/category/${category.slug}`}
                    handleProductClick={goToProductDetail}
                    products={categoryData.products}
                    title={category.title}
                  />
                );
              })}
              {/* <h2 className="mb-xx-l title">Todos los Productos</h2> */}
              {/* <div className={styles.CompanyCardsGrid}> */}
              {/*  {companyProducts.map((item, i) => ( */}
              {/*    <DynamicProductCard */}
              {/*      key={`product-${i}`} */}
              {/*      onClick={goToProductDetail} */}
              {/*      product={item} */}
              {/*    /> */}
              {/*  ))} */}
              {/* </div> */}
              {(!loadingProducts) && (
                <div className="flex-center-center p-l">
                  {isLastPage ? (
                    <h2>No hay más productos</h2>
                  ) : (
                    <h2 ref={loadMoreCallback}>Cargando Productos...</h2>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

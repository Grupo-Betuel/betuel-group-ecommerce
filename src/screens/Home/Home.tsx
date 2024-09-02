import { handleEntityHook } from '@shared/hooks/handleEntityHook';
import { ProductEntity } from '@shared/entities/ProductEntity';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { CompanyEntity } from '@shared/entities/CompanyEntity';
import { useInfiniteScroll } from '@shared/hooks/useInfiniteScrollHook';
import { EndpointsAndEntityStateKeys } from '@shared/enums/endpoints.enum';
import { AppLoadingContext } from '@shared/contexts/AppLoadingContext';
import { showProductDetailsHook } from '@shared/hooks/showProductDetailsHook';
import dynamic from 'next/dynamic';
import { useImageCache } from '@shared/contexts/ImageCacheContext';
import styles from './Home.module.scss';

const DynamicScrollView = dynamic(() => import('@shared/components').then((mod) => mod.ScrollView), { ssr: false });
const DynamicProductCard = dynamic(() => import('@shared/components').then((mod) => mod.ProductCard), { ssr: false });

export interface HomeProps {
  hideCarousel?: boolean;
}

export function Home({}: HomeProps) {
  const [products, setProducts] = useState<ProductEntity[]>([]);
  const { setAppLoading, appLoading } = useContext(AppLoadingContext);
  const {
    get: getCompanies,
    loading: loadingCompany,
    fetching: fetchingCompany,
    [EndpointsAndEntityStateKeys.PRODUCT_SAMPLES]: productsPerCompanies,
  } = handleEntityHook<CompanyEntity>('companies');

  useEffect(() => {
    getCompanies({
      endpoint: EndpointsAndEntityStateKeys.PRODUCT_SAMPLES,
    });
  }, []);

  const {
    infinityScrollData,
    loadMoreCallback,
    isLastPage,
    fetching: fetchingProducts,
    loading: loadingProducts,
  } = useInfiniteScroll<ProductEntity>('products', false);
  const { goToProductDetail, ProductDetail } = showProductDetailsHook();

  const companyIds = useMemo(
    () => (!productsPerCompanies?.data?.length
      ? Object.keys((productsPerCompanies?.data as any) || {})
      : []),
    [productsPerCompanies?.data],
  );

  useEffect(() => {
    let maxQuantity = infinityScrollData?.data?.length;
    if (infinityScrollData?.pagination) {
      const pagination = infinityScrollData.pagination;
      maxQuantity = pagination.page * pagination.perPage;
    }

    setProducts((infinityScrollData?.data || []).slice(0, maxQuantity));
  }, [infinityScrollData?.data]);

  useEffect(() => {
    let loading = fetchingProducts || loadingCompany;
    if (!products.length && fetchingProducts) {
      loading = loading || fetchingProducts;
    }
    if (!productsPerCompanies?.data && fetchingCompany) {
      loading = loading || fetchingCompany;
    }

    if (!companyIds?.length) {
      loading = true;
    }

    setAppLoading(!!loading);
  }, [
    loadingProducts,
    fetchingProducts,
    fetchingCompany,
    loadingCompany,
    companyIds,
  ]);

  const { cacheImage } = useImageCache();

  useEffect(() => {
    products.forEach((product) => {
      cacheImage(product.image);
    });
  }, [products, cacheImage]);

  useEffect(() => {
    productsPerCompanies?.data
      && Object.values(productsPerCompanies.data).forEach((company: any) => {
        company?.products?.forEach((product: ProductEntity) => {
          cacheImage(product.image);
        });
      });
  }, [productsPerCompanies?.data]);

  return (
    <div className={styles.HomeWrapper}>
      {ProductDetail}
      <div className={styles.HomeContent}>
        {companyIds.length > 0 && (
          <div className={styles.HomeContentProducts}>
            {companyIds.map((companyId: any, index: number) => {
              const companyProds = (productsPerCompanies as any)?.data[
                companyId
              ];
              return (
                <DynamicScrollView
                  wrapperClassName={
                    styles.HomeContentProductsScrollViewCategories
                  }
                  seeMoreRoute={`/${companyId}`}
                  handleProductClick={goToProductDetail}
                  products={companyProds.products}
                  title={companyProds.title}
                  key={`company-${index}`}
                />
              );
            })}
            <h2 className="mb-xx-l title">Todos los Productos</h2>
            <div className={styles.HomeCardsGrid}>
              {products?.map((item, i) => (
                <DynamicProductCard
                  key={`product-${i}`}
                  onClick={goToProductDetail}
                  product={item}
                />
              ))}
            </div>
            {!appLoading && (
              <div className="flex-center-center p-l">
                {isLastPage ? (
                  <h2>No hay mas productos</h2>
                ) : (
                  <h2 ref={loadMoreCallback}>Cargando Productos...</h2>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

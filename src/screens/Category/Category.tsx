import React, {
  useEffect, useState, ChangeEvent, useContext,
} from 'react';
import { useRouter } from 'next/router';
import { Affix, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { handleEntityHook } from '@shared/hooks/handleEntityHook';
import { ProductEntity } from '@shared/entities/ProductEntity';
import { EndpointsAndEntityStateKeys } from '@shared/enums/endpoints.enum';
import { showProductDetailsHook } from '@shared/hooks/showProductDetailsHook';
import { useImageCache } from '@shared/contexts/ImageCacheContext';
import { AppLoadingContext } from '@shared/contexts/AppLoadingContext';
import { layoutId, navbarOptionsHeight, topbarOptionsHeight } from '../../utils/layout.utils';
import styles from './Category.module.scss';

const DynamicProductCard = dynamic(
  () => import('@shared/components').then((mod) => mod.ProductCard),
  { ssr: false },
);

export function Category() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>();
  const [categoryProducts, setCategoryProducts] = useState<ProductEntity[]>([]);
  const { loading, get: getProducts, [EndpointsAndEntityStateKeys.BY_CATEGORY]: categoryProductsData } = handleEntityHook<ProductEntity>('products');
  const { goToProductDetail, ProductDetail } = showProductDetailsHook();
  const { cacheImage } = useImageCache();

  useEffect(() => {
    const category = router.query.category as string;
    if (category) {
      getProducts({
        endpoint: EndpointsAndEntityStateKeys.BY_CATEGORY,
        slug: category,
      });
    }
  }, [router.query]);

  useEffect(() => {
    const products = categoryProductsData?.data || [];
    setCategoryProducts(products);
    products.forEach((product) => {
      cacheImage(product.image); // Preload product images
    });
  }, [categoryProductsData?.data]);

  const onSearch = async ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const deepMatch = (await import('../../utils/matching.util')).deepMatch;
    setSearchValue(value);
    const results = deepMatch<ProductEntity>(value, categoryProductsData?.data || []);
    setCategoryProducts([...results]);
  };
  const { setAppLoading } = useContext(AppLoadingContext);

  useEffect(() => {
    const val = (loading || (!categoryProducts.length && !searchValue));
    setAppLoading(val);
  }, [loading, categoryProducts.length, searchValue]);

  return (
    <>
      <div className={styles.CategoryWrapper}>
        {ProductDetail}
        <div className={styles.CategoryContent}>
          <Affix
            className={styles.SidebarAffix}
            offsetTop={navbarOptionsHeight + topbarOptionsHeight}
            target={() => document.getElementById(layoutId)}
          >
            <div>
              <div className={styles.CategorySearchWrapper}>
                <Input
                  value={searchValue}
                  className={styles.CategoryInputSearch}
                  placeholder="Buscar"
                  suffix={<SearchOutlined rev="" className="site-form-item-icon" />}
                  bordered={false}
                  onChange={onSearch}
                  size="large"
                />
              </div>
              {!categoryProducts?.length && (
                <h2 className="p-xx-l">No hay resultados!</h2>
              )}
            </div>
          </Affix>
          {categoryProducts.length > 0 && (
            <div className={styles.CategoryContentProducts}>
              <h1 className="mb-xx-l title">{categoryProducts[0].category.title}</h1>
              <div className={styles.CategoryCardsGrid}>
                {categoryProducts.map((item, i) => (
                  <DynamicProductCard
                    key={`product-${i}`}
                    onClick={goToProductDetail}
                    product={item}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

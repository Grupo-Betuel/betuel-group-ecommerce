import {
  Avatar,
  Button,
  Form,
  Input,
  InputNumber,
  List, Modal,
  Space,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined, DeleteOutlined, ExclamationCircleFilled,
  LikeOutlined,
  MessageOutlined,
  ShoppingOutlined,
  StarOutlined,
  UploadOutlined, WhatsAppOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import React, {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { handleEntityHook } from '@shared/hooks/handleEntityHook';
import { Resizable } from 're-resizable';
import { StickyFooter } from '@shared/layout/components/StickyFooter/StickyFooter';
import { useContextualRouting } from 'next-use-contextual-routing';
import { EndpointsAndEntityStateKeys } from '@shared/enums/endpoints.enum';
import { ImageBackground } from '@components/DetailView/components/ImageBackground/ImageBackground';
import {
  IProductParam,
  IProductSaleParam,
  ProductEntity,
} from '@shared/entities/ProductEntity';
import { ISale } from '@shared/entities/OrderEntity';
import { structuredClone } from 'next/dist/compiled/@edge-runtime/primitives/structured-clone';
import { useOrderContext } from '@shared/contexts/OrderContext';
import { useAppStore } from '@services/store';
import { ProductsConstants } from '@shared/constants/products.constants';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { sidebarWidth } from '../../../utils/layout.utils';
import styles from './DetailView.module.scss';
import { getSaleDataFromProduct } from '../../../utils/objects.utils';
import { contactUsByWhatsappLink } from '../../../utils/url.utils';
import { orderMessageTexts } from '../../../utils/constants/order.constant';
import ProductOptionHandler from './components/ProductOptionHandler/ProductOptionHandler';

const { confirm } = Modal;

export interface IDetailViewProps {
  productDetails?: any;
  selectedPost?: any;
  returnHref?: string;
  productId?: string;
  companyLogo?: string;
  forceLoadProduct?: boolean;
  goBack?: () => void;
}

function IconText({ icon, text }: { icon: any; text: string }) {
  return (
    <Space>
      {createElement(icon)}
      {text}
    </Space>
  );
}

const data = Array.from({ length: 23 }).map((_, i) => ({
  href: 'https://ant.design',
  title: `Juan Felipe ${i}`,
  avatar:
    'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/cute-cat-photos-1593441022.jpg?crop=0.670xw:1.00xh;0.167xw,0&resize=640:*',
  description: 'Revendedor | Tienda | Vendedor Oficial',
  content:
    'Me Encanto la tabla de surf que compre, de muy buena calidad, excelente servicios',
}));

export const controlNamePrefix = 'quantity-';
const maxDescriptionLength = 70;

export function DetailView({
  productDetails,
  returnHref,
  productId,
  companyLogo,
  forceLoadProduct,
  goBack,
}: IDetailViewProps) {
  const [product, setProduct] = useState<ProductEntity>({} as ProductEntity);
  const [oldSale, setOldSale] = useState<Partial<ISale>>({} as ISale);
  const [sale, setSale] = useState<Partial<ISale>>({} as ISale);
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  const router = useRouter();
  const carouselRef = useRef<any>();
  const { fetching, get, item } = handleEntityHook<ProductEntity>('products');
  const { makeContextualHref } = useContextualRouting();
  const [productOptionsForm] = Form.useForm();
  const { orderService } = useOrderContext();
  const currentOrder = useAppStore((state) => state.currentOrder);

  useEffect(() => {
    const productSlug = router.query.slug as string;
    if (productSlug && (!productDetails || forceLoadProduct)) {
      get({ endpoint: EndpointsAndEntityStateKeys.BY_SLUG, slug: productSlug });
    }
  }, [router.query, productId, productDetails]);

  useEffect(() => {
    const itemData = item._id ? item : {};
    let productInfo: ProductEntity = { ...itemData, ...(productDetails || {}) };
    if (forceLoadProduct) {
      productInfo = { ...(productDetails || {}), ...itemData };
    }
    productInfo._id && setProduct(productInfo as ProductEntity);
  }, [item, productDetails]);

  useEffect(() => {
    if (product._id && currentOrder) {
      const savedSale = currentOrder.sales.find(
        (s) => s.product._id === product._id,
      );
      if (savedSale && product?.productParams?.length !== savedSale?.params?.length) {
        product.productParams.forEach((productParam) => {
          const saleParamIndex = savedSale?.params.findIndex(
            (saleParam) => saleParam.productParam === productParam._id,
          );

          if (saleParamIndex && saleParamIndex !== -1 && !!savedSale?.params) {
            const saleParamData = savedSale.params[saleParamIndex];
            const param = parseProductParamToSaleParams(
              productParam,
              saleParamData as IProductSaleParam,
            );
            savedSale.params[saleParamIndex] = param;
          }
        });
      }

      setSale({
        ...getSaleDataFromProduct(product),
        ...savedSale,
      });
      // savedSale?.params.forEach((param) => handleSaleProductParams(param)());
    }
  }, [product, currentOrder]);

  useEffect(() => {
    const handleBeforeHistoryChange = () => {
      back();
    };

    // Event listener for beforeHistoryChange
    router.events.on('beforeHistoryChange', handleBeforeHistoryChange);

    // Clean up the event listener when the component is unmounted
    return () => {
      router.events.off('beforeHistoryChange', handleBeforeHistoryChange);
    };
  }, [router.events]);

  const handleEscKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      back();
    }
  };

  useEffect(() => {
    // Attach the event listener when the component mounts
    document.addEventListener('keydown', handleEscKeyPress);
    // Detach the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscKeyPress);
    };
  }, []); // Empty dependency array ensures the effect runs once on mount and cleans up on unmount

  const productExistOnShoppingCart = useMemo(
    () => !!orderService?.getSaleByProductId(product._id),
    [orderService?.localOrder, sale.params],
  );

  const back = () => {
    if (goBack) {
      goBack();
      return;
    }
    if (returnHref) {
      router.push(
        makeContextualHref({ return: true, productId: '' }),
        returnHref,
        {
          shallow: true,
        },
      );
    } else {
      if (!product?.company) return;
      router.push(`/${product.company}`);
    }
  };

  const navigate = (to: 'prev' | 'next') => () => carouselRef.current && carouselRef.current[to]();
  const hasImages = product.images && !!product.images.length;
  const hasMultipleImages = hasImages && product.images.length > 1;

  const parseProductParamToSaleParams = (
    productParam: IProductParam,
    saleParam: Partial<IProductSaleParam>,
  ) => {
    const relatedParamsData = productParam.relatedParams?.map((item) => {
      const newRelParam = ({
        ...item,
        _id: undefined,
        productParam: item._id,
        productQuantity: item.quantity,
        quantity: 0,
      });
      const existingRelParam = saleParam.relatedParams?.find(
        (relParam) => relParam.productParam === item._id,
      );
      return existingRelParam || newRelParam;
    });

    const relatedParams = Array.from(new Set([
      ...(relatedParamsData || []),
      ...(saleParam.relatedParams || [])]
      .map((item) => JSON.stringify(item))))
      .map((item) => JSON.parse(item));

    // @ts-ignore
    const param: IProductSaleParam = {
      // locator: Date.now().toString(),
      label: productParam.label,
      value: productParam.value,
      type: productParam.type,
      productQuantity: productParam.quantity,
      quantity: 0,
      productParam: productParam._id,
      ...saleParam,
      relatedParams,
    };

    return param;
  };

  const handleSaleProductParams = (productParam: IProductParam | IProductSaleParam) => () => {
    const saleParam: any = (productParam as IProductSaleParam).productParam
      ? (productParam as IProductSaleParam)
      : ({} as IProductSaleParam);

    const param = parseProductParamToSaleParams(productParam as IProductParam, saleParam);
    const exist = sale?.params?.find(
      (p) => p.productParam === param.productParam,
    );
    let newParams: IProductSaleParam[] | undefined = [];

    // Only will deactivate it if quantity is 0
    if (exist && !exist.quantity) {
      newParams = sale?.params?.filter(
        (p) => p.productParam !== param.productParam,
      );
      setSale({ ...sale, params: newParams });
    } else if (!exist) {
      newParams = [...(sale?.params || [])];
      newParams.push(param);
      setSale({ ...sale, params: newParams });
    }
  };

  const handleSaleQuantity = (value?: any) => {
    const quantity = Number(value || 0);
    const newSale: Partial<ISale> = {
      ...structuredClone(sale),
      quantity,
    };
    if (quantity <= product.stock) {
      if (quantity > 0 && productExistOnShoppingCart) {
        orderService?.handleLocalOrderSales(newSale);
      } else if (productExistOnShoppingCart) {
        orderService?.removeSale(product._id);
      }
      setSale(newSale);
    }
  };

  // eslint-disable-next-line
  const resetSaleProductParam = (parentId: string, variantId?: string) => () => handleSaleProductParamsChange(parentId, variantId)(0);

  const handleSaleProductParamsChange = (
    parentId: string,
    variantId?: string,
  ) => async (value?: any) => {
    let newSale = structuredClone(sale);
    let total = 0;
    const quantity = Number(value || 0);
    let saleParam = newSale?.params?.find((p) => p.productParam === parentId);

    if (!saleParam) {
      const selectedProductParam = product?.productParams.find((p) => p._id === parentId)
        || ({} as IProductParam);

      saleParam = parseProductParamToSaleParams(selectedProductParam, { quantity });
      newSale = {
        ...newSale,
        params: [...(newSale?.params || []), saleParam],
      };
    }

    const variant = saleParam?.relatedParams?.find(
      (v) => v.productParam === variantId,
    );

    if (variant) {
      variant.quantity = quantity;
      total = saleParam?.relatedParams?.reduce(
        (acc, v) => acc + (v.quantity || 0),
        0,
      ) || 0;
      saleParam.relatedParams = saleParam?.relatedParams?.map(
        (v) => (variant.productParam === v.productParam ? variant : v),
      );
    } else if (variantId) {
      const productParam = product.productParams.find(
        (p) => p._id === parentId,
      ) || ({} as IProductParam
      );
      const relatedParam = productParam.relatedParams
        ?.find((p) => p._id === variantId) || ({} as IProductParam);

      const newSaleRelatedParam = parseProductParamToSaleParams(relatedParam, { quantity });
      saleParam.relatedParams = [...(saleParam?.relatedParams || []), newSaleRelatedParam];
      total = saleParam?.relatedParams?.reduce(
        (acc, v) => acc + (v.quantity || 0),
        0,
      ) || 0;
    } else {
      total = quantity;
    }

    saleParam.quantity = total;

    if (saleParam) {
      const newParams = newSale?.params?.map((p) => {
        if (p.productParam === parentId) {
          return saleParam;
        }
        return p;
      }) as IProductParam[];
      newSale = {
        ...newSale,
        params: newParams.filter((item: IProductSaleParam) => !!item),
      };
    }

    const saleTotal = newSale.params?.reduce((acc, p) => acc + (p.quantity || 0), 0) || 0;
    newSale.quantity = saleTotal;

    const paramId = variantId || parentId;
    const controlName = `${controlNamePrefix}${paramId}`;
    productOptionsForm.setFieldsValue({ [controlName]: quantity });

    const controlIsValid = await productOptionsForm
      .validateFields([controlName])
      .then(
        () => true,
        () => false,
      );

    console.log('klk data', controlIsValid, saleTotal, quantity);
    if (controlIsValid) {
      if (saleTotal > 0) {
        if (quantity <= 0) {
          newSale.params = newSale?.params?.map(
            (item) => {
              if (item.productParam === parentId) {
                console.log(item.relatedParams, 'related');
                if (item.relatedParams) {
                  item.relatedParams = item.relatedParams.filter(
                    (rp) => rp.productParam !== variantId,
                  );
                  return item;
                }
                return null;
              }
              return item;
            },
          ).filter((item) => !!item) as IProductSaleParam[];
        }
        // if the order exist just
        if (productExistOnShoppingCart) {
          orderService?.handleLocalOrderSales(newSale);
        }
      }

      setSale({ ...newSale });

      if (saleTotal <= 0) {
        orderService?.removeSale(product._id);
      }
    }
  };

  const getQuantityValue = (parentId: string, variantId?: string) => {
    const param = sale?.params?.find((p) => p._id === parentId);

    if (variantId) {
      return (
        param?.relatedParams?.find((v) => v._id === variantId)?.quantity || 0
      );
    }
    return param?.quantity || 0;
  };

  const maxQuantityError = useCallback(
    (quantity: number = 0) => (!quantity
      ? 'No quedan unidades disponibles'
      : `Solo quedan ${quantity} unidades`),
    [],
  );

  useEffect(() => {
    const initialValues: any = {};
    (sale?.params || []).forEach((param) => {
      initialValues[`${controlNamePrefix}${param.productParam}`] = param.quantity;
      (param?.relatedParams || []).forEach((variant) => {
        initialValues[`${controlNamePrefix}${variant.productParam}`] = variant.quantity;
      });
    });
    initialValues.quantity = sale?.quantity;
    productOptionsForm.setFieldsValue(initialValues);
    // store the old sale
    if (!oldSale._id) {
      setOldSale(sale);
    }
    // return initialValues;
  }, [sale]);

  const { toggleCart } = useOrderContext();

  const addSaleNewSale = () => orderService?.handleLocalOrderSales(sale);
  const handleShoppingAction = () => {
    if (!productExistOnShoppingCart) {
      addSaleNewSale();
    }
    toggleCart();
  };

  const saleNeedUpdate = useMemo(() => {
    const paramChanged = JSON.stringify(sale.params) !== JSON.stringify(oldSale.params);
    const hasChanges = sale.params?.length ? paramChanged : sale.quantity !== oldSale.quantity;
    return oldSale._id && hasChanges;
  }, [sale.params]);

  const shoppingActionText = useMemo(
    () => (productExistOnShoppingCart
      ? saleNeedUpdate ? ProductsConstants.UPDATE_ORDER_IN_CART : ProductsConstants.VIEW_CART
      : ProductsConstants.ADD_CART),
    [productExistOnShoppingCart, saleNeedUpdate],
  );

  const shoppingActionDisabled = useMemo(
    () => (!sale?.quantity && !productExistOnShoppingCart)
      || (sale?.quantity || 0) > product.stock,
    [productExistOnShoppingCart, sale, product],
  );

  const getWhatsappLink = useCallback(
    (p: ProductEntity) => contactUsByWhatsappLink(orderMessageTexts.orderItemByWhatsapp(p)),
    [],
  );

  const ShoppingActionButton = (
    <Button
      type="primary"
      shape="round"
      block
      size="large"
      icon={<ShoppingOutlined rev="" />}
      className="me-m"
      onClick={handleShoppingAction}
      disabled={shoppingActionDisabled}
    >
      {shoppingActionText}
    </Button>
  );

  // // Efecto para cargar los detalles del producto
  // useEffect(() => {
  //   if (productDetails) {
  //     setProduct(productDetails);
  //   }
  // }, [productDetails]);

  // Maneja la adición de parámetros de venta
  const handleAddToSale = (saleParam: IProductSaleParam) => {
    const exist = sale?.params?.find(
      (p) => p.productParam === saleParam.productParam,
    );

    let newParams: IProductSaleParam[] | undefined = [];
    if (exist) {
      newParams = sale?.params?.map((p) => (p.productParam === saleParam.productParam ? saleParam : p));
    } else {
      newParams = [...(sale?.params || []), saleParam];
    }

    const saleTotal = newParams?.reduce((acc, p) => acc + (p.quantity || 0), 0);

    setSale({ ...sale, params: newParams, quantity: saleTotal });
  };

  // Maneja la eliminación de parámetros de venta
  // const handleRemoveFromSale = (parentId: string, variantId?: string) => {
  //   const newParams = sale?.params?.filter(
  //     (item) =>
  //       item.productParam !== parentId ||
  //       (variantId && item.relatedParams?.find((v) => v.productParam !== variantId))
  //   );
  //
  //   const saleTotal = newParams?.reduce((acc, p) => acc + (p.quantity || 0), 0);
  //
  //   setSale({ ...sale, params: newParams, quantity: saleTotal });
  // };

  const attemptRemoveSaleParam = (productSaleParam: IProductSaleParam) => () => {
    confirm({
      title: '¿Estas seguro de eliminar este producto?',
      icon: <ExclamationCircleFilled rev="" />,
      // content: 'Si quieres revertir el cambio solo recarga la pagina sin actualizar la orden.',
      closable: true,
      maskClosable: true,
      onOk() {
        resetSaleProductParam(productSaleParam.productParam as string)();
      },
      onCancel() {
        // console.log('Cancel')
      },
    });
  };

  return (
    <>
      <div className={`grid-container ${styles.DetailViewWrapper}`}>
        <div className={styles.ProductDetailBanner}>
          <h1>Offerta!</h1>
        </div>
        <div className={`grid-column-1 ${styles.GalleryWrapper}`}>
          <div className={styles.DetailViewBackButton} onClick={back}>
            <ArrowLeftOutlined rev="" />
          </div>
          {hasMultipleImages && (
            <>
              <div className={styles.DetailViewPrevButton}>
                <ArrowLeftOutlined rev="" onClick={navigate('prev')} />
              </div>
              <div className={styles.DetailViewNextButton}>
                <ArrowRightOutlined rev="" onClick={navigate('next')} />
              </div>
            </>
          )}
          <ImageBackground image={product.image || companyLogo} />
          {/* <Image.PreviewGroup> */}
          {/*  <Carousel */}
          {/*    ref={carouselRef} */}
          {/*    nextArrow={( */}
          {/*      <div className={styles.DetailViewButton}> */}
          {/*        <ArrowRightOutlined rev="" /> */}
          {/*      </div> */}
          {/*    )} */}
          {/*  > */}
          {/*    {hasImages ? ( */}
          {/*      product.images.map((img, i) => ( */}
          {/*        <ImageBackground image={img} key={`detailViewImage${i}`} /> */}
          {/*      )) */}
          {/*    ) : ( */}
          {/*      <ImageBackground image={companyLogo} /> */}
          {/*    )} */}
          {/*  </Carousel> */}
          {/* </Image.PreviewGroup> */}
        </div>
        <Resizable
          defaultSize={{ width: sidebarWidth, height: 'auto' }}
          enable={{ left: true, right: false }}
          className={styles.DetailViewPostDetails}
        >
          <div className={styles.DetailViewPostDetailsHeader}>
            <h1 className="title m-0">{product.name}</h1>
            <h2 className="subtitle m-0">
              RD$
              {' '}
              {product.price?.toLocaleString()}
            </h2>
            <span className="label">
              {product.stock}
              {' '}
              unidades disponibles
            </span>
          </div>
          <div className={styles.DetailViewPostDetailsContent}>
            <span className="subtitle mb-m">Escoge las Cantidades</span>
            <Form
              form={productOptionsForm}
              name="productOptionsForm"
              className={`${styles.DetailViewPostDetailsContentOptionsWrapper}`}
            >
              {product?.productParams && product?.productParams.length ? (
                product?.productParams?.map((param, i) => {
                  const saleParam = sale?.params?.find(
                    (saleParam) => saleParam.productParam === param._id,
                  );

                  return (
                    <div
                      className={`${
                        styles.DetailViewPostDetailsContentOption
                      }  ${
                        param.relatedParams?.length ? ' w-100 grid-column-full' : ''
                      } 
                      ${
                        saleParam
                          ? `${styles.active}`
                          : ''
                      }`}
                      key={`detailViewOption${i}`}
                    >
                      <div className="flex-stretch-center gap-2 w-100">
                        <Button
                          className={styles.DetailViewPostDetailsContentOptionBtn}
                          shape="round"
                          size="large"
                          onClick={handleSaleProductParams(param)}
                        >
                          {param.label}
                          {param.type === 'color' ? (
                            <span
                              className={
                              styles.DetailViewPostDetailsContentOptionBtnColorOption
                            }
                              style={{ backgroundColor: param.value }}
                            />
                          ) : (
                            ` - ${param.value}`
                          )}
                        </Button>
                        {!!saleParam?.quantity && (
                        <div>
                          {' '}
                          <Button size="large" danger color="red" type="text" onClick={attemptRemoveSaleParam(saleParam)}>
                            <DeleteOutlined rev className="text-bold font-size-9" />
                          </Button>
                        </div>
                        )}
                      </div>
                      {saleParam
                      && param?.relatedParams
                      && !!param?.relatedParams.length ? (
                        <ProductOptionHandler
                          productParam={param}
                          saleParam={
                          sale.params
                            ?.find((item) => item.productParam === param._id) as IProductSaleParam
                          }
                          handleSaleProductParamsChange={handleSaleProductParamsChange}
                          onRemoveFromSale={resetSaleProductParam}
                        />
                        ) : (
                          <Form.Item
                            className={
                            styles.DetailViewPostDetailsContentOptionBtnInput
                          }
                            name={`${controlNamePrefix}${param._id}`}
                            rules={[
                              {
                                type: 'number',
                                required: true,
                                message: maxQuantityError(param.quantity),
                                max: param.quantity,
                                min: 0,
                              },
                            ]}
                          >
                            <InputNumber
                              onWheel={(e) => e.currentTarget.blur()}
                              type="number"
                              className={
                              styles.DetailViewPostDetailsContentOptionQuantity
                            }
                              placeholder="Cantidad"
                              onChange={handleSaleProductParamsChange(param._id)}
                              value={getQuantityValue(param._id)}
                              defaultValue={0}
                              min={0}
                              addonAfter={(
                                <CloseOutlined
                                  rev=""
                                  onClick={resetSaleProductParam(param._id)}
                                />
                            )}
                            />
                          </Form.Item>
                        )}
                    </div>
                  );
                })
              ) : (
                <Form.Item
                  className={styles.DetailViewPostDetailsContentOptionBtnInput}
                  name="quantity"
                  rules={[
                    {
                      type: 'number',
                      required: true,
                      message: maxQuantityError(product.stock),
                      max: product.stock,
                      min: 0,
                    },
                  ]}
                >
                  <InputNumber
                    onWheel={(e) => e.currentTarget.blur()}
                    type="number"
                    addonAfter={(
                      <CloseOutlined
                        rev=""
                        onClick={() => handleSaleQuantity(0)}
                      />
                    )}
                    onChange={handleSaleQuantity}
                    value={sale.quantity}
                    defaultValue={0}
                    min={0}
                  />
                </Form.Item>
              )}
            </Form>

            <div
              className={styles.DetailViewPostDetailsContentDescriptionWrapper}
            >
              <h2 className="subtitle">Descripcion</h2>
              <div
                className={`${styles.DetailViewPostDetailsContentDescription} ${
                  showMoreDescription ? styles.showMoreDescription : ''
                }`}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
              {product?.description?.length > maxDescriptionLength && (
                <a
                  className={
                    styles.DetailViewPostDetailsContentDescriptionToggle
                  }
                  onClick={() => setShowMoreDescription(!showMoreDescription)}
                >
                  {!showMoreDescription ? 'Mostrar mas' : 'Mostrar menos'}
                </a>
              )}
            </div>

            <div
              className={styles.DetailViewPostDetailsContentComments}
              style={{ display: 'none' }}
            >
              <span className="subtitle mb-xx-s">Comentarios</span>
              <div className="flex-between-center p-m gap-s">
                <Input
                  placeholder="Escribir comentario"
                  suffix={<UploadOutlined rev="" />}
                />
                <Button icon={<MessageOutlined rev="" />}>Enviar</Button>
              </div>
              <List
                itemLayout="vertical"
                size="large"
                dataSource={data}
                footer={(
                  <div>
                    <b>ant design</b>
                    {' '}
                    footer part
                  </div>
                )}
                renderItem={(item) => (
                  <List.Item
                    key={item.title}
                    actions={[
                      <IconText
                        icon={StarOutlined}
                        text="156"
                        key="list-vertical-star-o"
                      />,
                      <IconText
                        icon={LikeOutlined}
                        text="156"
                        key="list-vertical-like-o"
                      />,
                      <IconText
                        icon={MessageOutlined}
                        text="2"
                        key="list-vertical-message"
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar} />}
                      title={<a href={item.href}>{item.title}</a>}
                      description={item.description}
                    />
                    {item.content}
                  </List.Item>
                )}
              />
            </div>
          </div>
          <StickyFooter className={styles.DetailViewPostDetailsActions}>
            {ShoppingActionButton}
            {!currentOrder?.sales?.length && (
              <Link href={getWhatsappLink(product)}>
                <a target="_blank" rel="noopener noreferrer">
                  <Button
                    type="link"
                    shape="round"
                    block
                    size="large"
                    icon={<WhatsAppOutlined rev="" />}
                    className="me-m"
                  >
                    {ProductsConstants.ORDER_BY_WHATSAPP}
                  </Button>
                </a>
              </Link>
            )}
          </StickyFooter>
        </Resizable>
        <StickyFooter
          className={`${styles.DetailViewPostDetailsActions} ${styles.MobileOnly}`}
        >
          {ShoppingActionButton}
        </StickyFooter>
      </div>
      {fetching && !product._id && (
        <div className="loading">
          <Spin size="large" />
        </div>
      )}
    </>
  );
}

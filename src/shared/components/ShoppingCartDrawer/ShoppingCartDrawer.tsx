import {
  Button,
  Drawer,
  DrawerProps,
  Modal,
  Result,
  Steps,
  Tag,
} from 'antd';
import React, {
  useContext, useEffect, useMemo, useState,
} from 'react';
import {
  DeleteOutlined,
  EditOutlined, ExclamationCircleFilled,
  PlusOutlined,
  ShoppingOutlined, WhatsAppOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useAppStore } from '@services/store';
import { handleEntityHook } from '@shared/hooks/handleEntityHook';
import OrderEntity, { OrderFromTypes } from '@shared/entities/OrderEntity';
import { useAuthClientHook } from '@shared/hooks/useAuthClientHook';
import { ShoppingCart } from '@components/ShoppingCart';
import { Register } from '@screens/Auth/components/Register';
import { ProductEntity } from '@shared/entities/ProductEntity';
import { toast } from 'react-toastify';
import { StickyFooter } from '@shared/layout/components/StickyFooter/StickyFooter';
import Title from 'antd/lib/typography/Title';
import { useOrderContext } from '@shared/contexts/OrderContext';
import { ClientEntity } from '@shared/entities/ClientEntity';
import { ProductsConstants } from '@shared/constants/products.constants';
import { AppLoadingContext } from '@shared/contexts/AppLoadingContext';
import { FROM_TARGET_KEY } from '@shared/constants/seo.constants';
import styles from './ShoppingCartDrawer.module.scss';
import { orderStatusText } from '../../../utils/constants/order.constant';

const { confirm } = Modal;

export interface IShoppingCartDrawerProps extends DrawerProps {
  onClose: () => void;
}

export function ShoppingCartDrawer({
  open,
  onClose,
}: IShoppingCartDrawerProps) {
  const [successOrderOpen, setSuccessOrderOpen] = useState(false);
  const router = useRouter();
  const order = useAppStore((state) => state.currentOrder);
  const handleCurrentOrder = useAppStore((state) => state.handleCurrentOrder);
  const { setAppLoading } = useContext(AppLoadingContext);

  const { client } = useAuthClientHook();
  const {
    add: sendOrder,
    update: updateOrder,
    loading,
    item: processedOrder,
  } = handleEntityHook<OrderEntity>('orders');
  const [current, setCurrent] = useState(0);
  const subtotal = useMemo(
    () => order?.sales?.reduce(
      (acc, sale) => acc + (sale?.product?.price || 0) * sale.quantity,
      0,
    ),
    [order?.sales],
  );
  const { orderService } = useOrderContext();
  const toggleSuccessOrderModal = () => setSuccessOrderOpen(!successOrderOpen);
  useEffect(() => {
    if (client) {
      setCurrent(0);
    }
  }, [client]);
  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const editSale = (product: ProductEntity) => {
    router.push(`/${product.company}/products/${product?.slug}`);
    onClose && onClose();
  };

  const removeSale = (product: ProductEntity) => {
    orderService.removeSale(product._id);
    // router.push(`/${product.company}/products/${product?._id}`)
    // onClose && onClose({} as any)
  };

  const handleSendOrder = async (
    newClient?: ClientEntity | any,
    existingOrder: OrderEntity = order,
  ) => {
    const orderData = existingOrder || order;
    if (!!orderData && orderData.sales.length === 0) return;
    if (orderData?._id) {
      if (orderData.status === 'pending-confirm') {
        orderData.status = 'pending-info';
      }
      // eager closing
      onClose && onClose();
      await updateOrder(orderData);
      toast.success('Orden actualizada con éxito');
      orderService.resetLocalStorageOrder();
    } else if ((client || (newClient && current === 1)) && !orderData._id) {
      const clientData = newClient?._id ? newClient : client;
      const from = (localStorage.getItem(FROM_TARGET_KEY) || 'ecommerce') as OrderFromTypes;
      // eager closing
      onClose && onClose();
      await sendOrder({ ...orderData, from, client: clientData });
      if (from) {
        localStorage.removeItem(FROM_TARGET_KEY);
      }
      toggleSuccessOrderModal();
      toast.success('Orden enviada con éxito');
      orderService.resetLocalStorageOrder();
    } else if (!newClient && current === 1) {
      toast('Error al crear usuario');
    } else if (!client) {
      next();
    }

    setAppLoading(false);
  };
  const onChangeStep = (value: number) => {
    setCurrent(value);
  };
  const goToProfile = () => {
    router.push('/client/profile');
    onClose && onClose();
  };

  const handleAddMoreProducts = () => {
    // router.push('/');
    onClose && onClose();
  };

  const goToOrders = () => {
    router.push('/client/orders');
    toggleSuccessOrderModal();
    onClose && onClose();
  };

  useEffect(() => {
    const currentOrderConditional = !order?._id || processedOrder.updateDate !== order.updateDate;
    processedOrder._id && currentOrderConditional
      && processedOrder.status !== 'canceled'
      && handleCurrentOrder(processedOrder);
  }, [processedOrder]);

  const tagColor = useMemo(() => {
    let color = 'blue';
    switch (order?.status) {
      case 'pending-info':
      case 'pending':
        color = 'orange';
        break;
      case 'confirmed':
      case 'completed':
      case 'cancel-attempt':
        color = 'green';
        break;
      case 'canceled':
        color = 'red';
        break;
      default:
        color = 'blue';
        break;
    }
    return color;
  }, [order?.status]);

  const attemptRemoveItem = (product: ProductEntity) => {
    confirm({
      title: '¿Estas seguro de eliminar este producto?',
      icon: <ExclamationCircleFilled rev="" />,
      content: 'Si quieres revertir el cambio solo recarga la pagina sin actualizar la orden.',
      closable: true,
      maskClosable: true,
      onOk() {
        removeSale(product);
      },
      onCancel() {
        // console.log('Cancel')
      },
    });
  };

  useEffect(() => {
    setAppLoading(loading);
  }, [loading]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      bodyStyle={{ paddingBottom: 0, paddingTop: 0 }}
      className={styles.ShoppingCartDrawer}
    >
      <div className={styles.ShoppingCartDrawerHeader}>
        {!client ? (
          <Steps
            onChange={onChangeStep}
            current={current}
            items={[
              {
                title: 'Productos',
              },
              {
                title: 'Enviar Orden',
              },
            ]}
          />
        ) : (
          <>
            {order?._id && (
              <div className="flex-center-center">
                <Tag
                  color={tagColor}
                  className="font-size-5 p-s mb-m w-100 text-center"
                >
                  {orderStatusText[order?.status]}
                </Tag>
              </div>
            )}
            <h3 className="flex-between-center">
              Datos del Cliente
              {' '}
              <div onClick={goToProfile} className="cursor-pointer">
                <a>Editar Datos</a>
              </div>
            </h3>
            <div className="flex-column-center-center gap-s">
              <div className="flex-between-center w-100">
                <b>Nombre:</b>
                <span>{client.firstName}</span>
              </div>
              <div className="flex-between-center w-100">
                <b>Whatsapp:</b>
                <span>{client.phone}</span>
              </div>
            </div>
          </>
        )}
      </div>
      {current === 0 && (
        <>
          <ShoppingCart
            sales={order?.sales || []}
            itemActions={[
              {
                icon: DeleteOutlined,
                text: 'Eliminar',
                key: 'list-vertical-star-o',
                onClick: attemptRemoveItem,
              },
              {
                icon: EditOutlined,
                text: 'Editar',
                key: 'list-vertical-star-o',
                onClick: editSale,
              },
            ]}
          />
          <StickyFooter className={styles.ShoppingCartDrawerFooter}>
            <div className={`flex-between-start pb-s ${styles.ShoppingCartDrawerFooterPriceInfo}`}>
              <Title className="m-0" level={5}>
                Subtotal
              </Title>
              <Title className="m-0" level={2}>
                RD$
                {' '}
                {(subtotal || '0').toLocaleString()}
              </Title>
            </div>
            <div className="mb-s font-size-4 text-center">
              <i>
                Luego de enviar el pedido te escribiremos por Whatsapp
                {' '}
                <WhatsAppOutlined rev="" className="text-green-5" />
                {' '}
                para
                continuar con la orden.
              </i>
            </div>
            {(order?.status === 'pending-confirm'
              || order?.status === 'pending-info'
              || order?.status === 'pending'
              || order?.status === 'personal-assistance') && (
              <>
                <Button
                  className="mb-l"
                  type="primary"
                  shape="round"
                  block
                  size="large"
                  icon={client ? <ShoppingOutlined rev="" /> : null}
                  onClick={!order?.sales?.length ? undefined : handleSendOrder}
                  disabled={order?.sales?.length === 0}
                >
                  {order?._id
                    ? order?.status === 'pending-confirm'
                      ? ProductsConstants.CONFIRM_CART_ORDER
                      : ProductsConstants.UPDATE_CART
                    : client
                      ? ProductsConstants.SEND_CART
                      : ProductsConstants.NEXT}
                </Button>

                <Button
                  shape="round"
                  block
                  size="large"
                  icon={client ? <PlusOutlined rev="" /> : null}
                  onClick={handleAddMoreProducts}
                >
                  Agregar más productos
                </Button>
              </>
            )}
          </StickyFooter>
        </>
      )}
      {current === 1 && (
        <div className={styles.ShoppingCartDrawerRegisterWrapper}>
          <Register
            onSubmit={handleSendOrder}
            submitBtnLabel={ProductsConstants.SEND_CART}
          />

          <Button
            htmlType="submit"
            type="default"
            shape="round"
            block
            size="large"
            onClick={prev}
          >
            Atras
          </Button>
        </div>
      )}
      <Modal
        footer={[]}
        open={successOrderOpen}
        onOk={toggleSuccessOrderModal}
        onCancel={toggleSuccessOrderModal}
      >
        <Result
          status="success"
          subTitle={(
            <span>
              Orden enviada con exito. Te estaremos escribiendo por Whatsapp, si
              no nos comunicamos contigo, puedes escribirnos al
              {' '}
              <a
                target="_blank"
                href="https://wa.me/message/KNV3Z5CLAVHDK1"
                rel="noreferrer"
              >
                (829) 893-7075
              </a>
            </span>
          )}
          extra={[
            <Button
              type="primary"
              onClick={() => {
                toggleSuccessOrderModal();
                onClose && onClose();
              }}
            >
              Seguir comprando
            </Button>,
            <Button key="buy" onClick={goToOrders}>
              Ver mis pedidos
            </Button>,
          ]}
        />
      </Modal>
    </Drawer>
  );
}

import React, { useEffect } from 'react';
import {
  Space, Table, Tag, Modal, Button,
} from 'antd';
import { handleEntityHook } from '@shared/hooks/handleEntityHook';
import { EndpointsAndEntityStateKeys } from '@shared/enums/endpoints.enum';
import OrderEntity, { OrderStatusTypes } from '@shared/entities/OrderEntity';
import { useAuthClientHook } from '@shared/hooks/useAuthClientHook';
import { useAppStore } from '@services/store';
import { useOrderContext } from '@shared/contexts/OrderContext';
import { toast } from 'react-toastify';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ExclamationCircleFilled } from '@ant-design/icons';

const { confirm } = Modal;
export default function ClientOrders() {
  const {
    get: getOrders,
    update: updateOrder,
    [EndpointsAndEntityStateKeys.BY_CLIENT]: clientOrders,
  } = handleEntityHook<OrderEntity>('orders');
  const { client } = useAuthClientHook();
  const handleCurrentOrder = useAppStore((state) => state.handleCurrentOrder);
  const { toggleCart } = useOrderContext();
  const { orderService } = useOrderContext();

  const getOrdersByClient = async () => {
    if (!client) return;
    await getOrders({
      endpoint: EndpointsAndEntityStateKeys.BY_CLIENT,
      slug: client._id?.toString(),
    });
  };
  useEffect(() => {
    if (client) {
      getOrdersByClient();
    }
  }, [client]);

  const editOrder = (order: OrderEntity) => () => {
    handleCurrentOrder(order);
    toggleCart();
  };
  const cancelOrder = async (order: OrderEntity) => {
    const orderData: OrderEntity = { ...order, _id: order._id || '', status: 'canceled' };
    await updateOrder(orderData);
    orderService.resetOrder();
    toast('Orden cancelada con éxito');
    getOrdersByClient();
  };

  const attemptCancelOrder = (order: OrderEntity) => async () => {
    confirm({
      title: '¿Estas seguro de cancelar esta orden?',
      icon: <ExclamationCircleFilled rev="" />,
      content: 'Una vez cancelada no podras revertir esta acción',
      closable: true,
      maskClosable: true,
      onOk() {
        cancelOrder(order);
      },
      onCancel() {
        // console.log('Cancel')
      },
    });
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (date: string) => new Date(date || '').toLocaleDateString(),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (text: string) => (
        <a>
          RD$
          {text.toLocaleString()}
        </a>
      ),
    },
    {
      title: 'Tienda',
      dataIndex: 'company',
      key: 'company',
      render: (text: string) => `@${text}`,
    },
    {
      title: 'Estado',
      key: 'status',
      dataIndex: 'status',
      render: (status: OrderStatusTypes) => {
        let color = 'blue';
        switch (status) {
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
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Aciones',
      key: 'action',
      render: (text: string, order: OrderEntity) => (
        <Space size="middle">
          {order.status !== 'completed'
            && order.status !== 'canceled'
            && order.status !== 'checking-transfer'
            && order.status !== 'delivering'
            && order.status !== 'delivered' && (
              <>
                <Button type="link" onClick={attemptCancelOrder(order)}>
                  Cancelar
                </Button>
                {order.status !== 'confirmed' && (
                  <Button type="link" onClick={editOrder(order)}>
                    Editar
                  </Button>
                )}
              </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="p-xxx-l w-100">
        <h2 className="title">Mis Ordenes</h2>
        <Table columns={columns} dataSource={clientOrders?.data || []} />
      </div>
    </>
  );
}

export const getServerSideProps = async () => ({
  props: {
    protected: true,
  },
});

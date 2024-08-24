import {
  Alert, Button, Form, Input, Spin, Typography,
} from 'antd';
import { useAppStore } from '@services/store';
import { ClientEntity } from '@shared/entities/ClientEntity';
import { MaskedInput } from 'antd-mask-input';
import { useRouter } from 'next/router';
import { IAuthProps } from '@screens/Auth/Auth';
import { EndpointsAndEntityStateKeys } from '@shared/enums/endpoints.enum';
import React, { useEffect, useState } from 'react';
import { UserAddOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useOrderContext } from '@shared/contexts/OrderContext';
import { debounce } from 'lodash';
import { FROM_TARGET_KEY } from '@shared/constants/seo.constants';
import { OrderFromTypes } from '@shared/entities/OrderEntity';

export function Register({ isModal, onSubmit, submitBtnLabel }: IAuthProps) {
  const clientEntity = useAppStore((state) => state.clients((stateu) => stateu));
  const router = useRouter();
  const [clientLoginData, setClientLoginData] = useState<ClientEntity>(
    {} as ClientEntity,
  );
  const { cartIsOpen, toggleCart } = useOrderContext();
  const [failedLogin, setFailedLogin] = useState(false);
  const [failedCreating, setFailedCreating] = useState(false);
  const [logged, setLogged] = useState(false);
  const { orderService } = useOrderContext();

  const createClient = async (data: ClientEntity) => {
    data.phone = data.phone.toString().replace(/[- ()+]/g, '');
    const from = (localStorage.getItem(FROM_TARGET_KEY) || 'ecommerce') as OrderFromTypes;
    const nameList = data.firstName.split(' ');
    data.firstName = nameList[0];
    data.lastName = nameList[1];

    const loginData = {
      ...clientLoginData,
      phone: data.phone,
      password: data.password,
      from,
    };
    setClientLoginData(loginData);

    const res = await clientEntity.add(data, {
      endpoint: EndpointsAndEntityStateKeys.REGISTER,
    });

    return res;
  };

  const handleLogin = debounce(async (userData: ClientEntity = clientLoginData) => {
    // toast.info('Iniciando sesión...');
    const data: ClientEntity = {
      ...clientLoginData,
      ...userData,
    };

    const response = await clientEntity.add(data, {
      endpoint: EndpointsAndEntityStateKeys.LOGIN,
    }, true, 1000 * 60 * 60 * 24 * 7);

    if (!response) {
      handleUnsuccessfulLogin();
    } else {
      // setFailedLogin(false);
      setLogged(true);
      if (isModal) {
        router.back();
      } else if (!onSubmit) {
        router.push('/');
      }
    }

    // toast.dismiss();
    return response;
  }, 500);

  const handleUnsuccessfulLogin = () => {
    if (clientEntity.error?.status === 409) {
      toast.error(clientEntity.error.message);
      setFailedLogin(true);
    }
  };

  useEffect(() => {
    if (clientEntity.error?.status === 409) {
      setFailedCreating(true);
      handleLogin();
    }
  }, [clientLoginData, clientEntity?.error]);

  useEffect(() => {
    if (clientEntity.item._id) {
      handleOnSubmit();
      if (!logged) {
        handleLogin(clientEntity.item);
      }
    }
  }, [clientEntity.item?._id, logged, failedCreating]);

  const handleOnSubmit = async () => {
    if (logged) {
      await orderService.initLocalOrder();
      const existingOrder = orderService.localOrder;
      onSubmit && onSubmit(clientEntity.item, existingOrder);
    }
    if (!failedCreating) {
      onSubmit && onSubmit(clientEntity.item);
    }
  };

  const goToLogin = () => {
    cartIsOpen && toggleCart();
    router.push('/client/auth');
  };

  return (
    <Form
      className="pt-s"
      name="registerUser"
      layout="vertical"
      initialValues={{ remember: true }}
      onFinish={createClient}
    >
      {failedLogin && (
        <Alert
          showIcon
          description="Este número de teléfono ya está registrado."
          type="error"
          action={(
            <Button onClick={goToLogin} size="small" type="primary">
              Iniciar Sesión
            </Button>
          )}
        />
      )}
      {clientEntity.loading && (
        <div className="loading">
          <Spin size="large" />
        </div>
      )}
      {/* <Form.Item label="Apellido" name="lastName" rules={[{ required: true }]}> */}
      {/*  <Input size="large" /> */}
      {/* </Form.Item> */}
      <Form.Item
        label="Teléfono (Whatsapp)"
        name="phone"
        rules={[{ type: 'string', required: true, min: 17 }]}
      >
        <MaskedInput
          type="text"
          value=""
          mask="+1 (000) 000-0000"
          maskOptions={{
            lazy: true,
          }}
          size="large"
        />
      </Form.Item>
      <Form.Item label="Nombre" name="firstName" rules={[{ required: true }]}>
        <Input size="large" />
      </Form.Item>
      {onSubmit && (
        <Typography.Paragraph className="mb-s font-size-4 text-center" italic>
          Luego de enviar el pedido te escribiremos por Whatsapp
          {' '}
          <WhatsAppOutlined rev="" className="text-green-5" />
          {' '}
          para
          continuar con la orden.
        </Typography.Paragraph>
      )}
      {/* <Form.Item label="Password" name="password" rules={[{ required: true }]}> */}
      {/*  <Input.Password size="large" /> */}
      {/* </Form.Item> */}
      <Form.Item>
        <Button
          htmlType="submit"
          type="primary"
          shape="round"
          block
          size="large"
          icon={<UserAddOutlined rev="" />}
        >
          {submitBtnLabel || 'Registrarse'}
        </Button>
      </Form.Item>
    </Form>
  );
}

import React, { useMemo, useState } from 'react';
import {
  Form, AutoComplete, InputNumber, Button, Tag, Modal, Tooltip,
} from 'antd';
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
} from '@ant-design/icons';
import { IProductParam, IProductSaleParam } from '@shared/entities/ProductEntity';
import { controlNamePrefix } from '@components/DetailView/DetailView';
import styles from './ProductOptionHandler.module.scss';

const { confirm } = Modal;

interface IProductOptionFormProps {
  productParam: IProductParam; // Tipo de parámetro del producto
  saleParam: IProductSaleParam; // Parámetros de venta
  handleSaleProductParamsChange: (
    parentId: string,
    variantId?: string
  ) => (value?: any) => void; // Función para manejar el cambio
  onRemoveFromSale: (
    parentId: string, variantId?: string
  ) => () => any; // Función para eliminar del carrito
}

export const ProductOptionHandler: React.FC<IProductOptionFormProps> = ({
  productParam,
  saleParam,
  handleSaleProductParamsChange,
  onRemoveFromSale,
}) => {
  const [selectedRelatedParam, setSelectedRelatedParam] = useState<string | undefined>();
  const [quantity, setQuantity] = useState<number>(1);
  const addBtnControlName = `${controlNamePrefix}${productParam._id}`;
  const [productOptionsForm] = Form.useForm();

  const getMaxQuantityValue = (variantId: string) => {
    const productP = productParam.relatedParams?.find(
      (p) => p._id === variantId,
    );
    return productP?.quantity || 0;
  };

  const handleSizeChange = (value: string) => {
    setSelectedRelatedParam(value);
    setQuantity(1); // Reset quantity when the size changes
    productOptionsForm.setFieldsValue({
      [addBtnControlName]: minSelectedParamValue,
    });
  };

  const activeSaleRelatedParams = useMemo(() => saleParam.relatedParams?.filter(
    (saleParam) => saleParam.quantity !== 0,
  ), [saleParam]);

  const handleAddNew = () => {
    handleSaleProductParamsChange(productParam._id, selectedRelatedParam)(quantity);
    setSelectedRelatedParam(undefined);
    setQuantity(1);
    productOptionsForm.setFieldsValue({
      [addBtnControlName]: minSelectedParamValue,
    });
  };

  const relatedParams = useMemo(() => productParam.relatedParams?.filter((rp) => {
    if (saleParam.relatedParams?.find(
      (relatedSaleParam) => relatedSaleParam.quantity && relatedSaleParam.productParam === rp._id,
    )) {
      return false;
    }
    return true;
  }), [activeSaleRelatedParams, productParam.relatedParams]);

  const minSelectedParamValue = 1;
  const maxSelectedParamValue = useMemo(() => {
    const selectedParam = productParam.relatedParams?.find(
      (rp) => rp._id === selectedRelatedParam,
    );
    return selectedParam?.quantity || 0;
  }, [selectedRelatedParam]);

  const handleQuantityChange = (value: number | null) => {
    const quantityValue = Number(value || 0);
    if (quantityValue > maxSelectedParamValue) {
      return;
    }
    setQuantity(quantityValue);
  };

  const addButtonIsDisabled = useMemo(
    () => !selectedRelatedParam || quantity <= 0 || quantity > maxSelectedParamValue,
    [selectedRelatedParam, quantity],
  );
  const rpOptions = useMemo(() => relatedParams?.map((relatedParam) => ({
    value: relatedParam._id,
    label: `${relatedParam.value} - ${relatedParam.label}`,
  })), [relatedParams]);

  const rpSelectedOption = useMemo(
    () => rpOptions?.find((rp) => rp.value === selectedRelatedParam),
    [selectedRelatedParam, rpOptions],
  );

  const handleOnRemove = (parentId: string, variantId?: string) => () => {
    if (activeSaleRelatedParams?.length === 1) {
      confirm({
        title: '¿Estas seguro de eliminar este producto?',
        icon: <ExclamationCircleFilled rev="" />,
        closable: true,
        maskClosable: true,
        onOk() {
          onRemoveFromSale(productParam._id, variantId)();
        },
        onCancel() {
        },
      });
    } else {
      onRemoveFromSale(productParam._id, variantId)();
    }
  };

  return (
    <div className="flex-column-center-start gap-x-l">
      <Form
        form={productOptionsForm}
        layout="vertical"
        className="flex-stretch-start gap-s w-100"
      >
        <Form.Item
          label={(
            <b>
              Elige el
              {' '}
              {productParam.relatedParams?.[0]?.type?.toUpperCase()}
            </b>
              )}
          rootClassName="roooooooooooooot"
          className="w-100 m-0  custonCC"
          wrapperCol={{
            flex: 'none',
            style: { flex: 'none' },
          }}
        >
          <AutoComplete
            size="large"
            style={{ width: '100%' }}
            placeholder={`Selecciona un ${productParam.relatedParams?.[0]?.type?.toUpperCase()}`}
            value={rpSelectedOption?.label}
            onChange={handleSizeChange}
            options={rpOptions}
            filterOption={
              (inputValue, option) => {
                if (inputValue === rpSelectedOption?.label) {
                  return true;
                }
                return option!.label.toUpperCase()
                  .includes(inputValue.toUpperCase());
              }
            }
          />
        </Form.Item>

        <Form.Item
          className="m-0"
          name={addBtnControlName}
          label={<b>Cantidad</b>}
          rules={[
            {
              type: 'number',
              required: true,
              message: `Máximo ${maxSelectedParamValue}`,
              max: maxSelectedParamValue,
              min: minSelectedParamValue,
            },
          ]}
        >
          <InputNumber
            size="large"
            onWheel={
                  (e) => e.currentTarget.blur()
                }
            type="number"
            defaultValue={0}
            min={0}
            max={maxSelectedParamValue + 1}
            value={quantity}
            onChange={handleQuantityChange}
            disabled={!selectedRelatedParam}
          />
        </Form.Item>
        <Tooltip title="Agregar">
          <Button
            type="primary"
            className="align-self-end flex-center-center"
            size="large"
            shape="circle"
            onClick={handleAddNew}
            disabled={addButtonIsDisabled}
          >
            <PlusOutlined className="font-size-9" rev />
          </Button>
        </Tooltip>
      </Form>

      <div className={`flex-start-center ${styles.ProductOptionHandlerSelectedOptions}`}>
        {
            activeSaleRelatedParams?.map(
              (rp, idx) => (
                <div key={`relatedItem-${idx}-${rp.productParam}`} className="selected-size">
                  <Form.Item
                    name={`${controlNamePrefix}${rp.productParam}`}
                    rules={[
                      {
                        type: 'number',
                        required: true,
                        message: `Máximo ${getMaxQuantityValue(rp.productParam as string)}`,
                        max: getMaxQuantityValue(rp.productParam as string),
                        min: 0,
                      },
                    ]}
                  >
                    <div className="flex-column-center-center gap-x-s">
                      <Tooltip title={`${rp.label} - ${rp.value}`}>
                        <Tag>
                          {`${rp.label} - ${rp.value}`}
                        </Tag>
                      </Tooltip>
                      <InputNumber
                        style={{ width: '100px' }}
                        onWheel={
                                (e) => e.currentTarget.blur()
                              }
                        type="number"
                        placeholder="Cantidad"
                        value={rp.quantity}
                        defaultValue={0}
                        min={minSelectedParamValue}
                        max={(rp.productQuantity || 0) + 1}
                        onChange={(value) => {
                          handleSaleProductParamsChange(productParam._id, rp.productParam)(
                            value,
                          );
                        }}
                        addonAfter={(
                          <Tooltip title="Quitar">

                            <DeleteOutlined
                              className="text-red text-bold font-size-7"
                              rev=""
                              onClick={
                                        handleOnRemove(productParam._id, rp.productParam as string)
                                      }
                            />
                          </Tooltip>
                              )}
                      />
                    </div>

                  </Form.Item>

                </div>
              ),
            )
          }
      </div>
    </div>
  );
};

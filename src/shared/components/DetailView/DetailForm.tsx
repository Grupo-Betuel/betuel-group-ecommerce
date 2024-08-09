import React, { useState } from "react";
import { Form, Select, InputNumber, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { IProductParam, IProductSaleParam } from "@shared/entities/ProductEntity";

interface IProductOptionFormProps {
  param: IProductParam; // Tipo de parámetro del producto
  saleParams: IProductSaleParam[]; // Parámetros de venta
  controlNamePrefix: string; // Prefijo para el nombre de control
  handleSaleProductParamsChange: (
    parentId: string,
    variantId?: string
  ) => (value?: any) => void; // Función para manejar el cambio
  onRemoveFromSale: (parentId: string, variantId?: string) => void; // Función para eliminar del carrito
}

const variantNamePrefix = "quantity-";


const ProductOptionForm: React.FC<IProductOptionFormProps> = ({
                                                                param,
                                                                saleParams,
                                                                controlNamePrefix,
                                                                handleSaleProductParamsChange,
                                                                onRemoveFromSale
                                                              }) => {
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState<number>(0);
  const getMaxQuantityValue = (variantId: string) => {
    const productP = param.relatedParams?.find(
      (p) => p._id === variantId
    );
    return productP?.quantity || 0;
  }
  // Función para manejar el cambio de tamaño
  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    setQuantity(0); // Reset quantity when the size changes
  };

  // Función para manejar el cambio de cantidad
  const handleQuantityChange = (value: number | null) => {
    setQuantity(value || 0);
  };

  // Encontramos los parámetros de venta activos para este producto
  const activeSaleParams = saleParams.filter(
    (saleParam) => saleParam.quantity !== 0
  );

  // Función para obtener el valor de cantidad
  const getQuantityValue = (parentId: string, variantId: string) => {
    const saleParam = saleParams.find(item => item._id === parentId);

      const variant = saleParam?.relatedParams?.find(
        (rp) => rp.productParam === variantId
      );
      return variant?.quantity || 0

  };

  // Función para resetear el parámetro de venta
  const resetSaleProductParam = (parentId: string, variantId: string) => () => {
    onRemoveFromSale(parentId, variantId);
  };

  return (
    <div className="product-option-form">
      <Form layout="vertical" className="form">
        <Form.Item label="Tamaño">
          <Select
            placeholder="Selecciona un tamaño"
            value={selectedSize}
            onChange={handleSizeChange}
          >
            {param.relatedParams?.map((relatedParam) => (
              <Select.Option key={relatedParam._id} value={relatedParam._id}>
                {relatedParam.value} - {relatedParam.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Cantidad">
          <InputNumber
            min={0}
            max={param.relatedParams?.find((rp) => rp._id === selectedSize)?.quantity || 0}
            value={quantity}
            onChange={handleQuantityChange}
          />
        </Form.Item>

        <Button
          type="primary"
          onClick={() =>
            handleSaleProductParamsChange(param._id, selectedSize)(quantity)
          }
          disabled={!selectedSize || quantity <= 0}
        >
          Actualizar Venta
        </Button>
      </Form>

      {/* Renderizamos las selecciones activas de tamaños para este color */}
      {activeSaleParams.map((activeParam, index) =>
        activeParam.relatedParams?.map((rp, idx) => (
          <div key={`${index}-${idx}`} className="selected-size">
            <Form.Item
              name={`${variantNamePrefix}${rp._id}`}
              rules={[
                {
                  type: "number",
                  required: true,
                  message: 'MaxQuantityError ' + getMaxQuantityValue(rp.productParam as string),
                  max: getMaxQuantityValue(rp.productParam as string),
                  min: 0
                }
              ]}
            >

            <InputNumber
              onWheel={(e ) => e.currentTarget.blur()} // Disable mouse wheel for accidental changes
              type="number"
              placeholder="Cantidad"
              value={getQuantityValue(activeParam._id as string, rp._id as string)}
              defaultValue={0}
              min={0}
              onChange={(value) => {
                if (rp.productParam) {
                  handleSaleProductParamsChange(param._id, rp.productParam)(
                    value
                  );
                }
              }}
              addonAfter={
                <CloseOutlined
                  rev=""
                  onClick={() => {
                    if (rp.productParam) {
                      resetSaleProductParam(param._id, rp.productParam)();
                    }
                  }}
                />
              }
              min={0}
            />

            </Form.Item>

          </div>
        ))
      )}
    </div>
  );
};

export default ProductOptionForm;

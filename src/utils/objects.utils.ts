import { IPaginatedResponse } from '@interfaces/pagination.interface';
import { IOption } from '@interfaces/common.intefacce';
import { ProductEntity } from '@shared/entities/ProductEntity';
import { ISale } from '@shared/entities/OrderEntity';

export function extractContent<T>(data: IPaginatedResponse<T> | T[]): T[] {
  return (data as IPaginatedResponse<T>).content
    ? (data as IPaginatedResponse<T>).content
    : (data as T[]);
}

export function parseToOptionList<T>(
  data: T[],
  valueProp: keyof T,
  labelProp: keyof T,
): IOption[] {
  return data.map((item) => ({
    label: item[labelProp] as string,
    value: item[valueProp] as string,
  }));
}

export enum ObjectQueryIdentifierEnum {
  OBJECT = '%',
}

export function parseQueryToObject<T>(path: string): T {
  const res: T = Object.fromEntries(new URLSearchParams(path)) as T;

  // TODO: remove this comment
  // const res: T = queryString.parse(path, {
  //   arrayFormat: 'comma',
  //   parseNumbers: true,
  // }) as T

  Object.keys(res as any).forEach((K: any) => {
    const v = (res as any)[K];
    if (v.includes('{') || v.includes('[')) {
      (res as any)[K] = JSON.parse(v);
    }
  });

  return res;
}

export const getSaleDataFromProduct = (
  product: ProductEntity,
): Partial<ISale> => ({
  product,
  productId: product._id,
  company: product.company,
  unitPrice: product.price,
  unitCost: product.cost,
  // params: [{
  //   ...product.productParams[0],
  //   productParams: product.productParams[0]._id,
  //   quantity: 1,
  //   price: product.price,
  //   cost: product.cost,
  // } as IProductSaleParam],
});

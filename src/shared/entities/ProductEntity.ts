import { CategoryEntity } from '@shared/entities/CategoryEntity';
import { BaseEntity } from './BaseEntity';

export class ProductEntity extends BaseEntity {
  name: string = '';

  slug: string = '';

  price: number = 0;

  wholeSale?: string = '';

  cost?: number = 0;

  commission?: number = 0;

  image: string = '';

  images: string[] = [];

  flyerOptions?: string = '';

  GodWord?: string = '';

  productImage?: string = '';

  description: string = '';

  company: string = '';

  shortID: string = '';

  stock: number = 0;

  newArrival?: boolean = false;

  productParams: IProductParam[] = [];

  category: CategoryEntity = new CategoryEntity();

  tags?: string[];
}

export type ProductParamTypes = 'color' | 'size';
export interface IProductParam {
  _id: string
  quantity?: number
  value?: string
  label?: string
  type: ProductParamTypes
  productId: string
  isRelated?: boolean
  relatedParams?: IProductParam[]
}
export interface IProductSaleParam {
  _id?: string
  quantity?: number
  productQuantity?: number
  value?: string
  label?: string
  locator?: string // this is not in the db
  productParam?: string
  type: ProductParamTypes
  productId?: string
  isRelated?: boolean
  isChild?: boolean
  relatedParams?: IProductSaleParam[]
}

export type IProductPerCategory = {
  category: CategoryEntity;
  products: ProductEntity[];
};

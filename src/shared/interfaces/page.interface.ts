import { IMetadata } from '@components/MetaHeaders/MetaHeaders';
import { CompanyEntity } from '@shared/entities/CompanyEntity';
import { IProductPerCategory, ProductEntity } from '@shared/entities/ProductEntity';
import { CategoryEntity } from '@shared/entities/CategoryEntity';
import { ICachedResourceResponse } from '../../utils/server-side.utils';

export interface ISSGPageProps {
  metadata: IMetadata;
  currentCompany?: CompanyEntity;
  cachedResources?: ICachedResourceResponse<ProductEntity | CompanyEntity | CategoryEntity>;
  productsPerCategory?: IProductPerCategory[] | null;
}

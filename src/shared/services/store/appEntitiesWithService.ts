import { StoreApi, UseBoundStore } from "zustand";
import { IEntityStore } from "@services/store/entityStore";
import { ProductEntity } from "@models/ProductEntity";
import { BaseEntity } from "@models/BaseEntity";
import { BaseService } from "@services/BaseService";
import { ProductService } from "@services/productService";

export type EntityNamesType = "product";

export type EntityPerServiceType = {
  [N in EntityNamesType]: {
    entity: BaseEntity | any;
    service: BaseService<any>;
  };
};

export const appEntitiesWithService: EntityPerServiceType = {
  product: {
    entity: new ProductEntity(),
    service: new ProductService(),
  },
};

export type AppEntitiesStoreType = {
  [N in EntityNamesType]: UseBoundStore<
    StoreApi<IEntityStore<typeof appEntitiesWithService[N]>>
  >;
};

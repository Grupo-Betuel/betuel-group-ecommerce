import { EntityNamesType } from '@services/appEntitiesWithService';
import { CRUDTypes } from '@interfaces/CRUD.interface';
import { http } from '@services/utils/http.util';
import {
  AbstractBaseService,
  CallbackType,
  HandleErrorType,
} from '@interfaces/baseService.interface';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IResponseError } from '@interfaces/error.interface';
import { EndpointsAndEntityStateKeys } from '@shared/enums/endpoints.enum';
import { IPaginatedResponse } from '@interfaces/pagination.interface';
import { deepMatch } from '../../utils/matching.util';
import { extractContent } from '../../utils/objects.utils';

export interface IServiceMethodProperties<T> {
  queryParams?: { [N in keyof T]: any } | any;
  endpoint?: EndpointsAndEntityStateKeys;
  slug?: string;
  storeDataInStateKey?: EndpointsAndEntityStateKeys | string;
  queryString?: string;
}

export type LocalStorageKeysType = {
  [N in CRUDTypes]: string;
};

export class BaseService<T> implements AbstractBaseService<T> {
  version = 'v1';

  apiPrefix = 'api';

  api = '';

  localStorageKey: LocalStorageKeysType;

  constructor(public entity: EntityNamesType) {
    this.api = `${this.apiPrefix}/${this.entity}`;
    this.localStorageKey = {
      get: `store-app:get::${this.entity}`,
      add: `store-app:add::${this.entity}`,
      update: `store-app:update::${this.entity}`,
      remove: `store-app:remove::${this.entity}`,
    };
  }

  // eslint-disable-next-line consistent-return
  async get(
    // eslint-disable-next-line @typescript-eslint/default-param-last
    properties: IServiceMethodProperties<T> = {} as IServiceMethodProperties<T>,
    callback: CallbackType<T> = () => {},
    handleError: HandleErrorType = () => {},
    enableCache = false,
    cacheLifeTime: number = 60 * 1000 * 5,
  ): Promise<T[] | IPaginatedResponse<T> | undefined> {
    try {
      let cached = null;
      if (enableCache) {
        cached = this.getCachedData('get', properties);
        if (cached && (cached as any)?.length) {
          callback(cached, true);
        }
      }

      const extraPath = this.handleServiceMethodPathProperties(properties);

      let { data } = await http.get<T[] | IPaginatedResponse<T>>(
        `${this.api}${extraPath}`,
        {
          params: { ...properties.queryParams },
        },
      );

      if (
        enableCache
        && (!!(data as any)?.length || (data as any)?.content?.length)
      ) {
        const cachedData: T[] = this.cacheData(
          extractContent(data),
          'get',
          cacheLifeTime,
          properties,
        ) as T[];

        if (cachedData && (data as IPaginatedResponse<T>).content) {
          (data as IPaginatedResponse<T>).content = this.getCachedData('get', properties) as any;
        } else if (cachedData) {
          data = cachedData;
        }
      }

      if ((!cached || !(cached as any).length) || (data as IPaginatedResponse<T>).content) {
        (data as IPaginatedResponse<T>).content = (cached
          || (data as IPaginatedResponse<T>).content) as any;
        callback((data as T[]) || []);
      }

      return data;
    } catch (err: any) {
      handleError && handleError(err?.data ? err.data.message : err?.message);
      // nothing
    }
  }

  // eslint-disable-next-line consistent-return
  async add(
    data: T,
    properties: IServiceMethodProperties<T> = {} as IServiceMethodProperties<T>,
    handleError?: HandleErrorType,
    enableCache = true,
    cacheLifeTime: number = 60 * 1000 * 5,
  ): Promise<T | undefined> {
    try {
      if ((data as any)._id || (data as any)._id === '') {
        delete (data as any)._id;
      }
      const extraPath = this.handleServiceMethodPathProperties(properties);
      const res = await http.post<T>(`${this.api}${extraPath}`, data);

      enableCache && this.cacheData(res.data, 'add', cacheLifeTime);
      return res.data as T;
    } catch (err: IResponseError | any) {
      console.log('error!', err);
      err && handleError && handleError(err);
    }
  }

  // eslint-disable-next-line consistent-return
  async update(
    data: { _id: string } & Partial<T>,
    handleError?: HandleErrorType,
    enableCache = true,
    cacheLifeTime: number = 60 * 1000 * 5,
  ): Promise<T | undefined> {
    try {
      const res = await http.put(`${this.api}`, data);
      enableCache && this.cacheData(res.data as T, 'add', cacheLifeTime);
      return res as T;
    } catch (err: IResponseError | any) {
      handleError && handleError(err.data.message);
    }
  }

  // eslint-disable-next-line consistent-return
  async remove(
    id: string,
    handleError?: HandleErrorType,
    enableCache = true,
    cacheLifeTime: number = 60 * 1000 * 5,
  ): Promise<boolean | undefined> {
    try {
      const { data } = await http.delete<T>(`${this.api}/${id}`);
      enableCache && this.cacheData(data, 'remove', cacheLifeTime);
      return !!data;
    } catch (err: IResponseError | any) {
      handleError && handleError(err.data.message);
    }
  }

  getCacheKey = (key: CRUDTypes, properties?: IServiceMethodProperties<T>) => `${this.localStorageKey[key]}-${
    properties?.storeDataInStateKey || properties?.endpoint || 'default'
  }`;

  cacheData(
    data: T | T[],
    key: CRUDTypes,
    cacheLifeTime: number,
    properties?: IServiceMethodProperties<T>,
  ): T | T[] {
    if (key === 'get') {
      let oldData: T[] = [];

      if (
        properties
        && properties.storeDataInStateKey?.includes(
          EndpointsAndEntityStateKeys.INFINITE_SCROLL_DATA,
        )
      ) {
        oldData = JSON.parse(
          localStorage.getItem(this.getCacheKey(key, properties)) || '[]',
        );
      }

      const items: T[] = [...oldData, ...(data as T[])];
      const itemsData: T[] = Array.from(
        new Set(items.map((item: any) => JSON.stringify(item))),
      ).map((id) => JSON.parse(id) as T);
      // items.find((item: any) => item._id === id)
      // ) as T[];
      // when key is get just will be cached if it's longer than 1 item
      itemsData.length
        && itemsData.length > 1
        && localStorage.setItem(
          this.getCacheKey(key, properties),
          JSON.stringify(itemsData),
        );
      return itemsData;
    }
    localStorage.setItem(this.localStorageKey[key], JSON.stringify(data));

    // automatic remove cache
    setTimeout(
      (key: string) => {
        localStorage.removeItem(key);
      },
      cacheLifeTime,
      this.localStorageKey[key],
    );

    return data;
  }

  getCachedData(
    key: CRUDTypes,
    properties?: IServiceMethodProperties<T>,
  ): T | T[] | null {
    const cached = localStorage.getItem(this.getCacheKey(key, properties));
    if (cached && cached !== '[]' && cached !== '{}') {
      const data = JSON.parse(cached);
      const value = properties?.queryParams?.title || properties?.slug;
      const page = properties?.queryParams?.page;
      const limit = properties?.queryParams?.limit;
      const res = value ? deepMatch(value, data) : data;
      if (page && limit) {
        return res.slice(0, page * limit);
      }

      return res;
    }

    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  handleServiceMethodPathProperties(properties: IServiceMethodProperties<T>) {
    let extraPath = '';

    if (properties.endpoint) {
      extraPath = `/${properties.endpoint}`;
    }

    if (properties.slug) {
      if (typeof properties.slug === 'object') {
        extraPath = `${extraPath}/${(properties.slug as any[]).join('/')}`;
      } else {
        extraPath = `${extraPath}/${properties.slug}`;
      }
    }

    if (properties.queryString) {
      extraPath = `${extraPath}?${properties.queryString}`;
    }

    return extraPath;
  }
}

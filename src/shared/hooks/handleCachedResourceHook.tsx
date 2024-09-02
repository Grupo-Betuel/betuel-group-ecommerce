import { ICachedResourceResponse } from '../../utils/server-side.utils';

export function handleCachedResourceHook<T>(cachedResources: ICachedResourceResponse<T>) {
  // useEffect(() => {
  //   if (cachedResources?.error) {
  //     if (cachedResources?.error?.status === 404) {
  //       location.href = '/';
  //     }
  //   }
  // }, [cachedResources?.error]);

  // const sitemap = cachedResources?.sitemapURL && (
  //   <div
  //     style={{ display: 'none' }}
  //     dangerouslySetInnerHTML={{ __html: cachedResources.sitemapURL }}
  //   />
  // );

  return {
    sitemapURL: cachedResources?.sitemapURL,
    jsonld: cachedResources?.jsonld,
    canonical: cachedResources?.canonical,
  };
}

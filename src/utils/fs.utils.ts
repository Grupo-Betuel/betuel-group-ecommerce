import fs from 'fs';
import { BaseEntity } from '@shared/entities/BaseEntity';
import * as path from 'path';
import * as os from 'os';
import { ProductEntity } from '@shared/entities/ProductEntity';
import { CompanyEntity } from '@shared/entities/CompanyEntity';
import { CategoryEntity } from '@shared/entities/CategoryEntity';
import { generateCategorySitemapXml, generateCompanySitemapXml, generateProductSitemapXML } from './seo.utils';
import { BETUEL_GROUP_ECOMMERCE_URL } from './constants/url.constants';

export const getProductSiteMapUrL = (product: ProductEntity) => `${BETUEL_GROUP_ECOMMERCE_URL}sitemaps/products/${product._id}.xml`;
export const getCategorySiteMapUrL = (category: CategoryEntity) => `${BETUEL_GROUP_ECOMMERCE_URL}sitemaps/categories/${category._id}.xml`;
export const getProductSitemapFilePath = (product: ProductEntity) => path.join(process.cwd(), 'public/sitemaps/products', `${product._id}.xml`);
export const getCompanySitemapFilePath = (company: CompanyEntity) => path.join(process.cwd(), 'public/sitemaps/companies', `${company._id}.xml`);
export const getCategorySitemapFilePath = (category: CategoryEntity) => path.join(process.cwd(), 'public/sitemaps/categories', `${category._id}.xml`);
export const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');

const tmpDir = os.tmpdir();

export type CachedResourceType = 'companies' | 'products' | 'categories';
export const getCachePath = (
  id: string,
  type: CachedResourceType,
) => path.join(tmpDir, `data/${type}/${id}.json`);

export async function setCachedResource<T>(
  product: T & BaseEntity,
  type: CachedResourceType,
  id?: string,
) {
  // fs.writeFile(getCachePath(id || product._id, type), JSON.stringify(product), () => {
  //   console.log('cached');
  // });
  product && await fs.writeFileSync(getCachePath(id || product._id, type), JSON.stringify(product));
}
export async function getCachedResources<T>(id: string, type: CachedResourceType) {
  if (!id) return;
  if (await fs.existsSync(getCachePath(id, type))) {
    const data = JSON.parse((await fs.readFileSync(getCachePath(id, type), 'utf8')) || '{}') as T;
    return JSON.stringify(data) === '{}' ? undefined : data;
  }
}

export function saveProductSitemap(product: ProductEntity) {
  const productSitemapPath = getProductSitemapFilePath(product);
  const productSitemapContent = generateProductSitemapXML(product);
  fs.writeFile(productSitemapPath, productSitemapContent, (err) => {
    if (err) {
      console.error(`Error writing to file ${productSitemapPath}:`, err);
    } else {
      // console.log(`File ${productSitemapPath} has been written.`);
    }
  });
}

export function saveCompanySitemap(company: CompanyEntity) {
  const companySitemapPath = getCompanySitemapFilePath(company);
  const companySitemapContent = generateCompanySitemapXml(company);
  fs.writeFile(companySitemapPath, companySitemapContent, (err) => {
    if (err) {
      console.error(`Error writing to file ${companySitemapPath}:`, err);
    } else {
      // console.log(`File ${companySitemapPath} has been written.`);
    }
  });
}

export function saveCategorySitemap(category: CategoryEntity) {
  const categorySitemapPath = getCategorySitemapFilePath(category);
  const categorySitemapContent = generateCategorySitemapXml(category);
  fs.writeFile(categorySitemapPath, categorySitemapContent, (err) => {
    if (err) {
      console.error(`Error writing to file ${categorySitemapPath}:`, err);
    } else {
      // console.log(`File ${categorySitemapPath} has been written.`);
    }
  });
}

let SitemapUrlsGlobal: string[] = [];

const saveSiteMapURLSGLOBAL = (urls: string[]) => {
  SitemapUrlsGlobal = Array.from(new Set([...SitemapUrlsGlobal, ...urls]));
};

export const handleSitemapsOnRobotFile = (sitemapsUrls: string[]) => {
  saveSiteMapURLSGLOBAL(sitemapsUrls);
  const initRobot = `# Allow all crawlers
User-agent: *
Allow: /

User-agent: *
Allow: /betueldance


User-agent: *
Allow: /betueltech


User-agent: *
Allow: /dixybaby

User-agent: *
Allow: /betueldance/products

User-agent: *
Allow: /betueltech/products


User-agent: *
Allow: /dixybaby/products


User-agent: *
Allow: /betueldance/category

User-agent: *
Allow: /betueltech/category


User-agent: *
Allow: /dixybaby/category


# Block all crawlers for /accounts
User-agent: *
Disallow: /client/orders

# Companies Sitemaps
Sitemap: https://www.grupobetuel.store/sitemaps/companies/64b1face11f4e040457b7cc7.xml
Sitemap: https://www.grupobetuel.store/sitemaps/companies/64b1fb876fa96313c2cf6d56.xml
Sitemap: https://www.grupobetuel.store/sitemaps/companies/64ebe0aa43d62267fb0ecff6.xml
Sitemap: https://www.grupobetuel.store/sitemaps/companies/64ec04e0014f86812d4ad9ab.xml`;

  const robotContent = `${initRobot}\n\nSitemap: ${SitemapUrlsGlobal.join('\nSitemap: ')}`;

  fs.writeFile(robotsPath, robotContent, (err) => {
    if (err) {
      console.error('Error writing robots.txt:', err);
    } else {
      // console.log(`File ${companySitemapPath} has been written.`);
    }
  });
};

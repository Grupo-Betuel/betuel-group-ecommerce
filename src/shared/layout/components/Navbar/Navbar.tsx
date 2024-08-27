import { Header } from 'antd/lib/layout/layout';
import {
  Avatar, Badge, Dropdown, Menu, Modal, Space,
} from 'antd';
import {
  BankOutlined,
  CloseOutlined,
  DatabaseOutlined,
  DownOutlined,
  HomeOutlined, MenuOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { HandleAuthVisibility } from '@shared/components';
import { useContextualRouting } from 'next-use-contextual-routing';
import { Auth } from '@screens/Auth/Auth';
import { ShoppingCartDrawer } from 'src/shared/components/ShoppingCartDrawer';
import React, { useEffect, useState } from 'react';
import { handleEntityHook } from '@shared/hooks/handleEntityHook';
import { EndpointsAndEntityStateKeys } from '@shared/enums/endpoints.enum';
import { CategoryEntity } from '@shared/entities/CategoryEntity';
import { MenuItemType } from 'antd/es/menu/hooks/useItems';
import Link from 'next/link';
import { useAuthClientHook } from '@shared/hooks/useAuthClientHook';
import { CompanyEntity } from '@shared/entities/CompanyEntity';
import { useRouter } from 'next/router';
import { useOrderContext } from '@shared/contexts/OrderContext';
import { useAppStore } from '@services/store';
import Sider from 'antd/lib/layout/Sider';
import Image from 'next/image';
import { appLogOut } from '../../../../utils/auth.utils';
import styles from './Navbar.module.scss';

const navbarOptionsLimit = 3;

export default function Navbar() {
  const [companyName, setCompanyName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showSidebar, setHideSidebar] = useState(true);
  const router = useRouter();
  const { makeContextualHref, returnHref } = useContextualRouting();
  const authIsEnable = router.query.auth;
  const {
    get: getCategories,
    [EndpointsAndEntityStateKeys.BY_COMPANY]: companyCategories,
  } = handleEntityHook<CategoryEntity>('categories');

  const { data: companies } = handleEntityHook<CompanyEntity>(
    'companies',
    true,
    {
      queryParams: {
        type: 'store',
      },
    },
  );
  const [navbarOptions, setNavbarOptions] = useState<MenuItemType[]>([]);
  const { client } = useAuthClientHook();
  const [selectedCompanies, setSelectedCompanies] = useState<CompanyEntity[]>(
    [],
  );

  const salesQuantityData = useAppStore((
    state,
  ) => state.currentOrder?.sales.reduce((
    acc,
    sale,
  ) => acc + sale.quantity, 0));

  const [salesQuantity, setSalesQuantity] = useState(0);

  useEffect(() => {
    // if (salesQuantityData || salesQuantityData === 0) {
    setSalesQuantity(salesQuantityData);
    // }
  }, [salesQuantityData]);

  const { cartIsOpen, toggleCart } = useOrderContext();

  useEffect(() => {
    const company = router.query.company as string;
    const category = router.query.category as string;
    if (!categoryId && category) {
      setCategoryId(category);
    }
    // getting categories per company
    if (company && !companyName) {
      getCategories({
        endpoint: EndpointsAndEntityStateKeys.BY_COMPANY,
        slug: company,
      });
    }
    setCompanyName(company);
  }, [router.query]);

  useEffect(() => {
    let data = [];
    if (companyName) {
      data = parseCatToMenuItem(companyCategories?.data || []);
    } else {
      data = parseCompaniesToMenuItem(companies || []);
    }
    const company = companies.find((c) => c.companyId === companyName);
    company ? setSelectedCompanies([company]) : setSelectedCompanies([]);

    setNavbarOptions(data as any);
  }, [companies, companyCategories?.data, companyName]);

  const parseCatToMenuItem = (cats: CategoryEntity[]) => cats.map((cat) => ({
    key: cat.slug,
    title: (
      <Link href={`/${cat.company}/category/${cat.slug}`}>
        <a className={styles.navbarOptionsListItemLink}>{cat.title}</a>
      </Link>
    ),
    label: (
      <Link href={`/${cat.company}/category/${cat.slug}`}>
        <a className={styles.navbarOptionsListItemLink}>{cat.title}</a>
      </Link>
    ),
    icon: <DatabaseOutlined rev="" />,
    onClick: (event: any) => {
      if (event.ctrlKey || event.metaKey) return;
      setHideSidebar(true);
    },
  }));

  const parseCompaniesToMenuItem = (
    companies: CompanyEntity[],
  ) => companies.map((
    company,
  ) => ({
    key: company.companyId,
    title: (
      <Link href={`/${company.companyId}`}>
        <a className={styles.navbarOptionsListItemLink}>{company.name}</a>
      </Link>
    ),
    // label: company.name,
    label: (
      <Link href={`/${company.companyId}`}>
        <a className={styles.navbarOptionsListItemLink}>{company.name}</a>
      </Link>
    ),
    icon: <BankOutlined rev="" />,
    onClick: (event: any) => {
      if (event.ctrlKey || event.metaKey) return;
      setSelectedCompanies([company]);
      setHideSidebar(true);
    },
  }));

  const authenticate = () => {
    router.push(makeContextualHref({ auth: true } as any), '/client/auth', {
      shallow: true,
    });
  };
  const handleReturnToHref = () => router.push(returnHref);

  return (
    <>
      <Header className={styles.navbar}>
        <div
          className={`grid-container grid-column-full px-xx-l ${styles.navbarOptionsWrapper}`}
        >
          <div
            className={`${styles.navbarLogoContainer} flex-start-center gap-l`}
          >
            <Link href="/">
              <a className="text-black d-flex">
                <HomeOutlined rev="" style={{ fontSize: '30px', top: '-2px', position: 'relative' }} />
              </a>
            </Link>
            {selectedCompanies.map((company) => (
              <Link
                href={`/${company.companyId}`}
                className="cursor-pointer"
                key={company._id}
              >
                <a className="d-flex">
                  <Image
                    width={35}
                    height={35}
                    className={styles.navbarLogo}
                    src={company.logo}
                    alt="logo"
                  />
                </a>
              </Link>
            ))}
          </div>
          <div
            className={`${styles.navbarOptionsList} ${styles.navbarOptionsListCenter} flex-center-center`}
          >
            {navbarOptions
              .slice(0, navbarOptionsLimit)
              .map((navOption: MenuItemType, i) => (
                <div
                  key={`nav-option-${i}`}
                  className={`${styles.navbarOptionsListItem} ${
                    router.query.category === navOption.key
                      ? styles.navbarOptionsListItemActive
                      : ''
                  }`}
                  onClick={navOption.onClick as any}
                >
                  {navOption.title}
                </div>
              ))}
            {navbarOptions.length > navbarOptionsLimit && (
              <div className={styles.navbarOptionsListItem}>
                <Dropdown
                  menu={{
                    items: navbarOptions.slice(navbarOptionsLimit) as any,
                    selectable: true,
                    selectedKeys: [router.query.category as string],
                  }}
                  trigger={['click']}
                >
                  <Space>
                    Más
                    <DownOutlined rev="" />
                  </Space>
                </Dropdown>
              </div>
            )}
          </div>

          <div className={`${styles.navbarOptionsList} flex-end-center`}>
            <HandleAuthVisibility visibleOn="no-auth">
              <div
                className={styles.navbarOptionsListItem}
                onClick={authenticate}
              >
                Iniciar Sesion
              </div>
            </HandleAuthVisibility>
            <HandleAuthVisibility visibleOn="auth">
              <div className={styles.navbarOptionsListItem}>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'profile',
                        onClick: () => (location.href = '/client/profile'),
                        label: 'Perfil',
                      },
                      {
                        key: 'my-orders',
                        onClick: () => router.push('/client/orders'),
                        label: 'Mis Ordenes',
                      },
                      {
                        key: 'sign-out',
                        onClick: () => appLogOut(),
                        label: 'Cerrar Sesión',
                      },
                    ] as any,
                    selectable: true,
                    selectedKeys: [router.query.category as string],
                  }}
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <Space>
                    <Avatar size={40}>
                      {client?.firstName?.substring(0, 1)?.toUpperCase()}
                      {client?.lastName?.substring(0, 1)?.toUpperCase()}
                    </Avatar>
                  </Space>
                </Dropdown>
              </div>
            </HandleAuthVisibility>
            <div className={styles.navbarOptionsListItem} onClick={toggleCart}>
              <Badge count={!cartIsOpen ? salesQuantity : 0}>
                {cartIsOpen ? (
                  <CloseOutlined rev="" style={{ fontSize: '24px' }} />
                ) : (
                  <ShoppingOutlined rev="" style={{ fontSize: '24px' }} />
                )}
              </Badge>
            </div>
          </div>
        </div>
      </Header>
      {!!authIsEnable && (
        <Modal
          title=""
          open={!!authIsEnable}
          afterClose={handleReturnToHref}
          onCancel={handleReturnToHref}
          footer={[]}
        >
          <Auth isModal />
        </Modal>
      )}
      {cartIsOpen && (
        <ShoppingCartDrawer open={cartIsOpen} onClose={toggleCart} />
      )}

      <Sider
        trigger={(
          <div className={styles.navbarSidebarTrigger}>
            {showSidebar ? <MenuOutlined className="font-size-9" rev /> : <CloseOutlined className="font-size-9" rev />}
          </div>
        )}
        className={styles.navbarSidebar}
        collapsible={!cartIsOpen}
        collapsedWidth={0}
        collapsed={showSidebar}
        onCollapse={(value) => setHideSidebar(value)}
        zeroWidthTriggerStyle={{
          top: '-50px', zIndex: 100, left: '5px', border: 'none', fontSize: '21px',
        }}
        theme="light"
      >
        {!showSidebar
            && (
            <>
              <div className="demo-logo-vertical" />
              <Menu
                style={{ height: '100dvh' }}
                theme="light"
                defaultSelectedKeys={['1']}
                mode="inline"
                items={navbarOptions}
              />
            </>
            )}
      </Sider>

    </>
  );
}

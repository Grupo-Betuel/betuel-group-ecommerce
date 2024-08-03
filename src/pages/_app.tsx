// import '@styles/globals.scss';
// import type { AppProps } from 'next/app';
// import AppLayout from '@shared/layout';
// import {
//   Button, ConfigProvider, Result, Spin,
// } from 'antd';
// import React, { useEffect, useMemo, useState } from 'react';
// import 'react-toastify/dist/ReactToastify.css';
// import { ToastContainer } from 'react-toastify';
// import { useAppStore } from '@services/store';
// import { AppLoadingContext } from '@shared/contexts/AppLoadingContext';
// import { AppViewportHeightContext } from '@shared/contexts/AppViewportHeightContext';
// import { OrderContext } from '@shared/contexts/OrderContext';
// import OrderService from '@services/orderService';
// import { useAuthClientHook } from '@shared/hooks/useAuthClientHook';
// import Link from 'next/link';
// import Head from 'next/head';
// import LoadingBar from 'react-top-loading-bar';
// import { useRouter } from 'next/router';
// // import { Analytics } from '@vercel/analytics/react';
// import { handleLoginHook } from '@shared/hooks/handleLoginHook';
// import { FROM_TARGET_KEY } from '@shared/constants/seo.constants';
// import { defaultValidateMessages as validateMessages } from '../config/form-validation.config';
// import { defaultTheme } from '../config/theme.config';
//
// export interface IAppProps {
//   protected?: boolean;
// }
//
// export enum AppViewportHeightClassNames {
//   WITH_NAVBAR = 'FullAppViewPortHeight',
//   WITH_NAVBAR_OPTION = 'FullAppViewPortHeightNavbarOptions',
// }
//
// function MyApp({ Component, pageProps }: AppProps<IAppProps>) {
//   const clientEntity = useAppStore((state) => state.clients((s) => s));
//   const productEntity = useAppStore((state) => state.products((s) => s));
//   const [appLoading, setAppLoading] = useState<boolean>();
//   const [
//     appViewportHeightClassName,
//     setAppViewportHeightClassName,
//   ] = useState<AppViewportHeightClassNames>(
//     AppViewportHeightClassNames.WITH_NAVBAR_OPTION,
//   );
//
//   const orderService = useMemo(() => new OrderService(), []);
//   const [cartIsOpen, setCartIsOpen] = useState(false);
//
//   const { client } = useAuthClientHook();
//   const [progress, setProgress] = useState(0);
//   const router = useRouter();
//   const { login } = handleLoginHook();
//
//   const toggleShoppingCart = () => setCartIsOpen(!cartIsOpen);
//
//   // const onChangeLayoutAffix = (affixed?: boolean) => {
//   //   if (affixed) {
//   //     // setAppViewportHeightClassName(
//   //     //   AppViewportHeightClassNames.WITH_NAVBAR_OPTION
//   //     // )
//   //   } else {
//   //     // setAppViewportHeightClassName(AppViewportHeightClassNames.WITH_NAVBAR)
//   //   }
//   // };
//   const [companyId, setCompanyId] = useState<string>();
//   const [seoUrl, setSeoUrl] = useState<string>('');
//
//   useEffect(() => {
//     const companyName = location.pathname.split('/')[1];
//     if (companyName !== companyId) {
//       setCompanyId(companyName + (companyName ? '/' : ''));
//     }
//     setSeoUrl(location.href);
//   }, [router.pathname]);
//
//   const handleQueryParams = async () => {
//     setAppLoading(true);
//
//     const queryString = window.location.search;
//     const parameters = new URLSearchParams(queryString);
//     const orderId = parameters.get('orderId');
//     const phone = parameters.get('phone');
//     const from = parameters.get('from');
//     if (from) {
//       localStorage.setItem(FROM_TARGET_KEY, from as string);
//     }
//     if (!cartIsOpen && orderId) setCartIsOpen(true);
//     if (phone) {
//       const pathname = window.location.pathname;
//       await login({ phone });
//       await orderService.initLocalOrder();
//       router.replace({
//         pathname: pathname || '',
//         query: {},
//       }, undefined, { shallow: true });
//     }
//
//     setAppLoading(false);
//   };
//
//   useEffect(() => {
//     handleQueryParams();
//   }, []);
//
//   useEffect(() => {
//     setAppLoading(!!clientEntity.loading || !!productEntity.loading);
//   }, [clientEntity.loading, productEntity.loading]);
//
//   useEffect(() => {
//     // START VALUE - WHEN LOADING WILL START
//     router.events.on('routeChangeStart', () => {
//       setProgress(40);
//     });
//
//     // COMPLETE VALUE - WHEN LOADING IS FINISHED
//     router.events.on('routeChangeComplete', () => {
//       setProgress(100);
//     });
//   }, []);
//
//   if (pageProps.protected && !client) {
//     return (
//       <Result
//         status="403"
//         title="403"
//         subTitle="Lo sentimos, No estas autorizado para entrar a esta pagina."
//         extra={(
//           <>
//             <Link href="/client/auth">
//               <a>
//                 <Button type="primary">Iniciar Sesion</Button>
//               </a>
//             </Link>
//             <Link href="/">
//               <a>
//                 <Button type="default">Ir al inicio</Button>
//               </a>
//             </Link>
//           </>
//         )}
//       />
//     );
//   }
//
//   // @ts-ignore
//   // @ts-ignore
//   // @ts-ignore
//   // @ts-ignore
//   return (
//     <>
//       <Head>
//         <link
//           rel="apple-touch-icon"
//           sizes="180x180"
//           href={`/images/${companyId}apple-touch-icon.png`}
//         />
//         <link
//           rel="icon"
//           type="image/png"
//           sizes="32x32"
//           href={`/images/${companyId}favicon-32x32.png`}
//         />
//         <link
//           rel="icon"
//           type="image/png"
//           sizes="16x16"
//           href={`/images/${companyId}favicon-16x16.png`}
//         />
//         <link rel="manifest" href={`/images/${companyId}site.webmanifest`} />
//         <link
//           rel="mask-icon"
//           href={`/images/${companyId}safari-pinned-tab.svg`}
//           color="#5bbad5"
//         />
//         <meta name="msapplication-TileColor" content="#da532c" />
//         <meta name="theme-color" content="#ffffff" />
//         <meta property="og:locale" content="es_ES" />
//
//         {/* <link rel=“canonical” href=“https://example.com/sample-page/” /> */}
//         <meta property="og:url" content={seoUrl} />
//         <meta property="fb:app_id" content="1304512236864343" />
//         {/* Google tag (gtag.js) */}
//         <script
//           async
//           src="https://www.googletagmanager.com/gtag/js?id=AW-11423261608"
//         />
//         <script
//           dangerouslySetInnerHTML={{
//             __html: `
//        window.dataLayer = window.dataLayer || [];
//         function gtag()
//         {
//           dataLayer.push(arguments)
//         }
//         gtag('js', new Date());
//         gtag('config', 'AW-11423261608');`,
//           }}
//         />
//       </Head>
//
//       <ConfigProvider form={{ validateMessages }} theme={defaultTheme}>
//         {appLoading && (
//           <div className="loading">
//             <Spin size="large" />
//           </div>
//         )}
//
//         {/* TODO: Check if global posts filters is neccesarry */}
//         <AppLoadingContext.Provider value={{ appLoading, setAppLoading }}>
//           <OrderContext.Provider
//             value={{
//               orderService,
//               toggleCart: toggleShoppingCart,
//               cartIsOpen,
//             }}
//           >
//             <AppViewportHeightContext.Provider
//               value={{
//                 appViewportHeightClassName,
//                 setAppviewPortHeightClassName: setAppViewportHeightClassName,
//               }}
//             >
//               <LoadingBar
//                 height={4}
//                 color="rgb(180, 130, 251)"
//                 progress={progress}
//                 onLoaderFinished={() => {
//                   setProgress(0);
//                 }}
//                 waitingTime={400}
//               />
//               <AppLayout>
//                 {/* <Affix */}
//                 {/*  offsetTop={navbarOptionsHeight} */}
//                 {/*  target={() => document.getElementById(layoutId)} */}
//                 {/*  onChange={onChangeLayoutAffix} */}
//                 {/*  children="" */}
//                 {/* /> */}
//                 <Component {...pageProps} />
//               </AppLayout>
//             </AppViewportHeightContext.Provider>
//           </OrderContext.Provider>
//         </AppLoadingContext.Provider>
//         <ToastContainer />
//       </ConfigProvider>
//       {/* <Analytics /> */}
//     </>
//   );
// }
//
// export default MyApp;

import '@styles/globals.scss';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button, ConfigProvider, Result, Spin,
} from 'antd';
import { ToastContainer } from 'react-toastify';
import { useAppStore } from '@services/store';
import { AppLoadingContext } from '@shared/contexts/AppLoadingContext';
import { AppViewportHeightContext } from '@shared/contexts/AppViewportHeightContext';
import { OrderContext } from '@shared/contexts/OrderContext';
import { useAuthClientHook } from '@shared/hooks/useAuthClientHook';
import { handleLoginHook } from '@shared/hooks/handleLoginHook';
import { FROM_TARGET_KEY } from '@shared/constants/seo.constants';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import LoadingBar from 'react-top-loading-bar';
import OrderService from '@services/orderService';
import { ImageCacheProvider } from '@shared/contexts/ImageCacheContext';
import { defaultTheme } from '../config/theme.config';
import { defaultValidateMessages as validateMessages } from '../config/form-validation.config';
import 'react-toastify/dist/ReactToastify.css';

// Dynamic imports
const AppLayout = dynamic(() => import('@shared/layout'), { ssr: false });

export enum AppViewportHeightClassNames {
  WITH_NAVBAR = 'FullAppViewPortHeight',
  WITH_NAVBAR_OPTION = 'FullAppViewPortHeightNavbarOptions',
}

export interface IAppProps {
  protected?: boolean;
}

const MyApp = ({ Component, pageProps }: AppProps<IAppProps>) => {
  const clientEntity = useAppStore((state) => state.clients((s) => s));
  const productEntity = useAppStore((state) => state.products((s) => s));
  const [appLoading, setAppLoading] = useState<boolean>();
  const [appViewportHeightClassName,
    setAppViewportHeightClassName] = useState<AppViewportHeightClassNames>(
    AppViewportHeightClassNames.WITH_NAVBAR_OPTION,
  );
  const orderService = useMemo(() => new OrderService(), []);
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const { client } = useAuthClientHook();
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const { login } = handleLoginHook();
  const [companyId, setCompanyId] = useState<string>('');
  const [seoUrl, setSeoUrl] = useState<string>('');

  const toggleShoppingCart = () => setCartIsOpen(!cartIsOpen);

  useEffect(() => {
    const companyName = location.pathname.split('/')[1];
    if (companyName !== companyId) {
      setCompanyId(companyName + (companyName ? '/' : ''));
    }
    setSeoUrl(location.href);
  }, [router.pathname]);

  const handleQueryParams = async () => {
    setAppLoading(true);
    const queryString = window.location.search;
    const parameters = new URLSearchParams(queryString);
    const orderId = parameters.get('orderId');
    const phone = parameters.get('phone');
    const from = parameters.get('from');
    if (from) {
      localStorage.setItem(FROM_TARGET_KEY, from);
    }
    if (!cartIsOpen && orderId) setCartIsOpen(true);
    if (phone) {
      await login({ phone });
      await orderService.initLocalOrder();
      router.replace(
        { pathname: window.location.pathname, query: {} },
        undefined,
        { shallow: true },
      );
    }
    setAppLoading(false);
  };

  useEffect(() => {
    handleQueryParams();
  }, []);

  useEffect(() => {
    setAppLoading(!!clientEntity.loading || !!productEntity.loading);
  }, [clientEntity.loading, productEntity.loading]);

  useEffect(() => {
    const handleRouteChangeStart = () => setProgress(40);
    const handleRouteChangeComplete = () => setProgress(100);
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  if (pageProps.protected && !client) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Lo sentimos, No estas autorizado para entrar a esta pagina."
        extra={(
          <>
            <Link href="/client/auth">
              <Button type="primary">Iniciar Sesion</Button>
            </Link>
            <Link href="/">
              <Button type="default">Ir al inicio</Button>
            </Link>
          </>
        )}
      />
    );
  }

  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`/images/${companyId}apple-touch-icon.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`/images/${companyId}favicon-32x32.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`/images/${companyId}favicon-16x16.png`}
        />
        <link rel="manifest" href={`/images/${companyId}site.webmanifest`} />
        <link
          rel="mask-icon"
          href={`/images/${companyId}safari-pinned-tab.svg`}
          color="#5bbad5"
        />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:url" content={seoUrl} />
        <meta property="fb:app_id" content="1304512236864343" />
      </Head>

      <ConfigProvider form={{ validateMessages }} theme={defaultTheme}>
        {appLoading && (
          <div className="loading">
            <Spin size="large" />
          </div>

        )}
        <ImageCacheProvider>
          <AppLoadingContext.Provider value={{ appLoading, setAppLoading }}>
            <OrderContext.Provider
              value={{
                orderService,
                toggleCart: toggleShoppingCart,
                cartIsOpen,
              }}
            >
              <AppViewportHeightContext.Provider
                value={{
                  appViewportHeightClassName,
                  setAppviewPortHeightClassName: setAppViewportHeightClassName,
                }}
              >
                <LoadingBar
                  height={4}
                  color="rgb(180, 130, 251)"
                  progress={progress}
                  onLoaderFinished={() => setProgress(0)}
                  waitingTime={400}
                />
                <AppLayout>
                  <Component {...pageProps} />
                </AppLayout>
              </AppViewportHeightContext.Provider>
            </OrderContext.Provider>
          </AppLoadingContext.Provider>
        </ImageCacheProvider>
        <ToastContainer />
      </ConfigProvider>
    </>
  );
};

export default MyApp;

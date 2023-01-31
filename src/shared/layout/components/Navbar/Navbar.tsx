import { Header } from 'antd/lib/layout/layout'
import logo from '@assets/images/logo.png'
import person from '@assets/images/person.png'
import Image from 'next/image'
import styles from './Navbar.module.scss'
import { Button, Dropdown, Input, MenuProps, Modal, Select } from 'antd'
import { ChangeEvent, useEffect, useState } from 'react'
import { CategoriesDrawer } from '@shared/layout/components/CategoriesDrawer/CategoriesDrawer'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContextualRouting } from 'next-use-contextual-routing'
import { Auth } from '@screens/Auth/Auth'
import { CategoryEntity } from '@shared/entities/CategoryEntity'
import { handleEntityHook } from '@shared/hooks/handleEntityHook'
import { appLogOut, getAuthData } from '../../../../utils/auth.utils'
import { UserEntity } from '@shared/entities/UserEntity'
import { MainContentModal } from '@components/MainContentModal/MainContentModal'
import { Search } from '@screens/Search'
import { Endpoints } from '@shared/enums/endpoints.enum'

const { Option } = Select

export interface ICategorySelect {
  categories: CategoryEntity[]
  onSelect: (slug: string) => void
}

const SelectBefore = (props: ICategorySelect) => (
  <Select
    defaultValue="Todas"
    className="select-before"
    onChange={props.onSelect}
  >
    {props.categories.map((item, i) => (
      <Option value={item.slug} key={item._id}>
        {item.name}
      </Option>
    ))}
  </Select>
)

export const Navbar = () => {
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>()
  const [showContextSearchModal, setShowContextSearchModal] =
    useState<boolean>(false)
  const [categorySlug, setCategorySlug] = useState<string>()
  const router = useRouter()
  const authIsEnable = router.query.auth
  const { makeContextualHref, returnHref } = useContextualRouting()
  const handleReturnToHref = () => router.push(returnHref)
  const authUser = getAuthData('user') as UserEntity
  const {
    data: categories,
    get: getCategories,
    ['trending-categories']: trendingCategories,
  } = handleEntityHook<CategoryEntity>('categories', true)
  const enableContextSearch = !returnHref.includes('search')

  console.log('trending', trendingCategories)
  const authenticate = () => {
    router.push(makeContextualHref({ auth: true }), 'auth', { shallow: true })
  }

  useEffect(() => {
    getTrendingCats()
  }, [])

  const getTrendingCats = () =>
    getCategories({ endpoint: Endpoints.TRENDING_CATEGORIES })

  const userDropdownItems: MenuProps['items'] = [
    {
      key: 'account',
      label: 'Mi cuenta',
    },
    {
      key: 'posts',
      label: 'Publicaciones',
    },
    {
      key: 'log-out',
      label: <span onClick={appLogOut}>Cerrar Sesion</span>,
    },
  ]

  const toggleAllCategoriesDrawer = () => {
    setShowAllCategories(!showAllCategories)
  }

  const handleSearchRouting = (
    path: string,
    queryParams: any,
    isContext?: boolean
  ) => {
    if (isContext) {
      router.push(makeContextualHref(queryParams), path)
    } else {
      router.push({
        pathname: path,
        query: queryParams,
      })
    }
  }

  const onSearch =
    (contextSearch: boolean = false) =>
    (data: ChangeEvent<HTMLInputElement> | string) => {
      let path: string = Endpoints.SEARCH_AUTO
      if (categorySlug) path = ''
      const value: string = (data as ChangeEvent<HTMLInputElement>).target
        ? (data as ChangeEvent<HTMLInputElement>).target.value
        : (data as string)
      setSearchValue(value)
      emptySearch(!!value)

      if (!value) return
      if (contextSearch) {
        const queryParams: any = {
          value,
          categorySlug,
          extraPath: ['autocomplete-by-title'].join('/'),
        }
        const queryString = new URLSearchParams(queryParams).toString()
        console.log(queryString)
        const contextPath = `/search/${path}/?${queryString}`
        handleSearchRouting(contextPath, queryParams, contextSearch)
      } else {
        handleSearchRouting(`/search/${path}/`, { value, categorySlug })
        setShowContextSearchModal(false)
      }
    }

  const emptySearch = (isShown: boolean = false) => {
    !isShown && handleReturnToHref()
    setShowContextSearchModal(isShown)
  }

  const onSelectCategory = (slug: string) => setCategorySlug(slug)

  const goToHome = () => {
    router.push('/')
    setSearchValue('')
    setShowContextSearchModal(false)
  }

  return (
    <>
      <Header className={`${styles.navbar}`}>
        <div
          className={`grid-container grid-column-full px-xx-l ${styles.navbarOptionsWrapper}`}
        >
          <div className={`${styles.navbarLogoContainer} flex-start-center`}>
            <div onClick={goToHome} className="cursor-pointer">
              <Image src={logo} alt="Store Logo" />
            </div>
          </div>
          <div className={`${styles.navbarBrowserWrapper} flex-center-center`}>
            <Input.Search
              value={searchValue}
              size="large"
              allowClear
              addonBefore={
                <SelectBefore
                  categories={categories}
                  onSelect={onSelectCategory}
                />
              }
              placeholder="DetailView"
              onChange={onSearch(true)}
              onSearch={onSearch(false)}
            />
          </div>
          <ul className={`${styles.navbarOptionsList} flex-end-center`}>
            {!authUser && <li onClick={authenticate}>Iniciar Session</li>}
            <li>
              <Link href="/post">
                <Button type="default">Publicar</Button>
              </Link>
            </li>
            {authUser && (
              <li className={styles.userDropdown}>
                <Dropdown
                  menu={{ items: userDropdownItems }}
                  trigger={['click']}
                  placement="bottom"
                >
                  <Image src={person} alt="user icon" />
                </Dropdown>
              </li>
            )}
          </ul>
        </div>
      </Header>
      <div className={`${styles.navbarFavoritesWrapper} px-xx-l`}>
        <ul className="flex-between-center w-100">
          <li>
            <div
              className="flex-start-center cursor-pointer"
              onClick={toggleAllCategoriesDrawer}
            >
              <i className="bi bi-list font-size-9" />
              <span>Ver Todo</span>
            </div>
          </li>
          {categories.slice(0, 4).map((item) => (
            <li key={item._id}>{item.name}</li>
          ))}
        </ul>
      </div>
      <CategoriesDrawer
        visible={showAllCategories}
        onClose={toggleAllCategoriesDrawer}
        authenticate={authenticate}
      />
      <Modal
        title="Basic Modal"
        open={!!authIsEnable}
        onOk={handleReturnToHref}
        onCancel={handleReturnToHref}
      >
        <Auth isModal />
      </Modal>
      <MainContentModal show={showContextSearchModal && enableContextSearch}>
        <Search hideSidebar={true} />
      </MainContentModal>
    </>
  )
}

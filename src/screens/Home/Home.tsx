import { VerticalPreviewCard } from '@components/VerticalPreviewCard'
import styles from './Home.module.scss'
import logo from '@assets/images/logo.png'
import { LandingCarousel } from './components/HomeCarousel'
import { ScrollView } from '@components/ScrollView/ScrollView'
import { useAppStore } from '@services/store'
import { PostEntity } from '@models/PostEntity'
import { useEffect, useState } from 'react'

export const Home = () => {
  const count = useAppStore((state) => state.count)
  const name = useAppStore((state) => state.name)
  const handleCount = useAppStore((state) => state.handleCount)
  const productEntity = useAppStore((state) => state.posts((statep) => statep))
  console.log('products', productEntity.data)
  const content = (productEntity.data as any).content
  const productData = content ? content : productEntity.data
  const [product, setProduct] = useState<PostEntity>(new PostEntity())
  const products = [
    {
      title: 'First Item',
      image: logo,
    },
    {
      title: 'First Item',
      image: logo,
    },
    {
      title: 'First Item',
      image: logo,
    },
    {
      title: 'First Item',
      image: logo,
    },
  ]

  const onchange = ({ target: { value, name } }: any) =>
    setProduct({
      ...product,
      [name]: value,
    })

  const onSelectProduct = (item: PostEntity) => () => setProduct({ ...item })

  const createProduct = () => {
    if (!product.id) {
      //   "description is required"
      //   4
      // :
      //   "description must be a string"
      //   5
      // :
      //   "statusId is required"
      //   6
      // :
      //   "subCategoryId is required"
      //   7
      // :
      //   "typeCurrencyId is required"
      //   8
      // :
      //   "images must contain at least 1 elements"
      //   9
      // :
      //   "images must be an array"
      //   10
      // :
      //   "images is required"
      productEntity.add(
        {
          ...product,
          title: 'Example',
          description: 'Description',
          price: 100,
          categoryId: '62e6a79408f79af1b90884f9',
          subCategoryId: '62e6a79408f79af1b90884f9',
          statusId: 1,
          images: [
            'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?cs=srgb&dl=pexels-pixabay-45201.jpg&fm=jpg',
          ],
          typeCurrencyId: '1',
        },
        { path: 'create' }
      )
    } else {
      productEntity.update(product.id, product)
    }
    setProduct({} as PostEntity)
  }

  const removeProduct = (id: number) => () => {
    productEntity.remove(id)
  }
  useEffect(() => {
    productEntity.get({})
  }, [])
  return (
    <div className={styles.HomeWrapper}>
      {productEntity.loading ? (
        <p>Loading...</p>
      ) : (
        <h1>
          Count {count} - {name}
        </h1>
      )}
      <br />
      <br />
      <input
        type="text"
        name="title"
        onChange={onchange}
        value={product.title}
        placeholder="title"
      />{' '}
      <br /> <br />
      <input
        type="text"
        name="description"
        onChange={onchange}
        value={product.description}
        placeholder="description"
      />{' '}
      <br /> <br />
      <input
        type="text"
        name="image"
        onChange={onchange}
        value={product.image}
        placeholder="image"
      />{' '}
      <br /> <br />
      <button onClick={createProduct}>
        {product.id ? 'Update' : 'Create'} product
      </button>{' '}
      <br /> <br />
      <button onClick={handleCount()}>Increase</button>
      <br /> <br />
      <button onClick={handleCount(true)}>Decrease</button>
      <br />
      <br />
      <div className={styles.products}>
        {productData.map((item, i) => (
          <div key={i} onClick={onSelectProduct(item)}>
            <img src={item.image} alt="" />
            <h5>{item.title}</h5>
            <p>{item.description}</p>
            <a href="#" onClick={removeProduct(item.id)}>
              Eliminar
            </a>
          </div>
        ))}
      </div>
      <div className={styles.LandingCarouselWrapper}>
        <LandingCarousel />
      </div>
      <div className={styles.HomeContent}>
        <div className={styles.HomeTopCardsGrid}>
          <VerticalPreviewCard items={products} />
          <VerticalPreviewCard items={products.slice(0, 3)} />
          <VerticalPreviewCard items={products.slice(0, 1)} />
          <VerticalPreviewCard items={products} />
        </div>
        <ScrollView />
        <ScrollView />
      </div>
    </div>
  )
}

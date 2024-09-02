import { Home } from '@screens/Home';

function Index() {
  return <Home />;
}
export async function getStaticProps() {
  return {
    props: {
      protected: false,
    },
  };
}

export default Index;

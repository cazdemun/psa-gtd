import React from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import GlobalServicesMachine from './lib/GlobalServicesMachine';
import CollectModule from './componentes/collect';

function App() {
  const GlobalServices = useInterpret(GlobalServicesMachine);
  
  const BucketCRUDService = useSelector(GlobalServices, ({ context }) => context.bucketCRUDActor);

  return (
    <>
      <CollectModule bucketCRUDService={BucketCRUDService}/>
    </>
  );
}

export default App;

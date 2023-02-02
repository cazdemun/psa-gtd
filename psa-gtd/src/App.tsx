import React, { useEffect, useState } from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import GlobalServicesMachine from './machines/GlobalServicesMachine';
import CollectModule from './componentes/collect';
import { Menu, MenuProps } from 'antd';
import { EyeOutlined, FireOutlined } from '@ant-design/icons';
import ProcessModule from './componentes/process';
import bucketItemsProcessesService from './machines/bucketItemsProcessesServices';
import { sortByIndex } from './utils';
import GlobalServicesContext from './componentes/context/GlobalServicesContext';

const paths = [
  'collect',
  'process'
] as const;

type Path = typeof paths[number];

const items: (items: number) => MenuProps['items'] = (items) => [
  {
    label: `Collect (${items})`,
    key: 'collect',
    icon: <EyeOutlined />,
  },
  {
    label: `Process / Organize (${items})`,
    key: 'process',
    icon: <FireOutlined />,
  },
];

function App() {
  const [path, setPath] = useState<Path>('collect');

  const GlobalServices = useInterpret(GlobalServicesMachine);

  const BucketCRUDService = useSelector(GlobalServices, ({ context }) => context.bucketCRUDActor);
  const bucketItems = useSelector(BucketCRUDService, ({ context }) => context.docs);

  const ProcessesService = useInterpret(bucketItemsProcessesService);
  const processes = useSelector(ProcessesService, ({ context }) => context.processes)

  useEffect(() => {
    const sortedBucketItems = bucketItems.slice().sort((a, b) => sortByIndex(a, b));
    ProcessesService.send({ type: 'SPAWN_MACHINES', docs: sortedBucketItems });
  }, [ProcessesService, bucketItems])

  return (
    <GlobalServicesContext.Provider value={{ service: GlobalServices }}>
      <Menu
        onClick={(e) => setPath(e.key as Path)} selectedKeys={[path]}
        mode="horizontal"
        items={items(bucketItems.length)}
      />
      {path === 'collect' && (<CollectModule bucketCRUDService={BucketCRUDService} />)}
      {path === 'process' && (<ProcessModule processes={processes} />)}
    </GlobalServicesContext.Provider>
  );
}

export default App;

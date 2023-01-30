import React, { useEffect, useState } from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import GlobalServicesMachine from './lib/GlobalServicesMachine';
import CollectModule from './componentes/collect';
import { Menu, MenuProps } from 'antd';
import { EyeOutlined, FireOutlined } from '@ant-design/icons';
import ProcessModule from './componentes/process';
import bucketItemsProcessesService from './machines/bucketItemsProcessesServices';
import { sortByIndex } from './utils';

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
  const docs = useSelector(BucketCRUDService, ({ context }) => context.docs);

  const ProcessesService = useInterpret(bucketItemsProcessesService);
  const processes = useSelector(ProcessesService, ({ context }) => context.processes)

  useEffect(() => {
    console.log('test');
    const sortedDocs = docs.slice().sort((a, b) => sortByIndex(a, b));
    ProcessesService.send({ type: 'SPAWN_MACHINES', docs: sortedDocs });
  }, [ProcessesService, docs])

  return (
    <>
      <Menu onClick={(e) => setPath(e.key as Path)} selectedKeys={[path]} mode="horizontal" items={items(docs.length)} />
      {path === 'collect' && (<CollectModule bucketCRUDService={BucketCRUDService} />)}
      {path === 'process' && (<ProcessModule bucketCRUDService={BucketCRUDService} sortedDocs={docs.slice().sort((a, b) => sortByIndex(a, b))} processes={processes} />)}
    </>
  );
}

export default App;

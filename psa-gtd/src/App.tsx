import React, { useEffect, useState } from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import GlobalServicesMachine from './machines/GlobalServicesMachine';
import CollectModule from './componentes/collect';
import { Col, Divider, Menu, MenuProps, Row, Space, Switch } from 'antd';
import { CoffeeOutlined, EyeOutlined, FilterOutlined, FireOutlined, FolderOutlined, FundProjectionScreenOutlined } from '@ant-design/icons';
import ProcessModule from './componentes/process';
import bucketItemsProcessesService from './machines/bucketItemsProcessesServices';
import { sortByIndex } from './utils';
import GlobalServicesContext, { GlobalConfig } from './componentes/context/GlobalServicesContext';

const paths = [
  'collect',
  'process',
  'actions',
  'others',
  'review',
  'do',
] as const;

type Path = typeof paths[number];

const ACTIONABLE_TABLE_LIMIT = 5;

const items: (items: number) => MenuProps['items'] = (items) => [
  {
    label: `Collect (${items})`,
    key: 'collect',
    icon: <EyeOutlined />,
  },
  {
    label: `Process / Organize (${items})`,
    key: 'process',
    icon: <FilterOutlined />,
  },
  {
    label: `Actions / Projects`,
    key: 'actions',
    icon: <CoffeeOutlined />,
  },
  {
    label: `Reference / Support / Maybe`,
    key: 'others',
    icon: <FolderOutlined />,
  },
  {
    label: `Review (show here maybe)`,
    key: 'review',
    icon: <FundProjectionScreenOutlined />,
  },
  {
    label: `Do`,
    key: 'do',
    icon: <FireOutlined />,
  },
];

function App() {
  const [path, setPath] = useState<Path>('collect');
  const [globalConfig, setGlobalConfig] = useState<Partial<GlobalConfig>>({
    actionableTableLimit: ACTIONABLE_TABLE_LIMIT,
    disableAutoActionableTable: false,
  });

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
    <GlobalServicesContext.Provider value={{
      service: GlobalServices,
      globalConfig: globalConfig as GlobalConfig,
      setGlobalConfig
    }}
    >
      <Row style={{ width: '100%' }} align='bottom' >
        <Menu
          onClick={(e) => setPath(e.key as Path)} selectedKeys={[path]}
          mode="horizontal"
          items={items(bucketItems.length)}
          style={{ flex: '1' }}
        />
        <Col>
          <Space style={{ paddingRight: '8px', alignItems: 'center' }}>
            <div style={{ padding: '0px', margin: '0px 0px 8px 0px' }}>
              Disable auto actionable table:
            </div>
            <Switch
              style={{ padding: '0px', margin: '0px 0px 8px 0px' }}
              checked={globalConfig.disableAutoActionableTable}
              onChange={(value) => setGlobalConfig((config) => ({ ...config, disableAutoActionableTable: value }))}
            />
          </Space>
          <Divider style={{ padding: '0px', margin: '0px' }} />
        </Col>
      </Row>
      {path === 'collect' && (<CollectModule bucketCRUDService={BucketCRUDService} />)}
      {path === 'process' && (<ProcessModule processes={processes} />)}
    </GlobalServicesContext.Provider >
  );
}

export default App;

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

const items: (items: number, actionables: number) => MenuProps['items'] = (items, actionables) => [
  {
    label: `Collect (${items})`,
    key: 'collect',
    icon: <EyeOutlined />,
  },
  {
    label: `Process / Organize (${items}/${actionables})`,
    key: 'process',
    icon: <FilterOutlined />,
  },
  {
    label: `Review (flow)`,
    key: 'review',
    icon: <FundProjectionScreenOutlined />,
  },
  {
    label: `Do`,
    key: 'do',
    icon: <FireOutlined />,
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
];

type HeaderProps = {
  path: Path,
  setPath: (parth: Path) => any
  bucketItemsLength: number
}

const Header: React.FC<HeaderProps> = (props) => {
  const GlobalServices = useInterpret(GlobalServicesMachine);

  const ProcessedCRUDActor = useSelector(GlobalServices, ({ context }) => context.processedCRUDActor);
  const processedItems = useSelector(ProcessedCRUDActor, ({ context }) => context.docs);

  const actionable = processedItems.filter((doc) => doc.type === 'actionable');

  return (
    <Menu
      onClick={(e) => props.setPath(e.key as Path)} selectedKeys={[props.path]}
      mode="horizontal"
      items={items(props.bucketItemsLength, actionable.length)}
      style={{ flex: '1' }}
    />
  );
};

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
        <Header
          setPath={setPath}
          path={path}
          bucketItemsLength={bucketItems.length}
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

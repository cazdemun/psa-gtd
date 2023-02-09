import React, { useContext } from 'react';
import { Button, Card, List, Row, Space, ConfigProvider } from 'antd';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { useSelector } from '@xstate/react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { recursiveParent } from '../../utils';
import { Project } from '../../models';

type CookieJarProps = {
}

const CookieJar: React.FC<CookieJarProps> = (props) => {
  const { service } = useContext(GlobalServicesContext);

  const FinishedCRUDService = useSelector(service, ({ context }) => context.finishedCRUDActor);
  const finishedItems = useSelector(FinishedCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItemsMap = useSelector(ProcessedCRUDService, ({ context }) => context.docsMap);

  return (
    <Card title="Cookie jar"
      extra={(
        <Space>
          <Button icon={<LeftOutlined />} />
          <Button icon={<RightOutlined />} />
        </Space>
      )}
    >
      <List
        dataSource={finishedItems.slice().sort((a, b) => b.finished - a.finished)}
        renderItem={(item) => (
          <List.Item>
            <Row style={{ width: '100%' }}>
              {item.item.type !== 'bucket' ? item.item.title : item.item.content}
              <ConfigProvider renderEmpty={() => <></>}>
                {item.item.type !== 'bucket' && (
                  <List
                    dataSource={
                      recursiveParent(item.item.project, processedItemsMap)
                        .map((_id) => processedItemsMap.get(_id))
                        .filter((doc): doc is Project => doc !== undefined)
                    }
                    renderItem={(item) => (
                      <List.Item>
                        {`[Project] ${item.title}`}
                      </List.Item>
                    )}
                  />
                )}
              </ConfigProvider>
            </Row>
          </List.Item>
        )
        }
      />
    </Card >
  );
};

export default CookieJar;

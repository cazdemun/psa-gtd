import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, List, Row, Space, ConfigProvider } from 'antd';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { useSelector } from '@xstate/react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { completeRecursiveParent, getTitle } from '../../utils';
import { FinishedActionable, Project } from '../../models';
import { add, format, isSameDay, isToday } from 'date-fns';

type CookieJarProps = {
}

const CookieJar: React.FC<CookieJarProps> = (props) => {
  const [date, setDate] = useState<Date>(new Date());
  const [todayFinishedItems, setTodayFinishedItems] = useState<FinishedActionable[]>([]);

  const { service } = useContext(GlobalServicesContext);

  const FinishedCRUDService = useSelector(service, ({ context }) => context.finishedCRUDActor);
  const finishedItems = useSelector(FinishedCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItemsMap = useSelector(ProcessedCRUDService, ({ context }) => context.docsMap);

  useEffect(() => {
    setTodayFinishedItems(
      finishedItems
        .slice()
        .filter((a, b) => isSameDay(date, a.finished))
        .sort((a, b) => b.finished - a.finished)
    );
  }, [finishedItems, date]);

  return (
    <Card title={`Cookie jar (${todayFinishedItems.length}) - ${format(date, 'dd/MM/yyyy')}`}
      extra={(
        <Space>
          <Button icon={<LeftOutlined />} onClick={() => setDate(add(date, { days: -1 }))} />
          <Button icon={<RightOutlined />} onClick={() => setDate(add(date, { days: 1 }))} disabled={isToday(date)} />
        </Space>
      )}
    >
      <List
        dataSource={todayFinishedItems}
        renderItem={(item) => (
          <List.Item>
            <Row style={{ width: '100%' }}>
              {item.item.type !== 'bucket' ? `${getTitle(item.item)}` : `[Bucket Item] ${item.item.content}`}
              <ConfigProvider renderEmpty={() => <></>}>
                {item.item.type !== 'bucket' && (
                  <List
                    dataSource={
                      completeRecursiveParent(item.item.project, processedItemsMap, finishedItems)
                        .map((_id) => processedItemsMap.get(_id) || finishedItems.find((finItem) => finItem.item._id === _id)?.item)
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

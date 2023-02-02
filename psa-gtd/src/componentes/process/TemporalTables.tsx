import React, { useContext } from 'react';
import { Button, Card, List, Space } from "antd";
import GlobalServicesContext from '../context/GlobalServicesContext';
import { useSelector } from '@xstate/react';
import ItemContent from '../ContentItem';
import { DeleteOutlined, RollbackOutlined, SwapLeftOutlined } from '@ant-design/icons';
import { BucketItem } from '../../models';
import { OptionalId } from '../../lib/Repository';
import { getLastIndexFirstLevel, sortByIndex } from '../../utils';

type ActionableTableProps = {
  goToActionableMode: (...args: any[]) => any
}

export const ActionableTable: React.FC<ActionableTableProps> = (props) => {
  const { service, globalConfig } = useContext(GlobalServicesContext);

  const BucketCRUDService = useSelector(service, ({ context }) => context.bucketCRUDActor);
  const bucketItems = useSelector(BucketCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItems = useSelector(ProcessedCRUDService, ({ context }) => context.docs);

  const actionableItems = processedItems.filter((doc) => doc.type === 'actionable');
  const sortedActionableItems = actionableItems.slice().sort((a, b) => sortByIndex(a, b));

  const lastIndexBucketItems = getLastIndexFirstLevel(bucketItems);
  return (
    <Card
      title={`Actionable table (max. ${globalConfig.actionableTableLimit})`}
      bodyStyle={{ padding: '0px 0px 12px 0px' }}
      extra={(
        <Space align='start'>
          <Button 
            icon={<SwapLeftOutlined />}
            onClick={props.goToActionableMode}
          />
        </Space>
      )}
    >
      <List
        dataSource={sortedActionableItems}
        renderItem={(processedItem) => (
          <List.Item
            style={{ alignItems: 'start' }}
            extra={(
              <Space align='start'>
                <Space direction='vertical'>
                  <Button
                    icon={<RollbackOutlined />}
                    onClick={() => {
                      const newItem: OptionalId<BucketItem> = {
                        content: processedItem.content,
                        created: Date.now(),
                        index: (lastIndexBucketItems + 1).toString(),
                      };

                      BucketCRUDService.send({
                        type: 'CREATE',
                        doc: newItem,
                      });

                      ProcessedCRUDService.send({ type: 'DELETE', _id: processedItem._id, });
                    }}
                  />
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => ProcessedCRUDService.send({ type: 'DELETE', _id: processedItem._id, })}
                  />
                </Space>
              </Space>
            )}
          >
            <ItemContent doc={processedItem} hideLineNumber />
          </List.Item>
        )
        }
        pagination={{ pageSize: 10 }}
      />
    </Card >
  );
};

type ReferenceSupportTableProps = {
}

export const ReferenceSupportTable: React.FC<ReferenceSupportTableProps> = (props) => {
  const { service } = useContext(GlobalServicesContext);

  // const BucketCRUDService = useSelector(service, ({ context }) => context.bucketCRUDActor);
  // const bucketItems = useSelector(BucketCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItems = useSelector(ProcessedCRUDService, ({ context }) => context.docs);

  const refSupItems = processedItems.filter((doc) => doc.type === 'reference' || doc.type === 'support');

  // const lastIndexBucketItems = getLastIndexFirstLevel(bucketItems);
  return (
    <Card title='Reference/Support table (max. TBD)' bodyStyle={{ padding: '0px 0px 12px 0px' }}>
      <p style={{ padding: '12px 24px 0px 24px', margin: '0px' }}>
        This is a table because as a reference it needs to be put into a category and maybe linked to a project, and as a support material needs to be necessary linked to a project that may not be even exists yet.
      </p>
      <List
        dataSource={refSupItems}
        renderItem={(processedItem) => (
          <List.Item
            style={{ alignItems: 'start' }}
            extra={(
              <Space align='start'>
                <Space direction='vertical'>
                  <Button
                    disabled
                    icon={<RollbackOutlined />}
                    onClick={() => {
                      ProcessedCRUDService.send({ type: 'DELETE', _id: processedItem._id, });
                    }}
                  />
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => ProcessedCRUDService.send({ type: 'DELETE', _id: processedItem._id, })}
                  />
                </Space>
              </Space>
            )}
          >
            <pre>
              {JSON.stringify(processedItem, null, 2)}
            </pre>
          </List.Item>
        )}
      />
    </Card >
  );
};

import React, { useContext } from 'react';
import { Button, Card, Col, List, Row, Space } from "antd";
import GlobalServicesContext from '../context/GlobalServicesContext';
import { useSelector } from '@xstate/react';
import ItemContent from '../ContentItem';
import { DeleteOutlined, RollbackOutlined, SwapLeftOutlined } from '@ant-design/icons';
import { Action, Actionable, BucketItem, ProcessedItem, Project, Reference, Someday, Support, Trash } from '../../models';
import { NewDoc } from '../../lib/Repository';
import { deleteItemWithConfirm, getLastIndexFirstLevel, rollbackReferenceItem, rollbackSupportItem, sortByIndex } from '../../utils';


type GenericTableProps<T extends ProcessedItem> = {
  title: string
  cardDescription?: React.ReactNode
  cardExtra?: React.ReactNode
  filter: (doc: ProcessedItem) => doc is T
  onRollback?: (oldDoc: T) => any
  renderItem: (oldDoc: T) => React.ReactNode
}

const GenericTable = <T extends ProcessedItem>(props: GenericTableProps<T>) => {
  const { service } = useContext(GlobalServicesContext);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const genericProcessedItems = useSelector(ProcessedCRUDService, ({ context }) => context.docs);

  const filteredItems = genericProcessedItems.filter(props.filter);
  const sortedFilteredItems = filteredItems.slice().sort((a, b) => sortByIndex(a, b));

  return (
    <Card
      title={props.title}
      bodyStyle={{ padding: '0px 0px 12px 0px' }}
      extra={(
        <Space align='start'>
          {props.cardExtra}
        </Space>
      )}
    >
      {props.cardDescription}
      <List
        dataSource={sortedFilteredItems}
        renderItem={(processedItem) => (
          <List.Item
            style={{ alignItems: 'start' }}
            extra={(
              <Space align='start'>
                <Space direction='vertical'>
                  {props.onRollback !== undefined && (
                    <Button
                      icon={<RollbackOutlined />}
                      onClick={() => props.onRollback !== undefined ? props.onRollback(processedItem) : undefined}
                    />
                  )}
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => deleteItemWithConfirm(ProcessedCRUDService, processedItem._id)}
                  />
                </Space>
              </Space>
            )}
          >
            {props.renderItem(processedItem)}
          </List.Item>
        )
        }
        pagination={{ pageSize: 10 }}
      />
    </Card >
  );
};

type ActionableTableProps = {
  goToActionableMode: (...args: any[]) => any
}

export const ActionableTable: React.FC<ActionableTableProps> = (props) => {
  const { service, globalConfig } = useContext(GlobalServicesContext);

  const BucketCRUDService = useSelector(service, ({ context }) => context.bucketCRUDActor);
  const bucketItems = useSelector(BucketCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);

  const lastIndexBucketItems = getLastIndexFirstLevel(bucketItems);
  return (
    <GenericTable<Actionable>
      title={`Actionable table (max. ${globalConfig.actionableTableLimit})`}
      filter={(doc): doc is Actionable => doc.type === 'actionable'}
      cardExtra={(
        <Button
          icon={<SwapLeftOutlined />}
          onClick={props.goToActionableMode}
        />
      )}
      onRollback={(processedItem) => {
        const newItem: NewDoc<BucketItem> = {
          type: 'bucket',
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
      renderItem={(processedItem) => <ItemContent doc={processedItem} hideLineNumber />}
    />
  );
};

type ProjectsTableProps = {
}

export const ProjectsTable: React.FC<ProjectsTableProps> = (props) => {
  const { service } = useContext(GlobalServicesContext);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItemsMap = useSelector(ProcessedCRUDService, ({ context }) => context.docsMap);

  return (
    <GenericTable<Project>
      title={`Projects`}
      filter={(doc): doc is Project => (doc.type === 'project' && doc.project === undefined)}
      renderItem={(processedItem) => (
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            {processedItem.title}
          </Col>
          <Col span={24}>
            <List
              dataSource={
                processedItem.actions
                  .map((_id) => processedItemsMap.get(_id))
                  .filter((doc): doc is Action | Project => doc !== undefined)
              }
              renderItem={(child) => (
                <List.Item>
                  <pre>
                    {JSON.stringify(child, null, 2)}
                  </pre>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      )}
    />
  );
};

type SingleActionsTableProps = {
}

export const SingleActionsTable: React.FC<SingleActionsTableProps> = (props) => {
  return (
    <GenericTable<Action>
      title={`Single actions`}
      filter={(doc): doc is Action => (doc.type === 'action' && doc.project === undefined)}
      renderItem={(processedItem) => (
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            {processedItem.content}
          </Col>
        </Row>
      )}
    />
  );
};

type ReferenceSupportTableProps = {
}

export const ReferenceSupportTable: React.FC<ReferenceSupportTableProps> = (props) => {
  const { service } = useContext(GlobalServicesContext);

  const BucketCRUDService = useSelector(service, ({ context }) => context.bucketCRUDActor);
  const bucketItems = useSelector(BucketCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);

  const lastIndexBucketItems = getLastIndexFirstLevel(bucketItems);
  return (
    <GenericTable<Support | Reference>
      title='Reference/Support table (max. TBD)'
      filter={(doc): doc is Support | Reference => doc.type === 'reference' || doc.type === 'support'}
      cardDescription={(
        <p style={{ padding: '12px 24px 0px 24px', margin: '0px' }}>
          This is a table because as a reference it needs to be put into a category and maybe linked to a project, and as a support material needs to be necessary linked to a project that may not be even exists yet.
        </p>
      )}
      onRollback={(processedItem) => {
        if (processedItem.type === 'reference') {
          BucketCRUDService.send({
            type: 'CREATE',
            doc: rollbackReferenceItem(processedItem, (lastIndexBucketItems + 1).toString()),
          });

          ProcessedCRUDService.send({ type: 'DELETE', _id: processedItem._id, });
        }
        if (processedItem.type === 'support') {
          BucketCRUDService.send({
            type: 'CREATE',
            doc: rollbackSupportItem(processedItem, (lastIndexBucketItems + 1).toString()),
          });

          ProcessedCRUDService.send({ type: 'DELETE', _id: processedItem._id, });
        }
      }}
      renderItem={(processedItem) => (
        <pre>
          {JSON.stringify(processedItem, null, 2)}
        </pre>
      )}
    />
  );
};

type SomedayMaybeTableProps = {
}

export const SomedayMaybeTable: React.FC<SomedayMaybeTableProps> = (props) => {
  const { service } = useContext(GlobalServicesContext);

  const BucketCRUDService = useSelector(service, ({ context }) => context.bucketCRUDActor);
  const bucketItems = useSelector(BucketCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);

  const lastIndexBucketItems = getLastIndexFirstLevel(bucketItems);
  return (
    <GenericTable<Someday>
      title='Someday/Maybe table (max. TBD)'
      filter={(doc): doc is Someday => doc.type === 'someday'}
      onRollback={(processedItem) => {
        if (processedItem.item.type !== 'bucket') {
          const { _id, ...item } = processedItem.item as ProcessedItem;

          ProcessedCRUDService.send({
            type: 'CREATE',
            doc: {
              ...item,
              index: (lastIndexBucketItems + 1).toString(),
              created: Date.now(),
            },
          });

          ProcessedCRUDService.send({ type: 'DELETE', _id: processedItem._id, });
        } else {
          const { _id, ...item } = processedItem.item as BucketItem;
          BucketCRUDService.send({
            type: 'CREATE',
            doc: {
              ...item,
              index: (lastIndexBucketItems + 1).toString(),
              created: Date.now(),
            },
          });

          ProcessedCRUDService.send({ type: 'DELETE', _id: processedItem._id, });
        }
      }}
      renderItem={(processedItem) => (
        <pre>
          {JSON.stringify(processedItem, null, 2)}
        </pre>
      )}
    />
  );
};

type TrashTableProps = {
}

export const TrashTable: React.FC<TrashTableProps> = (props) => {
  const { service } = useContext(GlobalServicesContext);

  const BucketCRUDService = useSelector(service, ({ context }) => context.bucketCRUDActor);
  const bucketItems = useSelector(BucketCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);

  const lastIndexBucketItems = getLastIndexFirstLevel(bucketItems);
  return (
    <GenericTable<Trash>
      title='Trash table'
      filter={(doc): doc is Trash => doc.type === 'trash'}
      onRollback={(processedItem) => {
        if (Object.hasOwn(processedItem.item, 'type')) {
          const { _id, ...item } = processedItem.item as ProcessedItem;

          ProcessedCRUDService.send({
            type: 'CREATE',
            doc: {
              ...item,
              index: (lastIndexBucketItems + 1).toString(),
              created: Date.now(),
            },
          });

          ProcessedCRUDService.send({ type: 'DELETE', _id: processedItem._id, });
        } else {
          const { _id, ...item } = processedItem.item as BucketItem;
          BucketCRUDService.send({
            type: 'CREATE',
            doc: {
              ...item,
              index: (lastIndexBucketItems + 1).toString(),
              created: Date.now(),
            },
          });

          ProcessedCRUDService.send({ type: 'DELETE', _id: processedItem._id, });
        }
      }}
      renderItem={(processedItem) => (
        <pre>
          {JSON.stringify(processedItem, null, 2)}
        </pre>
      )}
    />
  );
};

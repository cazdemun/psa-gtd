import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Col, List, Row, Space, ConfigProvider, Divider } from 'antd';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { useSelector } from '@xstate/react';
import { deleteItemWithConfirm, getLastIndexFirstLevel, getNextIndex, recursiveParent, sortByIndex } from '../../utils';
import { Action, DoCategory, FinishedActionable, ProcessedItem, Project } from '../../models';
import { CheckOutlined, DeleteOutlined, EditOutlined, EyeFilled, EyeOutlined, LockFilled, PlusOutlined, UnlockOutlined } from '@ant-design/icons';
import { FinishedCRUDStateMachine, ProcessedCRUDStateMachine } from '../../machines/GlobalServicesMachine';
import { ActorRefFrom } from 'xstate';
import { NewDoc } from '../../lib/Repository';
import DoCategoryModal from './DoCategoryModal';

const onActionDone = (
  actionToProcess: Action | undefined,
  processedItemsMap: Map<string, ProcessedItem>,
  ProcessedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>,
  FinishedCRUDService: ActorRefFrom<FinishedCRUDStateMachine>,
) => {
  if (actionToProcess === undefined) return;

  const newFinishedItem: NewDoc<FinishedActionable> = {
    type: 'finished',
    item: actionToProcess,
    finished: Date.now(),
  }

  if (actionToProcess.project !== undefined) {
    const updatedOldParents = recursiveParent(actionToProcess.project, processedItemsMap)
      .map((_id) => processedItemsMap.get(_id))
      .filter((doc): doc is Project => doc !== undefined)
      .map((doc, i) => ({
        type: 'UPDATE',
        _id: doc._id,
        doc: {
          // modified: Date.now(),
          actions: i === 0 ? doc.actions.filter((action) => action !== actionToProcess._id) : doc.actions,
        },
      }) as const);

    ProcessedCRUDService.send({
      type: 'BATCH',
      data: [
        ...updatedOldParents,
        {
          type: 'DELETE',
          _id: actionToProcess?._id,
        }
      ]
    })
    FinishedCRUDService.send({
      type: 'CREATE',
      doc: newFinishedItem,
    })
  } else {
    FinishedCRUDService.send({
      type: 'CREATE',
      doc: newFinishedItem,
    })
    ProcessedCRUDService.send({
      type: 'DELETE',
      _id: actionToProcess?._id,
    })
  }
}

type DoCategoryCardProps = {
  doCategory: DoCategory
  setState: (state: { value: 'idle' | 'edit'; categoryToEdit: DoCategory | undefined; }) => any
}

const DoCategoryCard: React.FC<DoCategoryCardProps> = (props) => {
  const [nonUndefinedActions, setNonUndefinedActions] = useState<Action[]>([]);
  const [showDescription, setShowDescription] = useState<boolean>(false);

  const { service, globalConfig, setGlobalConfig } = useContext(GlobalServicesContext);

  const DoCategoryCRUDService = useSelector(service, ({ context }) => context.doCategoryCRUDActor);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItemsMap = useSelector(ProcessedCRUDService, ({ context }) => context.docsMap);

  const FinishedCRUDService = useSelector(service, ({ context }) => context.finishedCRUDActor);

  useEffect(() => {
    const doCategoryActions = props.doCategory.actions
      .map((_id) => processedItemsMap.get(_id))
      .filter((doc): doc is Action => doc !== undefined)
    setNonUndefinedActions(doCategoryActions);
  }, [props.doCategory, processedItemsMap]);


  return (
    <Card
      title={`${props.doCategory.title} (${nonUndefinedActions.length})`}
      headStyle={{ paddingRight: '8px', paddingLeft: '8px' }}
      bodyStyle={{ padding: '0px' }}
      extra={(
        <Space>
          <Button
            icon={showDescription ? <EyeFilled /> : <EyeOutlined />}
            onClick={() => setShowDescription((value) => !value)}
          />
          <Button
            icon={globalConfig.lockedDoCategory === props.doCategory._id ? <LockFilled /> : <UnlockOutlined />}
            onClick={() => globalConfig.lockedDoCategory === props.doCategory._id
              ? setGlobalConfig({ lockedDoCategory: undefined })
              : setGlobalConfig({ lockedDoCategory: props.doCategory._id })}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => props.setState({
              value: 'edit',
              categoryToEdit: props.doCategory
            })}
          />
          <Button icon={<DeleteOutlined />} onClick={() => deleteItemWithConfirm(DoCategoryCRUDService, props.doCategory._id)} />
        </Space>
      )}
    >
      {(showDescription && props.doCategory.description && props.doCategory.description !== '') && (
        <pre
          style={{
            alignItems: 'start',
            paddingTop: '12px',
            paddingRight: '8px',
            paddingLeft: '8px',
            margin: '0px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {props.doCategory.description}
        </pre>
      )}
      <List
        dataSource={nonUndefinedActions}
        renderItem={(item) => (
          <List.Item
            style={{
              alignItems: 'start',
              paddingRight: '8px',
              paddingLeft: '8px',
            }}
            extra={(
              <Space direction='vertical'>
                <Button
                  icon={<CheckOutlined />}
                  onClick={() => {
                    onActionDone(item, processedItemsMap, ProcessedCRUDService, FinishedCRUDService);
                  }}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    if (!props.doCategory.actions.some((_id) => _id === item._id)) return;
                    DoCategoryCRUDService.send({
                      type: 'UPDATE',
                      _id: props.doCategory._id,
                      doc: {
                        actions: props.doCategory.actions.filter((_id) => _id !== item._id),
                      }
                    })
                  }}
                />
              </Space>
            )}
          >
            <Row style={{ width: '100%' }}>
              <Col span={24}>
                {item.title}
              </Col>
              <Col span={24}>
                <List
                  dataSource={
                    recursiveParent(item.project, processedItemsMap)
                      .map((_id) => processedItemsMap.get(_id))
                      .filter((doc): doc is Project => doc !== undefined)
                  }
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        alignItems: 'start',
                        paddingRight: '12px',
                        paddingLeft: '12px',
                      }}
                    >
                      {`[Project] ${item.title}`}
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </List.Item>
        )}
      />
    </Card>
  );
};

type DoCategoriesProps = {
}

const DoCategories: React.FC<DoCategoriesProps> = (props) => {
  const [state, setState] = useState<{ value: 'idle' | 'edit'; categoryToEdit: DoCategory | undefined; }>({
    categoryToEdit: undefined,
    value: 'idle',
  });

  const { service } = useContext(GlobalServicesContext);

  const DoCategoryCRUDService = useSelector(service, ({ context }) => context.doCategoryCRUDActor);
  const doCategories = useSelector(DoCategoryCRUDService, ({ context }) => context.docs);

  const lastIndex = getLastIndexFirstLevel(doCategories);

  return (
    <Row>
      <Col span={24} >
        <Divider orientation='left'>
          <Space>
            Categories
            <Button
              icon={<PlusOutlined />}
              onClick={() => DoCategoryCRUDService.send({
                type: 'CREATE',
                doc: {
                  type: 'docategory',
                  created: Date.now(),
                  modified: Date.now(),
                  description: '',
                  index: getNextIndex(lastIndex),
                  title: 'New Category',
                  actions: [],
                }
              })}
            />
          </Space>
        </Divider>
        {doCategories.length < 1 && (
          <Button
            onClick={() => DoCategoryCRUDService.send({
              type: 'CREATE',
              doc: {
                type: 'docategory',
                created: Date.now(),
                modified: Date.now(),
                description: '',
                index: '1',
                title: 'Choosen activities',
                actions: [],
              }
            })}
          >
            Create main category
          </Button>
        )}
      </Col>
      <ConfigProvider renderEmpty={() => <></>}>
        {
          doCategories
            .sort((a, b) => sortByIndex(a, b))
            .map((doCategory) => (
              <Col
                key={doCategory._id}
                span={12}
              >
                <DoCategoryCard
                  doCategory={doCategory}
                  setState={setState}
                />
              </Col>
            ))
        }
      </ConfigProvider>
      <DoCategoryModal
        open={state.value === 'edit'}
        onCancel={() => setState({
          value: 'idle',
          categoryToEdit: undefined,
        })}
        categoryToEdit={state.categoryToEdit}
      />
    </Row >
  );
};

export default DoCategories;

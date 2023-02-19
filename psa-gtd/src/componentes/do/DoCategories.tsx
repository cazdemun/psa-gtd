import React, { useContext, useState } from 'react';
import { Button, Card, Col, List, Row, Space, ConfigProvider, Divider } from 'antd';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { useSelector } from '@xstate/react';
import { deleteItemWithConfirm, getLastIndexFirstLevel, getNextIndex, recursiveParent, sortByIndex } from '../../utils';
import { Action, DoCategory, FinishedActionable, ProcessedItem, Project } from '../../models';
import { CheckOutlined, DeleteOutlined, EditOutlined, LockFilled, PlusOutlined, UnlockOutlined } from '@ant-design/icons';
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

type DoCategoriesProps = {
}

const DoCategories: React.FC<DoCategoriesProps> = (props) => {
  const [state, setState] = useState<{ value: 'idle' | 'edit'; categoryToEdit: DoCategory | undefined; }>({
    categoryToEdit: undefined,
    value: 'idle',
  });

  const { service, globalConfig, setGlobalConfig } = useContext(GlobalServicesContext);

  const DoCategoryCRUDService = useSelector(service, ({ context }) => context.doCategoryCRUDActor);
  const doCategories = useSelector(DoCategoryCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItemsMap = useSelector(ProcessedCRUDService, ({ context }) => context.docsMap);

  const FinishedCRUDService = useSelector(service, ({ context }) => context.finishedCRUDActor);

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
                title: 'Choosen activities (pls max 3)',
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
            .map((doCategory) => {
              const doCategoryActions = doCategory.actions
                .map((_id) => processedItemsMap.get(_id))
                .filter((doc): doc is Action => doc !== undefined)
              return (
                <Col
                  key={doCategory._id}
                  span={12}
                >
                  <Card
                    title={`${doCategory.title} (${doCategoryActions.length})`}
                    headStyle={{ paddingRight: '8px', paddingLeft: '8px' }}
                    bodyStyle={{ padding: '0px' }}
                    extra={(
                      <Space>
                        <Button
                          icon={globalConfig.lockedDoCategory === doCategory._id ? <LockFilled /> : <UnlockOutlined />}
                          onClick={() => globalConfig.lockedDoCategory === doCategory._id
                            ? setGlobalConfig({ lockedDoCategory: undefined })
                            : setGlobalConfig({ lockedDoCategory: doCategory._id })}
                        />
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => setState({
                            value: 'edit',
                            categoryToEdit: doCategory
                          })}
                        />
                        <Button icon={<DeleteOutlined />} onClick={() => deleteItemWithConfirm(DoCategoryCRUDService, doCategory._id)} />
                      </Space>
                    )}
                  >
                    <List
                      dataSource={doCategoryActions}
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
                                  if (!doCategory.actions.some((_id) => _id === item._id)) return;
                                  DoCategoryCRUDService.send({
                                    type: 'UPDATE',
                                    _id: doCategory._id,
                                    doc: {
                                      actions: doCategory.actions.filter((_id) => _id !== item._id),
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
                    {/* <pre>
                      {JSON.stringify(doCategory, null, 2)}
                    </pre> */}
                  </Card>
                </Col>
              )
            })
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

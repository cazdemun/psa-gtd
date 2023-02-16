import React, { useContext } from 'react';
import ActionsProjectsTable from '../projects/ActionsProjectsTable';
import { Button, Card, Col, List, Row, Space, ConfigProvider } from 'antd';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { useSelector } from '@xstate/react';
import { recursiveParent, uniqueValues } from '../../utils';
import { Action, FinishedActionable, ProcessedItem, Project } from '../../models';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import CookieJar from './CookieJar';
import { FinishedCRUDStateMachine, ProcessedCRUDStateMachine } from '../../machines/GlobalServicesMachine';
import { ActorRefFrom } from 'xstate';
import { NewDoc } from '../../lib/Repository';

const onFinish = (
  actionToProcess: Action | Project | undefined,
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


type DoModuleProps = {
}

const DoModule: React.FC<DoModuleProps> = (props) => {

  const { service } = useContext(GlobalServicesContext);

  const DoCategoryCRUDService = useSelector(service, ({ context }) => context.doCategoryCRUDActor);
  const doCategories = useSelector(DoCategoryCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItemsMap = useSelector(ProcessedCRUDService, ({ context }) => context.docsMap);

  const FinishedCRUDService = useSelector(service, ({ context }) => context.finishedCRUDActor);
  // const finishedItems = useSelector(FinishedCRUDService, ({ context }) => context.docs);

  return (
    <Row gutter={[16, 16]}>
      <Col span={7}>
        <ActionsProjectsTable
          onProjectDone={() => { }}
          onDo={(item) => {
            const [firstCategory] = doCategories;
            if (firstCategory === undefined) return;
            if (firstCategory.actions.some((_id) => _id === item._id)) return;
            DoCategoryCRUDService.send({
              type: 'UPDATE',
              _id: firstCategory._id,
              doc: {
                actions: uniqueValues([...firstCategory.actions, item._id]),
              }
            })
          }}
        />
      </Col>
      <Col span={17}>
        <Row>
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
          <ConfigProvider renderEmpty={() => <></>}>
            {
              doCategories
                .map((doCategory) => {
                  const doCategoryActions = doCategory.actions
                    .map((_id) => processedItemsMap.get(_id))
                    .filter((doc): doc is Action => doc !== undefined)
                  return (
                    <Col span={8}>
                      <Card title={`${doCategory.title} - (${doCategoryActions.length})`} bodyStyle={{ padding: '0px' }}>
                        <List
                          dataSource={doCategoryActions}
                          renderItem={(item) => (
                            <List.Item
                              style={{ alignItems: 'start' }}
                              extra={(
                                <Space direction='vertical'>
                                  <Button
                                    icon={<CheckOutlined />}
                                    onClick={() => {
                                      onFinish(item, processedItemsMap, ProcessedCRUDService, FinishedCRUDService);
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
                                      <List.Item>
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
          <Col span={8}>
            Calendar
            Deadlines
            Repeated
          </Col>
          <Col span={8}>
            <CookieJar />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default DoModule;

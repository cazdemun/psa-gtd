import React, { useContext } from 'react';
import ActionsProjectsTable from '../projects/ActionsProjectsTable';
import { Button, Card, Col, List, Row, Space } from 'antd';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { useSelector } from '@xstate/react';
import { recursiveParent, uniqueValues } from '../../utils';
import { Action, Project } from '../../models';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';



type DoModuleProps = {
}

const DoModule: React.FC<DoModuleProps> = (props) => {

  const { service } = useContext(GlobalServicesContext);

  const DoCategoryCRUDService = useSelector(service, ({ context }) => context.doCategoryCRUDMachine);
  const doCategories = useSelector(DoCategoryCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDActor = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItemsMap = useSelector(ProcessedCRUDActor, ({ context }) => context.docsMap);

  return (
    <Row gutter={[16, 16]}>
      <Col span={7}>
        <ActionsProjectsTable
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
          {
            doCategories
              .map((doCategory) => (
                <Col span={8}>
                  <Card title={doCategory.title} bodyStyle={{ padding: '0px' }}>
                    <List
                      dataSource={
                        doCategory.actions
                          .map((_id) => processedItemsMap.get(_id))
                          .filter((doc): doc is Action => doc !== undefined)
                      }
                      renderItem={(item) => (
                        <List.Item
                          style={{ alignItems: 'start' }}
                          extra={(
                            <Space>
                              <Button
                                icon={<CheckOutlined />}
                                onClick={() => {
                                  // const FinishedItem
                                }}
                              />
                              <Button
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                  const [firstCategory] = doCategories;
                                  if (firstCategory === undefined) return;
                                  if (!firstCategory.actions.some((_id) => _id === item._id)) return;
                                  DoCategoryCRUDService.send({
                                    type: 'UPDATE',
                                    _id: firstCategory._id,
                                    doc: {
                                      actions: firstCategory.actions.filter((_id) => _id !== item._id),
                                    }
                                  })
                                }}
                              />
                            </Space>
                          )}
                        >
                          <Row style={{ width: '100%' }}>
                            {item.title}
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
                          </Row>
                        </List.Item>
                      )}
                    />
                    {/* <pre>
                      {JSON.stringify(doCategory, null, 2)}
                    </pre> */}
                  </Card>
                </Col>
              ))
          }
          Choosen activities
          Calendar
          Deadlines
          Repeated
          Cookie Jar
        </Row>
      </Col>
    </Row>
  );
};

export default DoModule;

import React from 'react';
import { useSelector } from '@xstate/react';
import { BucketCRUDStateMachine } from '../../lib/GlobalServicesMachine';
import { ActorRefFrom } from 'xstate';
import DebugModule from '../debug';
import { BucketItem } from '../../models';
import { Button, Col, Form, Input, List, Row, Space, Typography } from 'antd';
import { CalculatorOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';

const sortByIndex = (a: BucketItem, b: BucketItem) => {
  let aArr = a.index.split(".");
  let bArr = b.index.split(".");

  for (let i = 0; i < Math.min(aArr.length, bArr.length); i++) {
    if (aArr[i] !== bArr[i]) {
      return parseInt(aArr[i]) - parseInt(bArr[i]);
    }
  }

  return aArr.length - bArr.length;
}

type BucketInputProps = {
  onCreate: (bucketItem: string) => any
}

const BucketInput: React.FC<BucketInputProps> = (props) => {
  const [form] = useForm<{ bucketItem: string }>();
  return (
    <>
      <Form
        form={form}
        onFinish={(values) => {
          props.onCreate(values.bucketItem);
          form.resetFields();
        }}
      >
        <Form.Item
          name='bucketItem'
          rules={[
            {
              required: true,
              message: 'Please add some text'
            }
          ]}
        >
          <Input.TextArea
            autoSize={{ minRows: 10 }}
          />
        </Form.Item>
        <Row justify='end'>
          <Button
            htmlType='submit'
            type='primary'
            icon={<PlusOutlined />}
          >
            Add
          </Button>
        </Row>
      </Form>
    </>
  );
};

type CollectModuleProps = {
  bucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>
}

const CollectModule: React.FC<CollectModuleProps> = (props) => {
  const docs = useSelector(props.bucketCRUDService, ({ context }) => context.docs);
  const sortedDocs = docs.slice().sort((a, b) => sortByIndex(a, b));
  const sortedIndexes = docs.slice().map((a) => parseInt(a.index.split(".")[0])).sort((a, b) => b - a);
  const [lastIndex] = sortedIndexes;
  return (
    <Row gutter={[16, 16]} style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px' }}>
      <Col span={6}>
        <DebugModule
          crudService={props.bucketCRUDService}
          docs={sortedDocs}
          newDoc={{
            content: 'New Test\n\n\nNewTest',
            created: Date.now(),
            index: ((lastIndex ?? 0) + 1).toString(),
          }}
          updateDoc={(doc) => ({
            content: doc.content === 'New Test' ? 'Modified Test' : 'New Test',
          })}
          span={24}
        />
      </Col>
      <Col span={12}>
        <List
          dataSource={sortedDocs}
          renderItem={(doc) => (
            <List.Item
              style={{ alignItems: 'start' }}
              extra={(
                <Space>
                  <Button
                    icon={<CalculatorOutlined />}
                    onClick={() => props.bucketCRUDService.send({
                      type: 'BATCH',
                      data: [
                        {
                          type: 'CREATE',
                          doc: [
                            {
                              content: 'New Test',
                              created: Date.now(),
                              index: `${doc.index}.1`,
                            },
                            {
                              content: 'New Test',
                              created: Date.now(),
                              index: `${doc.index}.2`,
                            },
                          ]
                        },
                        {
                          type: 'DELETE',
                          _id: doc._id,
                        },
                      ],
                    })}
                  />
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => props.bucketCRUDService.send({ type: 'DELETE', _id: doc._id, })}
                  />
                </Space>
              )}
            >
              <Row style={{ width: '100%' }} gutter={[16, 16]}>
                <Col span={2} style={{ textAlign: 'left' }}>
                  <Row justify='end'>
                    <Typography.Text>{`${doc.index}`}</Typography.Text>
                  </Row>
                </Col>
                <Col span={22}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {(doc.content).split('\n').map((text, i) => text !== '' ?
                      (
                        <Typography.Text key={i.toString()}>{text}</Typography.Text>
                      ) : (
                        <div style={{ height: '22px' }} />
                      ))}
                  </div>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </Col>
      <Col span={6}>
        <BucketInput
          onCreate={(bucketItem) => props.bucketCRUDService.send({
            type: 'CREATE',
            doc: {
              content: bucketItem,
              created: Date.now(),
              index: ((lastIndex ?? 0) + 1).toString(),
            }
          })}
        />
      </Col>
    </Row>
  );
}

export default CollectModule;

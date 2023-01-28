import React from 'react';
import { useSelector } from '@xstate/react';
import { BucketCRUDStateMachine } from '../../lib/GlobalServicesMachine';
import { ActorRefFrom } from 'xstate';
import DebugModule from '../debug';
import { Button, Col, Form, Input, List, Row } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import { sortByIndex } from '../../utils';
import BucketItemListItem from './BucketItem';

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
      <Col span={6} hidden>
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
      <Col offset={4} span={14}>
        <List
          dataSource={sortedDocs}
          renderItem={(doc) => (
            <BucketItemListItem doc={doc} bucketCRUDService={props.bucketCRUDService} />
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

import React, { useEffect, useState } from 'react';
import { BucketCRUDStateMachine } from '../../machines/GlobalServicesMachine';
import { ActorRefFrom } from 'xstate';
import { BucketItem } from '../../models';
import { Button, Col, Form, Input, List, Row, Space } from 'antd';
import { BuildFilled, BuildOutlined, DeleteOutlined, EditFilled, EditOutlined, SaveOutlined, ScissorOutlined } from '@ant-design/icons';
import { multiSlice } from '../../utils';

import './BucketItem.css';
import ItemContent from '../ContentItem';

type BucketItemEditProps = {
  doc: BucketItem
  bucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>
  toView: (...args: any[]) => any
  toSlice: (...args: any[]) => any
}

const BucketItemEdit: React.FC<BucketItemEditProps> = (props) => {
  const [form] = Form.useForm<{ bucketItemContent: string }>();

  useEffect(() => {
    form.setFieldValue('value', props.doc.content);
  }, [form, props.doc]);

  return (
    <Form
      form={form}
      initialValues={{
        bucketItemContent: props.doc.content
      }}
      onFinish={(values) => {
        props.bucketCRUDService.send({
          type: 'UPDATE',
          _id: props.doc._id,
          doc: {
            content: values.bucketItemContent,
          }
        })
        props.toView();
      }}
    >
      <List.Item
        style={{ alignItems: 'start' }}
        extra={(
          <Space align='start'>
            <Space direction='vertical'>
              <Button
                icon={<EditFilled />}
                onClick={props.toView}
              />
              <Button
                icon={<BuildOutlined />}
                onClick={props.toSlice}
              />
            </Space>
            <Button
              htmlType='submit'
              icon={<SaveOutlined />}
            />
          </Space>
        )}
      >
        <Row style={{ width: '100%' }} gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              style={{ paddingRight: '8px' }}
              name='bucketItemContent'
              rules={[
                {
                  required: true,
                  message: 'Please add some text'
                }
              ]}
            >
              <Input.TextArea autoSize showCount />
            </Form.Item>
          </Col>
        </Row>
      </List.Item>
    </Form>
  );
};

type BucketItemSliceProps = {
  doc: BucketItem
  bucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>
  toEdit: (...args: any[]) => any
  toView: (...args: any[]) => any
}

const BucketItemSlice: React.FC<BucketItemSliceProps> = (props) => {
  const lines = (props.doc.content).split('\n');
  const [form] = Form.useForm<Record<number, boolean>>();

  return (
    <Form
      form={form}
      onFinish={(values) => {
        const slicePositions = Object.entries(values).filter(([_, value]) => value === true).map(([key, _]) => parseInt(key));
        if (slicePositions.length > 0) {
          const output = multiSlice(lines, slicePositions);
          props.bucketCRUDService.send({
            type: 'BATCH',
            data: [
              {
                type: 'CREATE',
                doc: output.map((textLines, i) => ({
                  content: textLines.join('\n'),
                  created: Date.now(),
                  index: `${props.doc.index}.${i + 1}`,
                })),
              },
              {
                type: 'DELETE',
                _id: props.doc._id,
              },
            ],
          })
          form.resetFields();
        }
      }}
    >
      <List.Item
        style={{ alignItems: 'start' }}
        extra={(
          <Space align='start'>
            <Space direction='vertical'>
              <Button
                icon={<EditOutlined />}
                onClick={props.toEdit}
              />
              <Button
                icon={<BuildFilled />}
                onClick={props.toView}
              />
            </Space>
            <Button
              htmlType='submit'
              icon={<ScissorOutlined />}
            />
          </Space>
        )}
      >
        <ItemContent
          editable
          doc={props.doc}
          form={form}
        />
      </List.Item>
    </Form>
  );
};

type BucketItemViewProps = {
  doc: BucketItem
  bucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>
  toEdit: (...args: any[]) => any
  toSlice: (...args: any[]) => any
}

const BucketItemView: React.FC<BucketItemViewProps> = (props) => {
  return (
    <List.Item
      style={{ alignItems: 'start' }}
      extra={(
        <Space align='start'>
          <Space direction='vertical'>
            <Button
              icon={<EditOutlined />}
              onClick={props.toEdit}
            />
            <Button
              icon={<BuildOutlined />}
              onClick={props.toSlice}
            />
          </Space>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => props.bucketCRUDService.send({ type: 'DELETE', _id: props.doc._id, })}
          />
        </Space>
      )}
    >
      <ItemContent doc={props.doc} />
    </List.Item>
  );
};


type BucketItemProps = {
  doc: BucketItem
  bucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>
}

const BucketItemListItem: React.FC<BucketItemProps> = (props) => {
  const [state, setState] = useState<'view' | 'slice' | 'edit'>('view');

  useEffect(() => {
    setState('view');
  }, [props.doc]);

  return (
    <>
      {state === 'view' && (
        <BucketItemView doc={props.doc} bucketCRUDService={props.bucketCRUDService} toEdit={() => setState('edit')} toSlice={() => setState('slice')} />
      )}
      {state === 'slice' && (
        <BucketItemSlice doc={props.doc} bucketCRUDService={props.bucketCRUDService} toEdit={() => setState('edit')} toView={() => setState('view')} />
      )}
      {state === 'edit' && (
        <BucketItemEdit doc={props.doc} bucketCRUDService={props.bucketCRUDService} toSlice={() => setState('slice')} toView={() => setState('view')} />
      )}
    </>
  );
};

export default BucketItemListItem;

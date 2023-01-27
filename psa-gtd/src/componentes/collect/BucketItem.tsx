import React, { useEffect, useState } from 'react';
import { BucketCRUDStateMachine } from '../../lib/GlobalServicesMachine';
import { ActorRefFrom } from 'xstate';
import { BucketItem } from '../../models';
import { Button, Checkbox, Col, Form, List, Row, Space, Typography } from 'antd';
import { DeleteOutlined, EditFilled, EditOutlined, ScissorOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import { multiSlice } from '../../utils';

// onClick={() => props.bucketCRUDService.send({
//   type: 'BATCH',
//   data: [
//     {
//       type: 'CREATE',
//       doc: [
//         {
//           content: 'New Test',
//           created: Date.now(),
//           index: `${props.doc.index}.1`,
//         },
//         {
//           content: 'New Test',
//           created: Date.now(),
//           index: `${props.doc.index}.2`,
//         },
//       ]
//     },
//     {
//       type: 'DELETE',
//       _id: props.doc._id,
//     },
//   ],
// })}

type BucketItemLineProps = {
  lineNumber: number
  text: string
}

const BucketItemLine: React.FC<BucketItemLineProps> = (props) => {
  return (
    <>
      <Col span={2}>
        <Row justify='end'>
          <Typography.Text>{props.lineNumber}</Typography.Text>
        </Row>
      </Col>
      <Col span={22}>
        {props.text !== '' ? (
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: '0px' }}>{props.text}</pre>
        ) : (
          <div style={{ height: '22px' }} />
        )}
      </Col>
    </>
  );
};

type BucketItemContentProps = {
  doc: BucketItem
  editable?: boolean
}

const BucketItemContent: React.FC<BucketItemContentProps> = (props) => {
  const lines = props.doc.content.split('\n');
  return (
    <Row style={{ width: '100%' }} gutter={[16, 16]}>
      <Col span={2} style={{ textAlign: 'left' }}>
        <Row justify='end'>
          <Typography.Text>{`${props.doc.index}`}</Typography.Text>
        </Row>
      </Col>
      <Col span={22}>
        {lines.map((text, i) => (
          <Row gutter={[16, 0]} key={i.toString()}>
            <BucketItemLine lineNumber={i + 1} text={text} />
            {props.editable && i !== (lines.length - 1) && (
              <Col span={2}>
                <Row justify='end'>
                  <Form.Item valuePropName="checked" name={`${i + 1}`} style={{ margin: '0px' }}>
                    <Checkbox />
                  </Form.Item>
                </Row>
              </Col>
            )}
          </Row>
        ))}
      </Col>
    </Row>
  );
};

type BucketItemEditProps = {
  doc: BucketItem
  bucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>
  onToggle: (...args: any[]) => any
}

const BucketItemEdit: React.FC<BucketItemEditProps> = (props) => {
  const lines = (props.doc.content).split('\n');
  const [form] = useForm<Record<number, boolean>>();

  return (
    <Form
      form={form}
      onFinish={(values) => {
        const slicePositions = Object.entries(values).filter(([_, value]) => value === true).map(([key, _]) => parseInt(key));
        if (slicePositions.length > 0) {
          const output = multiSlice(lines, slicePositions);
          console.log(output);
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
          <Space direction='vertical'>
            <Button
              icon={<EditFilled />}
              onClick={props.onToggle}
            />
            <Button
              htmlType='submit'
              icon={<ScissorOutlined />}
            />
          </Space>
        )}
      >
        <BucketItemContent doc={props.doc} editable />
      </List.Item>
    </Form>
  );
};

type BucketItemViewProps = {
  doc: BucketItem
  bucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>
  onToggle: (...args: any[]) => any
}

const BucketItemView: React.FC<BucketItemViewProps> = (props) => {
  return (
    <List.Item
      style={{ alignItems: 'start' }}
      extra={(
        <Space direction='vertical'>
          <Button
            icon={<EditOutlined />}
            onClick={props.onToggle}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => props.bucketCRUDService.send({ type: 'DELETE', _id: props.doc._id, })}
          />
        </Space>
      )}
    >
      <BucketItemContent doc={props.doc} />
    </List.Item>
  );
};


type BucketItemProps = {
  doc: BucketItem
  bucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>
}

const BucketItemListItem: React.FC<BucketItemProps> = (props) => {
  const [editable, setEditable] = useState<boolean>(false);

  useEffect(() => {
    setEditable(false);
  }, [props.doc]);

  return (
    <>
      {editable ? (
        <BucketItemEdit doc={props.doc} bucketCRUDService={props.bucketCRUDService} onToggle={() => setEditable((value) => !value)} />
      ) : (
        <BucketItemView doc={props.doc} bucketCRUDService={props.bucketCRUDService} onToggle={() => setEditable((value) => !value)} />
      )}
    </>
  );
};

export default BucketItemListItem;

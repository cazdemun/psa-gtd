import React from 'react';
import { Checkbox, Col, Form, Row, Typography } from 'antd';
import { FormInstance } from 'antd/es/form/Form';

import './collect/BucketItem.css';

const LINE_COL = 2;
const TEXT_COL = 22;

type BucketItemLineProps = {
  lineNumber: number
  text: string
  hideLineNumber?: boolean
}

const BucketItemLine: React.FC<BucketItemLineProps> = (props) => {
  return (
    <>
      <Col span={props.hideLineNumber ? 0 : LINE_COL}>
        <Row justify='end'>
          <Typography.Text>{props.lineNumber}</Typography.Text>
        </Row>
      </Col>
      <Col span={props.hideLineNumber ? 24 : TEXT_COL}>
        {props.text !== '' ? (
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: '0px' }}>{props.text}</pre>
        ) : (
          <div style={{ height: '22px' }} />
        )}
      </Col>
    </>
  );
};

type LongCheckBoxProps = {
  lineNumber: number
  form: FormInstance<Record<number, boolean>>
}

const LongCheckBox: React.FC<LongCheckBoxProps> = (props) => {
  const fieldValue = props.lineNumber.toString();
  const isChecked = Form.useWatch(fieldValue, props.form);

  return (
    <>
      <Col span={LINE_COL}>
        <Row justify='end'>
          <Form.Item valuePropName="checked" name={fieldValue} style={{ margin: '0px', minHeight: '22px' }}>
            <Checkbox />
          </Form.Item>
        </Row>
      </Col>
      <Col span={TEXT_COL}>
        <>
          <div style={{ height: '11px' }} />
          <div
            className={isChecked ? 'slice-separator-selected' : 'slice-separator'}
            onClick={() => {
              const value = props.form.getFieldValue(fieldValue);
              props.form.setFieldValue(fieldValue, !value);
            }}
          />
        </>
      </Col>
    </>
  );
};

type ItemContentProps<T extends { content: string }> = {
  doc: T
  hideLineNumber?: boolean
  editable?: boolean
  form?: FormInstance<Record<number, boolean>>
}

const ItemContent = <T extends { content: string }>(props: ItemContentProps<T>) => {
  const lines = props.doc.content.split('\n');
  return (
    <Row style={{ width: '100%' }} gutter={[16, 16]}>
      <Col span={24}>
        {lines.map((text, i) => (
          <Row gutter={[16, 0]} key={i.toString()}>
            <BucketItemLine lineNumber={i + 1} text={text} hideLineNumber={props.hideLineNumber} />
            {(
              props.editable // Used for BucketItemSlice
              && i !== (lines.length - 1) // Last line shouldn't be able to be sliced
              && props.form !== undefined // With this we can use useWatch safely
            ) && (
                <LongCheckBox
                  form={props.form}
                  lineNumber={i + 1}
                />
              )}
          </Row>
        ))}
      </Col>
    </Row>
  );
};

export default ItemContent;
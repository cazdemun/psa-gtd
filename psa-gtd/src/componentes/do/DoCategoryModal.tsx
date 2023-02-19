import React, { useContext, useEffect } from 'react';
import { useSelector } from '@xstate/react';
import { Button, Col, Form, Input, Modal, Row } from 'antd';
import { DoCategory } from '../../models';
import { useForm } from 'antd/es/form/Form';
import { ActorRefFrom } from 'xstate';
import { DoCategoryCRUDStateMachine } from '../../machines/GlobalServicesMachine';
import GlobalServicesContext from '../context/GlobalServicesContext';

const ACTIONABLE_MODAL_LABEL_COL = 2;

type DoCategoryFormValues = DoCategory

const onFinish = (
  values: DoCategoryFormValues,
  categoryToEdit: DoCategory | undefined,
  DoCategoryCRUDService: ActorRefFrom<DoCategoryCRUDStateMachine>
) => {
  const updatedCategory: Partial<DoCategory> = {
    title: values.title,
    description: values.description,
    modified: Date.now(),
  };

  DoCategoryCRUDService.send({
    type: 'UPDATE',
    _id: categoryToEdit?._id,
    doc: updatedCategory,
  })
}

type DestroyableFormProps = {
  categoryToEdit: DoCategory | undefined,
  onFinish: (...args: any[]) => any
}

const DestroyableForm: React.FC<DestroyableFormProps> = (props) => {
  const [form] = useForm<DoCategoryFormValues>();

  const { service } = useContext(GlobalServicesContext);

  const DoCategoryCRUDService = useSelector(service, ({ context }) => context.doCategoryCRUDActor);

  useEffect(() => {
    form.setFieldsValue({
      ...props.categoryToEdit,
    })
  }, [form, props.categoryToEdit])


  return (
    <Form
      form={form}
      labelCol={{ span: ACTIONABLE_MODAL_LABEL_COL }}
      initialValues={{
        ...props.categoryToEdit,
      }}
      onFinish={(values) => {
        onFinish(values, props.categoryToEdit, DoCategoryCRUDService);
        props.onFinish();
      }}
    >
      <Form.Item
        label="Title"
        name='title'
        rules={[{ required: true, message: 'Please add some text' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Desc." name='description'>
        <Input.TextArea
          autoSize={{ minRows: 2 }}
        />
      </Form.Item>
      <Row justify='end'>
        <Form.Item>
          <Button
            htmlType='submit'
            type='primary'
          >
            Update
          </Button>
        </Form.Item>
      </Row>
    </Form>
  );
};

type DoCategoryModalProps = {
  open: boolean
  onCancel: (...args: any[]) => any
  categoryToEdit: DoCategory | undefined
}

const DoCategoryModal: React.FC<DoCategoryModalProps> = (props) => {
  const { service } = useContext(GlobalServicesContext);

  const DoCategoryCRUDService = useSelector(service, ({ context }) => context.doCategoryCRUDActor);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItemsMap = useSelector(ProcessedCRUDService, ({ context }) => context.docsMap);

  const isFlushable = (props.categoryToEdit?.actions || []).filter((_id) => processedItemsMap.get(_id) === undefined).length > 0;

  return (
    <Modal
      width={800}
      title='Edit category'
      open={props.open}
      onCancel={props.onCancel}
      footer={null}
      destroyOnClose
    >
      <Row>
        <Col span={24} hidden={!isFlushable}>
          <Row justify='end' style={{ paddingBottom: '12px' }}>
            <Button
              disabled={!isFlushable}
              onClick={() => {
                if (props.categoryToEdit) {
                  DoCategoryCRUDService.send({
                    type: 'UPDATE',
                    _id: props.categoryToEdit._id,
                    doc: {
                      actions: props.categoryToEdit?.actions
                        .filter((_id) => processedItemsMap.get(_id) !== undefined)
                    }
                  })
                  props.onCancel();
                }
              }}
            >
              Flush
            </Button>
          </Row>
        </Col>
        <Col span={24}>
          <DestroyableForm
            categoryToEdit={props.categoryToEdit}
            onFinish={props.onCancel}
          />
        </Col>
        <Col span={24}>
          <pre>
            {JSON.stringify(props.categoryToEdit, null, 2)}
          </pre>
        </Col>
      </Row>
    </Modal >
  );
};

export default DoCategoryModal;

import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from '@xstate/react';
import { Button, Col, Form, Modal, Row } from 'antd';
import { Action, DoCategory } from '../../models';
import { useForm } from 'antd/es/form/Form';
import { ActorRefFrom } from 'xstate';
import { DoCategoryCRUDStateMachine } from '../../machines/GlobalServicesMachine';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { SearchSelect } from '../common/Search';
import { uniqueValues } from '../../utils';

const ACTIONABLE_MODAL_LABEL_COL = 2;

export const onAddToCategory = (
  values: { category?: string },
  actionToAdd: Action | undefined,
  categoriesMap: Map<string, DoCategory>,
  DoCategoryCRUDService: ActorRefFrom<DoCategoryCRUDStateMachine>
) => {
  const category = values.category ? categoriesMap.get(values.category) : undefined;

  if (!category || !actionToAdd) return;
  if (category.actions.some((_id) => _id === actionToAdd._id)) return;

  const updatedCategory: Partial<DoCategory> = {
    actions: uniqueValues([...category.actions, actionToAdd._id]),
    modified: Date.now(),
  };

  DoCategoryCRUDService.send({
    type: 'UPDATE',
    _id: category._id,
    doc: updatedCategory,
  })
}

type DestroyableFormProps = {
  onFinish: (...args: any[]) => any
  actionToAdd: Action | undefined
}

const DestroyableForm: React.FC<DestroyableFormProps> = (props) => {
  const [options, setOptions] = useState<{ value: string, label: string }[]>([]);

  const [form] = useForm<{ category?: string }>();

  const { service } = useContext(GlobalServicesContext);

  const DoCategoryCRUDService = useSelector(service, ({ context }) => context.doCategoryCRUDActor);
  const doCategories = useSelector(DoCategoryCRUDService, ({ context }) => context.docs);
  const doCategoriesMap = useSelector(DoCategoryCRUDService, ({ context }) => context.docsMap);

  useEffect(() => {
    const sortedOptions = doCategories
      .slice()
      .sort((a, b) => b.modified - a.modified)
      .map((category) => ({
        value: category._id,
        label: category.title,
      }));
    setOptions(sortedOptions);

    form.setFieldsValue({ category: undefined })
  }, [form, doCategories])

  return (
    <Form
      form={form}
      labelCol={{ span: ACTIONABLE_MODAL_LABEL_COL }}
      onFinish={(values) => {
        console.log(values);
        onAddToCategory(values, props.actionToAdd, doCategoriesMap, DoCategoryCRUDService);
        props.onFinish();
      }}
    >
      <Form.Item
        label="Category"
        name='category'
      >
        <SearchSelect options={options} />
      </Form.Item>
      <Row justify='end'>
        <Form.Item>
          <Button
            htmlType='submit'
            type='primary'
          >
            Add
          </Button>
        </Form.Item>
      </Row>
    </Form>
  );
};

type SelectDoCategoryModalProps = {
  open: boolean
  actionToAdd: Action | undefined
  onCancel: (...args: any[]) => any
}

const SelectDoCategoryModal: React.FC<SelectDoCategoryModalProps> = (props) => {
  return (
    <Modal
      width={800}
      title='Select category'
      open={props.open}
      onCancel={props.onCancel}
      footer={null}
      destroyOnClose
    >
      <Row>
        <Col span={24}>
          <DestroyableForm
            actionToAdd={props.actionToAdd}
            onFinish={props.onCancel}
          />
        </Col>
      </Row>
    </Modal >
  );
};

export default SelectDoCategoryModal;

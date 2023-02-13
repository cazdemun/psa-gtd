import React from 'react';
import { useSelector } from '@xstate/react';
import { Button, Form, Input, Modal, Row, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Action, ProcessedItem, Project } from '../../models';
import { useForm } from 'antd/es/form/Form';
import { ActorRefFrom } from 'xstate';
import { ProcessedCRUDStateMachine } from '../../machines/GlobalServicesMachine';
import { SearchSelect } from '../common/Search';
import { recursiveParent, uniqueValues } from '../../utils';

const ACTIONABLE_MODAL_LABEL_COL = 2;

const projectIsAChild = (actionToProcess: Action | Project | undefined, doc: Project, processedItemsMap: Map<string, ProcessedItem>): boolean => {
  if (actionToProcess === undefined) return true;
  if (actionToProcess._id === doc._id) return true;
  const docParents = recursiveParent(doc._id, processedItemsMap);
  return docParents.some((_id) => _id === actionToProcess._id);
}

type ActionableFormValues = (Action | Project) & { rawActions: string }

const onFinish = (
  values: ActionableFormValues,
  actionToProcess: Action | Project | undefined,
  processedItemsMap: Map<string, ProcessedItem>,
  ProcessedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>
) => {
  if (actionToProcess === undefined) return;

  const updatedAction: Partial<Action | Project> = {
    title: values.title,
    content: values.content,
    modified: Date.now(),
  }

  if (values.project !== actionToProcess.project) {
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

    const updatedNewParents = recursiveParent(values.project, processedItemsMap)
      .map((_id) => processedItemsMap.get(_id))
      .filter((doc): doc is Project => doc !== undefined)
      .map((doc, i) => ({
        type: 'UPDATE',
        _id: doc._id,
        doc: {
          modified: Date.now(),
          actions: i === 0 ? uniqueValues([...doc.actions, actionToProcess._id]) : doc.actions,
        },
      }) as const);

    ProcessedCRUDService.send({
      type: 'BATCH',
      data: [
        ...updatedOldParents,
        ...updatedNewParents,
        {
          type: 'UPDATE',
          _id: actionToProcess?._id,
          doc: {
            ...updatedAction,
            project: values.project,
          },
        }
      ]
    })
  } else {
    ProcessedCRUDService.send({
      type: 'UPDATE',
      _id: actionToProcess?._id,
      doc: updatedAction,
    })
  }
}

type DestroyableFormProps = {
  processedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>
  actionToProcess: Action | Project | undefined,
  onFinish: (...args: any[]) => any
}

const DestroyableForm: React.FC<DestroyableFormProps> = (props) => {
  const [form] = useForm<ActionableFormValues>();

  const processedItems = useSelector(props.processedCRUDService, ({ context }) => context.docs);
  const processedItemsMap = useSelector(props.processedCRUDService, ({ context }) => context.docsMap);

  return (
    <Form
      form={form}
      labelCol={{ span: ACTIONABLE_MODAL_LABEL_COL }}
      initialValues={{
        ...props.actionToProcess,
      }}
      onFinish={(values) => {
        onFinish(values, props.actionToProcess, processedItemsMap, props.processedCRUDService);
        props.onFinish();
      }}
    >
      <Form.Item
        label="Type"
        name='type'
        rules={[{ required: true, message: 'Please select a type' }]}
      >
        <Select options={[
          {
            label: 'Project',
            value: 'project'
          },
          {
            label: 'Action',
            value: 'action'
          },
        ]} />
      </Form.Item>
      <Form.Item
        label="Title"
        name='title'
        rules={[{ required: true, message: 'Please add some text' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Desc." name='content'>
        <Input.TextArea
          autoSize={{ minRows: 2 }}
        />
      </Form.Item>
      <Row align='top'>
        <Form.Item
          label="Parent"
          name='project'
          labelCol={{ span: ACTIONABLE_MODAL_LABEL_COL }}
          wrapperCol={{ span: 21 }}
          style={{ flex: '1' }}
        >
          <SearchSelect
            showSearch
            options={processedItems
              .filter((doc): doc is Project => doc.type === 'project')
              .filter((doc) => !projectIsAChild(props.actionToProcess, doc, processedItemsMap))
              .sort((a, b) => b.modified - a.modified)
              .map((doc) => ({
                label: doc.title,
                value: doc._id,
              }))
            }
          />
        </Form.Item>
        <div>
          <Button icon={<SearchOutlined />} disabled />
        </div>
      </Row>
      <Row style={{ width: '100%' }}>
        <Form.Item
          label="Start"
          labelCol={{ span: ACTIONABLE_MODAL_LABEL_COL * 2 }}
          wrapperCol={{ span: 19 }}
          style={{ flex: '1' }}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Deadline"
          labelCol={{ span: ACTIONABLE_MODAL_LABEL_COL * 2 }}
          wrapperCol={{ span: 20 }}
          style={{ flex: '1' }}
        >
          <Input disabled />
        </Form.Item>
      </Row>
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

type ActionModalProps = {
  open: boolean
  onCancel: (...args: any[]) => any
  actionToProcess: Action | Project | undefined
  processedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>
}

const ActionModal: React.FC<ActionModalProps> = (props) => {
  return (
    <Modal
      width={800}
      title='Create action/project'
      open={props.open}
      onCancel={props.onCancel}
      footer={null}
      destroyOnClose
    >
      <DestroyableForm
        actionToProcess={props.actionToProcess}
        onFinish={props.onCancel}
        processedCRUDService={props.processedCRUDService}
      />
      <pre>
        {JSON.stringify(props.actionToProcess, null, 2)}
      </pre>
    </Modal >
  );
};

export default ActionModal;

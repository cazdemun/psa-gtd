import React, { useEffect } from 'react';
import { useSelector } from '@xstate/react';
import { Button, Form, Input, Modal, Row, Select } from 'antd';
import { getLastIndexFirstLevel, getNextIndex, uniqueValues } from '../../utils';
import { SearchOutlined } from '@ant-design/icons';
import { Action, Actionable, ProcessedItem, Project } from '../../models';
import { useForm, useWatch } from 'antd/es/form/Form';
import { v4 as uuidv4 } from 'uuid';
import { NewDoc } from '../../lib/Repository';
import { ActorRefFrom } from 'xstate';
import { ProcessedCRUDStateMachine } from '../../machines/GlobalServicesMachine';
import { SearchSelect } from '../common/Search';

const ACTIONABLE_MODAL_LABEL_COL = 2;

type ActionableFormValues = (Action | Project) & { rawActions: string }

const onFinish = (
  values: ActionableFormValues,
  lastProcessedIndex: number,
  actionableToProcess: Actionable | undefined,
  processedItemsMap: Map<string, ProcessedItem>,
  ProcessedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>
) => {
  // console.log(generateProjectsAndActions(values.content, lastProcessedIndex));

  if (values.type === 'project') {
    const projectId = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    const nextIndex = getNextIndex(lastProcessedIndex);

    const newActions: NewDoc<Action>[] = (values.rawActions ?? '')
      .split('\n')
      .map((actionTitle) => actionTitle.trim())
      .filter((actionTitle) => actionTitle !== undefined && actionTitle !== '')
      .map((title, i) => ({
        _id: uuidv4(),
        type: 'action',
        title,
        content: 'Generated from TextArea',
        created: Date.now(),
        index: `${nextIndex}.${getNextIndex(i)}`,
        modified: Date.now(),
        project: projectId,
      }))

    const newProject: NewDoc<Project> = {
      _id: projectId,
      type: 'project',
      content: values.content ?? '',
      project: values.project ?? undefined,
      created: Date.now(),
      index: nextIndex,
      modified: Date.now(),
      actions: newActions.map((newAction) => newAction._id as string),
      title: values.title,
    }

    const parentProject = processedItemsMap.get(values.project ?? '') as Project | undefined;

    if (parentProject) {
      const updatedParentProject: Partial<Project> = {
        actions: uniqueValues([...parentProject.actions, projectId]),
        modified: Date.now(),
      }
      ProcessedCRUDService.send({
        type: 'BATCH',
        data: [
          {
            type: 'CREATE',
            doc: [newProject, ...newActions],
          }, {
            type: 'UPDATE',
            _id: parentProject._id,
            doc: updatedParentProject,
          }, {
            type: 'DELETE',
            _id: actionableToProcess?._id,
          }
        ]
      })
    } else {
      ProcessedCRUDService.send({
        type: 'BATCH',
        data: [
          {
            type: 'CREATE',
            doc: [newProject, ...newActions],
          }, {
            type: 'DELETE',
            _id: actionableToProcess?._id,
          }
        ]
      })
    }
  }
  if (values.type === 'action') {
    const actionId = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    const nextIndex = getNextIndex(lastProcessedIndex);

    const newAction: NewDoc<Action> = {
      _id: actionId,
      type: 'action',
      title: values.title,
      content: values.content ?? '',
      project: values.project ?? undefined,
      created: Date.now(),
      index: nextIndex,
      modified: Date.now(),
    }

    const parentProject = (values.project !== undefined ? processedItemsMap.get(values.project) : undefined) as Project | undefined;

    if (parentProject) {
      const updatedParentProject: Partial<Project> = {
        actions: uniqueValues([...parentProject.actions, actionId]),
        modified: Date.now(),
      }
      ProcessedCRUDService.send({
        type: 'BATCH',
        data: [
          {
            type: 'CREATE',
            doc: newAction,
          }, {
            type: 'UPDATE',
            _id: parentProject._id,
            doc: updatedParentProject,
          }, {
            type: 'DELETE',
            _id: actionableToProcess?._id,
          }
        ]
      })
    } else {
      ProcessedCRUDService.send({
        type: 'BATCH',
        data: [
          {
            type: 'CREATE',
            doc: newAction,
          }, {
            type: 'DELETE',
            _id: actionableToProcess?._id,
          }
        ]
      })
    }
  }
}

type DestroyableFormProps = {
  actionableToProcess: Actionable | undefined,
  processedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>
  onFinish: (...args: any[]) => any
}

const DestroyableForm: React.FC<DestroyableFormProps> = (props) => {
  const [form] = useForm<ActionableFormValues>();

  const actionType = useWatch('type', form);

  const processedItems = useSelector(props.processedCRUDService, ({ context }) => context.docs);
  const processedItemsMap = useSelector(props.processedCRUDService, ({ context }) => context.docsMap);

  const lastProcessedIndex = getLastIndexFirstLevel(processedItems);

  useEffect(() => {
    if (actionType === 'project') {
      form.setFieldsValue({
        ...props.actionableToProcess,
        type: 'project',
        title: '',
        rawActions: props.actionableToProcess?.content,
        content: form.getFieldValue('content'),
      })
    }

    if (actionType === 'action') {
      form.setFieldsValue({
        ...props.actionableToProcess,
        type: 'action',
        title: props.actionableToProcess?.content,
        content: form.getFieldValue('content'),
      })
    }
  }, [form, actionType, props.actionableToProcess])


  return (
    <Form
      form={form}
      labelCol={{ span: ACTIONABLE_MODAL_LABEL_COL }}
      initialValues={{
        ...props.actionableToProcess,
        type: 'project',
        content: '',
        rawActions: props.actionableToProcess?.content,
      }}
      onFinish={(values) => {
        onFinish(values, lastProcessedIndex, props.actionableToProcess, processedItemsMap, props.processedCRUDService);
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
      {actionType === 'project' && (
        <Form.Item
          label="Actions"
          name='rawActions'
        >
          <Input.TextArea
            autoSize={{ minRows: 10 }}
          />
        </Form.Item>
      )}
      <Row >
        <Form.Item>
          <Button
            htmlType='submit'
            type='primary'
          >
            Create
          </Button>
        </Form.Item>
      </Row>
    </Form>
  );
};

type ActionableModalProps = {
  open: boolean
  onCancel: (...args: any[]) => any
  actionableToProcess: Actionable | undefined
  processedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>
}

const ActionableModal: React.FC<ActionableModalProps> = (props) => {
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
        processedCRUDService={props.processedCRUDService}
        actionableToProcess={props.actionableToProcess}
        onFinish={props.onCancel}
      />
      <pre>
        {JSON.stringify(props.actionableToProcess, null, 2)}
      </pre>
    </Modal >
  );
};

export default ActionableModal;

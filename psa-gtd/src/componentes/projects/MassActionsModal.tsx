import React from 'react';
import { useSelector } from '@xstate/react';
import { Button, Form, Modal, Row } from 'antd';
import { getLastIndexFirstLevel, uniqueValues } from '../../utils';
import { SearchOutlined } from '@ant-design/icons';
import { Action, ProcessedItem, Project } from '../../models';
import { useForm } from 'antd/es/form/Form';
import { ActorRefFrom } from 'xstate';
import { ProcessedCRUDStateMachine } from '../../machines/GlobalServicesMachine';
import { SearchSelect } from '../common/Search';

const ACTIONABLE_MODAL_LABEL_COL = 2;

const recursiveParent = (projectId: string | undefined, processedItemsMap: Map<string, ProcessedItem>): string[] => {
  if (projectId === undefined) return [];

  const project = processedItemsMap.get(projectId);

  if (project === undefined) return [];
  if (project.type !== 'project' && project.type !== 'action') return [];
  return [projectId].concat(recursiveParent(project.project, processedItemsMap));

}

type ActionableFormValues = (Action | Project) & { rawActions: string }

const onFinish = (
  values: ActionableFormValues,
  lastProcessedIndex: number,
  actionsToProcess: string[],
  processedItemsMap: Map<string, ProcessedItem>,
  ProcessedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>
) => {
  if (actionsToProcess.length === 0) return;

  const [firstKey] = actionsToProcess;
  const firstAction = processedItemsMap.get(firstKey) as Action | undefined;

  if (firstAction === undefined) return;

  const parent = firstAction.project === undefined ? undefined : processedItemsMap.get(firstAction.project) as Project | undefined;

  if (values.project !== parent?._id) {
    const updatedActions = actionsToProcess
      .map((_id) => processedItemsMap.get(_id))
      .filter((doc): doc is Action => doc !== undefined)
      .map((doc) => ({
        type: 'UPDATE',
        _id: doc._id,
        doc: {
          modified: Date.now(),
          project: values.project,
        },
      }) as const);

    // On mass actions the grandparent projects are not modified
    const updatedOldParents = recursiveParent(parent?._id, processedItemsMap)
      .map((_id) => processedItemsMap.get(_id))
      .filter((doc): doc is Project => doc !== undefined)
      .filter((_, i) => i === 0)
      .map((doc) => ({
        type: 'UPDATE',
        _id: doc._id,
        doc: {
          // modified: Date.now(),
          actions: doc.actions.filter((action) => !actionsToProcess.some((_id) => _id === action)),
        },
      }) as const);

    const updatedNewParents = recursiveParent(values.project, processedItemsMap)
      .map((_id) => processedItemsMap.get(_id))
      .filter((doc): doc is Project => doc !== undefined)
      .map((doc, i) => i === 0 ? ({
        type: 'UPDATE',
        _id: doc._id,
        doc: {
          modified: Date.now(),
          actions: uniqueValues([...doc.actions, ...actionsToProcess]),
        },
      }) as const : ({
        type: 'UPDATE',
        _id: doc._id,
        doc: {
          modified: Date.now(),
        },
      }) as const);

    ProcessedCRUDService.send({
      type: 'BATCH',
      data: [
        ...updatedOldParents,
        ...updatedNewParents,
        ...updatedActions,
      ]
    })
  }
}

type DestroyableFormProps = {
  processedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>
  actionsToProcess: string[],
  onFinish: (...args: any[]) => any
}

const DestroyableForm: React.FC<DestroyableFormProps> = (props) => {
  const [form] = useForm<ActionableFormValues>();

  const processedItems = useSelector(props.processedCRUDService, ({ context }) => context.docs);
  const processedItemsMap = useSelector(props.processedCRUDService, ({ context }) => context.docsMap);

  const [firstKey] = props.actionsToProcess;
  const firstAction = processedItemsMap.get(firstKey) as Action | undefined;

  const lastProcessedIndex = getLastIndexFirstLevel(processedItems);

  return (
    <Form
      form={form}
      labelCol={{ span: ACTIONABLE_MODAL_LABEL_COL }}
      initialValues={{
        project: firstAction?.project,
      }}
      onFinish={(values) => {
        onFinish(values, lastProcessedIndex, props.actionsToProcess, processedItemsMap, props.processedCRUDService);
        props.onFinish();
      }}
    >
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
      <Row justify='end'>
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

type MassActionsModalProps = {
  open: boolean
  onCancel: (...args: any[]) => any
  actionsToProcess: string[]
  processedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>
}

const MassActionsModal: React.FC<MassActionsModalProps> = (props) => {
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
        actionsToProcess={props.actionsToProcess}
        onFinish={props.onCancel}
        processedCRUDService={props.processedCRUDService}
      />
      <pre>
        {JSON.stringify(props.actionsToProcess, null, 2)}
      </pre>
    </Modal >
  );
};

export default MassActionsModal;

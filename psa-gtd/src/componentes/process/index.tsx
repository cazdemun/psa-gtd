import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { Button, Col, Divider, Form, Input, List, Modal, Row, Select, Space } from 'antd';
import BucketItemListItem from '../collect/BucketItem';
import creatBucketItemProcessMachine from '../../machines/bucketItemProcessMachine';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { ActionableTable, ProjectsTable, ReferenceSupportTable, SomedayMaybeTable, TrashTable } from './TemporalTables';
import { deleteItemWithConfirm, generateProjectsAndActions, getLastIndexFirstLevel, sortByIndex } from '../../utils';
import ItemContent from '../ContentItem';
import { DeleteOutlined, FormOutlined, SearchOutlined, SwapRightOutlined } from '@ant-design/icons';
import BucketItemProcessListItem from './BucketItemProcessListItem';
import { Action, Actionable, Project } from '../../models';
import { useForm, useWatch } from 'antd/es/form/Form';
import { v4 as uuidv4 } from 'uuid';
import { NewDoc } from '../../lib/Repository';

const getNextIndex = (lastIndex: number): string => (lastIndex + 1).toString();

const ACTIONABLE_MODAL_LABEL_COL = 2;

type DestroyableFormProps = {
  actionableToProcess: Actionable | undefined,
  lastIndex: number
}

const DestroyableForm: React.FC<DestroyableFormProps> = (props) => {
  const [form] = useForm<Action | Project>();
  const { type, ...initialValues } = props.actionableToProcess || {};

  const actionType = useWatch('type', form);

  const { service } = useContext(GlobalServicesContext);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItems = useSelector(ProcessedCRUDService, ({ context }) => context.docs);

  const lastProcessedIndex = getLastIndexFirstLevel(processedItems);

  return (
    <Form
      form={form}
      labelCol={{ span: ACTIONABLE_MODAL_LABEL_COL }}
      initialValues={initialValues}
      onFinish={(values) => {
        // console.log(generateProjectsAndActions(values.content, lastProcessedIndex));

        if (values.type === 'project') {
          const projectId = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
          const nextIndex = getNextIndex(lastProcessedIndex);

          const newActions: NewDoc<Action>[] = values.content
            .split('\n')
            .map((actionContent) => actionContent.trim())
            .filter((actionContent) => actionContent !== undefined && actionContent !== '')
            .map((content, i) => ({
              _id: uuidv4(),
              type: 'action',
              content,
              created: Date.now(),
              index: `${nextIndex}.${getNextIndex(i)}`,
              modified: Date.now(),
              project: projectId,
            }))

          const newProject: NewDoc<Project> = {
            _id: projectId,
            type: 'project',
            content: '',
            created: Date.now(),
            index: nextIndex,
            modified: Date.now(),
            actions: newActions.map((newAction) => newAction._id as string),
            title: values.title
          }

          ProcessedCRUDService.send({
            type: 'BATCH',
            data: [
              {
                type: 'CREATE',
                doc: [newProject, ...newActions],
              }, {
                type: 'DELETE',
                _id: props.actionableToProcess?._id,
              }
            ]
          })
        }
      }}
    >
      <Form.Item
        label="Type"
        name='type'
        rules={[
          {
            required: true,
            message: 'Please select a type'
          }
        ]}
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
      {actionType === 'project' && (
        <Form.Item
          label="Title"
          name='title'
          rules={[
            {
              required: true,
              message: 'Please add some text'
            }
          ]}
        >
          <Input />
        </Form.Item>
      )}
      <Row align='top'>
        <Form.Item
          label="Parent"
          labelCol={{ span: ACTIONABLE_MODAL_LABEL_COL }}
          wrapperCol={{ span: 21 }}
          style={{ flex: '1' }}
        >
          <Input disabled />
        </Form.Item>
        <div>
          <Button icon={<SearchOutlined />} />
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
      <Form.Item label={"Actions"} name='content'>
        <Input.TextArea
          autoSize={{ minRows: 10 }}
        />
      </Form.Item>
      <Form.Item>
        <Button
          htmlType='submit'
          type='primary'
        >
          Create
        </Button>
      </Form.Item>
    </Form>
  );
};

type ActionableModalProps = {
  open: boolean
  onCancel: (...args: any[]) => any
  onOk: (...args: any[]) => any
  actionableToProcess: Actionable | undefined
  lastIndex: number
}

const ActionableModal: React.FC<ActionableModalProps> = (props) => {
  return (
    <Modal
      width={800}
      title='Create action/project'
      open={props.open}
      onCancel={props.onCancel}
      onOk={props.onOk}
      destroyOnClose
    >
      <DestroyableForm actionableToProcess={props.actionableToProcess} lastIndex={props.lastIndex} />
      <pre>
        {JSON.stringify(props.actionableToProcess, null, 2)}
      </pre>
    </Modal >
  );
};

type ProcessModuleActionableModeProps = {
  goToNormalMode: (...args: any[]) => any
}

const ProcessModuleActionableMode: React.FC<ProcessModuleActionableModeProps> = (props) => {
  const { service } = useContext(GlobalServicesContext);

  const [state, setState] = useState<'normal' | 'edit'>('normal');
  const [actionableToProcess, setActionableToProcess] = useState<Actionable | undefined>(undefined);

  // const BucketCRUDService = useSelector(service, ({ context }) => context.bucketCRUDActor);
  // const bucketItems = useSelector(BucketCRUDService, ({ context }) => context.docs);
  // const sortedBucketItems = bucketItems.slice().sort((a, b) => sortByIndex(a, b));

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItems = useSelector(ProcessedCRUDService, ({ context }) => context.docs);

  const actionableItems = processedItems.filter((doc): doc is Actionable => doc.type === 'actionable');
  const sortedActionableItems = actionableItems.slice().sort((a, b) => sortByIndex(a, b));

  const lastProcessedIndex = getLastIndexFirstLevel(processedItems);

  return (
    <>
      <Row gutter={[16, 16]} style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px' }}>
        <Col span={14}>
          <List
            header={(
              <Row justify='end'>
                <Button
                  icon={<SwapRightOutlined />}
                  onClick={props.goToNormalMode}
                />
              </Row>
            )}
            bordered
            dataSource={sortedActionableItems}
            renderItem={(doc) => (
              <List.Item
                style={{ width: '100%', alignItems: 'start' }}
                extra={(
                  <Space align='start' direction='vertical'>
                    <Button
                      icon={<FormOutlined />}
                      onClick={() => {
                        setState('edit');
                        setActionableToProcess(doc);
                      }}
                    />
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => deleteItemWithConfirm(ProcessedCRUDService, doc._id)}
                    />
                  </Space>
                )}
              >
                <ItemContent doc={doc} />
              </List.Item>
            )}
          />
        </Col>
        <Col span={10}>
          <ProjectsTable />
          Projects table
          Actions table
        </Col>
      </Row >
      <ActionableModal
        lastIndex={lastProcessedIndex}
        open={state === 'edit'}
        onCancel={() => {
          setState('normal');
          setActionableToProcess(undefined);
        }}
        onOk={() => {
          if (window.confirm("Do you want to destroy this actionable and create an action/project?")) {
            setState('normal');
            setActionableToProcess(undefined);
          }
        }}
        actionableToProcess={actionableToProcess}
      />
    </>
  );
};

type ProcessModuleProps = {
  processes: ActorRefFrom<typeof creatBucketItemProcessMachine>[]
}

const ProcessModule: React.FC<ProcessModuleProps> = (props) => {
  const [mode, setMode] = useState<'normal' | 'actionable'>('normal');

  const { service, globalConfig } = useContext(GlobalServicesContext);

  const BucketCRUDService = useSelector(service, ({ context }) => context.bucketCRUDActor);
  const bucketItems = useSelector(BucketCRUDService, ({ context }) => context.docs);
  const sortedBucketItems = bucketItems.slice().sort((a, b) => sortByIndex(a, b));

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItems = useSelector(ProcessedCRUDService, ({ context }) => context.docs);

  const actionableItems = processedItems.filter((doc) => doc.type === 'actionable');

  useEffect(() => {
    if (globalConfig.disableAutoActionableTable === false) {
      if (actionableItems.length < globalConfig.actionableTableLimit) {
        setMode('normal');
      } else {
        setMode('actionable');
      }
    }
  }, [actionableItems.length, globalConfig.actionableTableLimit, globalConfig.disableAutoActionableTable])

  return mode === 'normal' ? (
    <Row gutter={[16, 16]} style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px' }}>
      <Col span={16}>
        <List
          bordered
          dataSource={sortedBucketItems}
          renderItem={(doc, i) => (
            <Row style={{ width: '100%' }}>
              <Col span={16}>
                <BucketItemListItem doc={doc} bucketCRUDService={BucketCRUDService} />
              </Col>
              <Col span={8}>
                <Row style={{ height: '100%' }} >
                  <Divider type='vertical' style={{ height: '100%' }} />
                  {props.processes.at(i) !== undefined && (
                    <BucketItemProcessListItem doc={doc} processActor={props.processes.at(i) as any} />
                  )}
                </Row>
              </Col>
              <Divider type='horizontal' style={{ margin: '0px', padding: '0px', width: '100%' }} />
            </Row>
          )}
        />
      </Col>
      <Col span={8}>
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <ActionableTable goToActionableMode={() => setMode('actionable')} />
          </Col>
          <Col span={24}>
            <ReferenceSupportTable />
          </Col>
          <Col span={24}>
            <SomedayMaybeTable />
          </Col>
          <Col span={24}>
            <TrashTable />
          </Col>
        </Row>
      </Col>
    </Row >
  ) : (
    <ProcessModuleActionableMode goToNormalMode={() => setMode('normal')} />
  );
}

export default ProcessModule;

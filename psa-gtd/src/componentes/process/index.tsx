import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { Button, Col, Divider, List, Row, Space } from 'antd';
import BucketItemListItem from '../collect/BucketItem';
import creatBucketItemProcessMachine from '../../machines/bucketItemProcessMachine';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { ActionableTable, ReferenceSupportTable, SingleActionsTable, SomedayMaybeTable, TrashTable } from './TemporalTables';
import { deleteItemWithConfirm, sortByIndex } from '../../utils';
import ItemContent from '../ContentItem';
import { DeleteOutlined, FormOutlined, SwapRightOutlined } from '@ant-design/icons';
import BucketItemProcessListItem from './BucketItemProcessListItem';
import { Actionable } from '../../models';
import ActionableModal from './ActionableModal';
import ActionsProjectsTable from '../projects/ActionsProjectsTable';

type ProcessModuleActionableModeProps = {
  goToNormalMode: (...args: any[]) => any
}

const ProcessModuleActionableMode: React.FC<ProcessModuleActionableModeProps> = (props) => {
  const { service } = useContext(GlobalServicesContext);

  const [state, setState] = useState<'normal' | 'edit'>('normal');
  const [actionableToProcess, setActionableToProcess] = useState<Actionable | undefined>(undefined);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItems = useSelector(ProcessedCRUDService, ({ context }) => context.docs);

  const actionableItems = processedItems.filter((doc): doc is Actionable => doc.type === 'actionable');
  const sortedActionableItems = actionableItems.slice().sort((a, b) => sortByIndex(a, b));

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
          <ActionsProjectsTable />
          <SingleActionsTable />
        </Col>
      </Row >
      <ActionableModal
        open={state === 'edit'}
        onCancel={() => {
          setState('normal');
          setActionableToProcess(undefined);
        }}
        processedCRUDService={ProcessedCRUDService}
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

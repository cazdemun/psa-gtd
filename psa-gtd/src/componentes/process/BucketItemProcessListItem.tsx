import React, { useContext, useEffect } from 'react';
import { useSelector } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { Button, Col, Row, Space } from 'antd';
import { Actionable, BucketItem, ProcessedItem, Reference, Someday, Support, Trash } from '../../models';
import creatBucketItemProcessMachine from '../../machines/bucketItemProcessMachine';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { getLastIndexFirstLevel } from '../../utils';
import { NewDoc } from '../../lib/Repository';
import { BucketCRUDStateMachine, ProcessedCRUDStateMachine } from '../../machines/GlobalServicesMachine';

const createProcessedItem = <T extends ProcessedItem>(
  oldBucketItem: BucketItem, newDoc: NewDoc<T>,
  BucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>,
  ProcessedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>
) => {
  ProcessedCRUDService.send({
    type: 'CREATE',
    doc: newDoc,
  });

  BucketCRUDService.send({ type: 'DELETE', _id: oldBucketItem._id });
}

type BucketItemProcessListItemProps = {
  doc: BucketItem
  processActor: ActorRefFrom<typeof creatBucketItemProcessMachine>
}

const BucketItemProcessListItem: React.FC<BucketItemProcessListItemProps> = (props) => {
  const { service } = useContext(GlobalServicesContext);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedDocs = useSelector(ProcessedCRUDService, ({ context }) => context.docs);

  const BucketCRUDService = useSelector(service, ({ context }) => context.bucketCRUDActor);

  const determineRelevance = useSelector(props.processActor, (state) => state.matches('determineRelevance'))

  const determineAction = useSelector(props.processActor, (state) => state.matches('determineAction'))
  const somedayMaybe = useSelector(props.processActor, (state) => state.matches('somedayMaybe'))
  const trash = useSelector(props.processActor, (state) => state.matches('trash'))

  const draftActions = useSelector(props.processActor, (state) => state.matches('draftActions'))
  const referenceOrSupport = useSelector(props.processActor, (state) => state.matches('referenceOrSupport'))

  const actionableTable = useSelector(props.processActor, (state) => state.matches('actionableTable'))
  const referenceTable = useSelector(props.processActor, (state) => state.matches('referenceTable'))
  const supportTable = useSelector(props.processActor, (state) => state.matches('supportTable'))
  const doIt = useSelector(props.processActor, (state) => state.matches('doIt'))

  const lastIndex = getLastIndexFirstLevel(processedDocs);

  useEffect(() => {
    props.processActor.send({ type: 'RESET' });
  }, [props.doc._id, props.processActor])

  return (
    <div style={{ height: '100%', flex: '1', display: 'flex', flexDirection: 'column' }}>
      {determineRelevance && (
        <Space direction='vertical'>
          <Row>
            Is this relevant on this quatrimester? (check goals and milestones)
          </Row>
          <Space>
            <Button onClick={() => props.processActor.send({ type: 'QUARTERLY' })}>
              Yes, absolutely
            </Button>
            <Button
              onClick={() => {
                props.processActor.send({ type: 'NOT_QUARTERLY' });

                const newItem: NewDoc<Someday> = {
                  type: 'someday',
                  item: props.doc,
                  created: Date.now(),
                  index: (lastIndex + 1).toString(),
                  content: props.doc.content,
                };

                createProcessedItem(props.doc, newItem, BucketCRUDService, ProcessedCRUDService);
              }}
            >
              No, not really
            </Button>
          </Space>
          <Space>
            <Button onClick={() => {
              props.processActor.send({ type: 'TRASH' });

              const newItem: NewDoc<Trash> = {
                type: 'trash',
                item: props.doc,
                created: Date.now(),
                index: (lastIndex + 1).toString(),
                content: props.doc.content,
              };

              createProcessedItem(props.doc, newItem, BucketCRUDService, ProcessedCRUDService);
            }}>
              Trash
            </Button>
          </Space>
        </Space>
      )}
      {determineAction && (
        <Row>
          <Space direction='vertical'>
            <Row>
              Which action does it have?
            </Row>
            <Space>
              <Button onClick={() => props.processActor.send({ type: 'HAS_ACTION' })}>
                Some action (I know which one)
              </Button>
              <Button onClick={() => {
                props.processActor.send({ type: 'IDK_HAS_ACTION' });

                const newItem: NewDoc<Actionable> = {
                  type: 'actionable',
                  created: Date.now(),
                  index: (lastIndex + 1).toString(),
                  content: props.doc.content,
                };

                createProcessedItem(props.doc, newItem, BucketCRUDService, ProcessedCRUDService);
              }}>
                Idk but it has one
              </Button>
            </Space>
            <Space>
              <Button onClick={() => props.processActor.send({ type: 'NO_ACTION' })}>
                No action
              </Button>
            </Space>
          </Space>
        </Row>
      )}
      {somedayMaybe && (
        <>
          Sent to someday/maybe (add a potential date here?)
        </>
      )}
      {trash && (
        <>
          Sent to trash
        </>
      )}
      {draftActions && (
        <Space direction='vertical'>
          <Row>
            Take your time to elaborate the action/s. Can it be done under two minutes?
          </Row>
          <Space>
            <Button onClick={() => props.processActor.send({ type: 'TWO_MINUTES' })}>
              Yes, it can be done ASAP (only for single task)
            </Button>
          </Space>
          <Space>
            <Button onClick={() => {
              props.processActor.send({ type: 'MORE_THAN_TWO_MINUTES' })

              const newItem: NewDoc<Actionable> = {
                type: 'actionable',
                created: Date.now(),
                index: (lastIndex + 1).toString(),
                content: props.doc.content,
              };

              createProcessedItem(props.doc, newItem, BucketCRUDService, ProcessedCRUDService);
            }}>
              No, it will take longer
            </Button>
          </Space>
        </Space>
      )}
      {referenceOrSupport && (
        <Space direction='vertical'>
          <Row>
            Is it a reference: (something already done or multiproject) or support (created and specific for one proyect)?
          </Row>
          <Row>
            <ul>
              <li>
                A reference (something already done/created but usable by multiple projects)
              </li>
              <li>
                Support material (created and specific for one proyect)?
              </li>
            </ul>
          </Row>
          <Space>
            <Button onClick={() => {
              props.processActor.send({ type: 'REFERENCE' });

              const newItem: NewDoc<Reference> = {
                type: 'reference',
                projects: [],
                created: Date.now(),
                index: (lastIndex + 1).toString(),
                content: props.doc.content,
              };

              createProcessedItem(props.doc, newItem, BucketCRUDService, ProcessedCRUDService);
            }}>
              Reference
            </Button>
            <Button onClick={() => {
              props.processActor.send({ type: 'SUPPORT' });

              const newItem: NewDoc<Support> = {
                type: 'support',
                projects: [],
                created: Date.now(),
                index: (lastIndex + 1).toString(),
                content: props.doc.content,
              };

              createProcessedItem(props.doc, newItem, BucketCRUDService, ProcessedCRUDService);
            }}>
              Support
            </Button>
          </Space>
        </Space>
      )}
      {actionableTable && (
        <>
          Sent to actionableTable, you have a limit of (5)
        </>
      )}
      {referenceTable && (
        <>
          Sent to reference table (tbd)
        </>
      )}
      {supportTable && (
        <>
          Sent to support table (tbd)
        </>
      )}
      {doIt && (
        <Space direction='vertical'>
          <Row>
            DO IT! (Press the done button when finished)
          </Row>
          <Row justify='center'>
            <Button type='primary'>
              Done
            </Button>
          </Row>
        </Space>
      )}
      <Row
        style={{ flex: '1', padding: '8px 8px 8px 0px', display: 'flex', alignItems: 'end', justifyContent: 'end', alignContent: 'end' }}
        gutter={[8, 8]}
      >
        <Col span={24} hidden>
          <Row justify='end'>
            <Space>
              <Button>
                Actionable
              </Button>
              <Button>
                Do it
              </Button>
              <Button>
                Someday
              </Button>
            </Space>
          </Row>
        </Col>
        <Col span={24} hidden>
          <Row justify='end'>
            <Space>
              <Button>
                Reference
              </Button>
              <Button>
                Support
              </Button>
              <Button>
                Trash
              </Button>
            </Space>
          </Row>
        </Col>
        <Col span={24}>
          <Row justify='end'>
            <Button onClick={() => props.processActor.send({ type: 'RESET' })} disabled={determineRelevance}>
              Reset
            </Button>
          </Row>
        </Col>
      </Row>
    </div >
  );
};

export default BucketItemProcessListItem;

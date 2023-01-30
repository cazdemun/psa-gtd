import React, { useEffect } from 'react';
import { useSelector } from '@xstate/react';
import { BucketCRUDStateMachine } from '../../machines/GlobalServicesMachine';
import { ActorRefFrom } from 'xstate';
import { Button, Card, Col, Divider, List, Row, Space } from 'antd';
import BucketItemListItem from '../collect/BucketItem';
import { BucketItem } from '../../models';
import creatBucketItemProcessMachine from '../../machines/bucketItemProcessMachine';


type BucketItemProcessListItemProps = {
  doc: BucketItem
  bucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>
  processActor: ActorRefFrom<typeof creatBucketItemProcessMachine>
}

const BucketItemProcessListItem: React.FC<BucketItemProcessListItemProps> = (props) => {

  const determineAction = useSelector(props.processActor, (state) => state.matches('determineAction'))
  const actionableTable = useSelector(props.processActor, (state) => state.matches('actionableTable'))
  const draftActions = useSelector(props.processActor, (state) => state.matches('draftActions'))
  const referenceOrSupport = useSelector(props.processActor, (state) => state.matches('referenceOrSupport'))
  const referenceTable = useSelector(props.processActor, (state) => state.matches('referenceTable'))
  const supportTable = useSelector(props.processActor, (state) => state.matches('supportTable'))
  const trash = useSelector(props.processActor, (state) => state.matches('trash'))

  const checkQuarterly = useSelector(props.processActor, (state) => state.matches('checkQuarterly'))
  const somedayMaybe = useSelector(props.processActor, (state) => state.matches('somedayMaybe'))

  const doIt = useSelector(props.processActor, (state) => state.matches('doIt'))

  useEffect(() => {
    props.processActor.send({ type: 'RESET' });
  }, [props.doc._id, props.processActor])

  return (
    <div style={{ height: '100%', flex: '1', display: 'flex', flexDirection: 'column' }}>
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
              <Button onClick={() => props.processActor.send({ type: 'IDK_HAS_ACTION' })}>
                Idk but it has one
              </Button>
            </Space>
            <Space>
              <Button onClick={() => props.processActor.send({ type: 'NO_ACTION' })}>
                No action
              </Button>
              <Button onClick={() => props.processActor.send({ type: 'TRASH' })}>
                Trash
              </Button>
            </Space>
          </Space>
        </Row>
      )}
      {draftActions && (
        <Space direction='vertical'>
          <Row>
            Does it need to be done on this quatrimester?
          </Row>
          <Space>
            <Button onClick={() => props.processActor.send({ type: 'QUARTERLY' })}>
              Yes, absolutely
            </Button>
            <Button onClick={() => props.processActor.send({ type: 'NOT_QUARTERLY' })}>
              No, not really
            </Button>
          </Space>
        </Space>
      )}
      {actionableTable && (
        <>
          Sent to actionableTable, you have a limit of (5)
        </>
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
            <Button onClick={() => props.processActor.send({ type: 'REFERENCE' })}>
              Reference
            </Button>
            <Button onClick={() => props.processActor.send({ type: 'SUPPORT' })}>
              Support
            </Button>
          </Space>
        </Space>
      )}
      {checkQuarterly && (
        <Space direction='vertical'>
          <Row>
            Can it be done under two minutes?
          </Row>
          <Space>
            <Button onClick={() => props.processActor.send({ type: 'TWO_MINUTES' })}>
              Yes, it can be done ASAP
            </Button>
            <Button onClick={() => props.processActor.send({ type: 'MORE_THAN_TWO_MINUTES' })}>
              No, it will take longer
            </Button>
          </Space>
        </Space>
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
      {somedayMaybe && (
        <>
          Sent to someday/maybe (add a potential date here?)
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
      {trash && (
        <>
          Sent to trash
        </>
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
            <Button onClick={() => props.processActor.send({ type: 'RESET' })} disabled={determineAction}>
              Reset
            </Button>
          </Row>
        </Col>
      </Row>
    </div >
  );
};

type ProcessModuleProps = {
  bucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>
  processes: ActorRefFrom<typeof creatBucketItemProcessMachine>[]
  sortedDocs: BucketItem[]
}

const ProcessModule: React.FC<ProcessModuleProps> = (props) => {
  return (
    <Row gutter={[16, 16]} style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px' }}>
      <Col span={16}>
        <List
          bordered
          dataSource={props.sortedDocs}
          renderItem={(doc, i) => (
            <Row style={{ width: '100%' }}>
              <Col span={16}>
                <BucketItemListItem doc={doc} bucketCRUDService={props.bucketCRUDService} mainColSpan={14} />
              </Col>
              <Col span={8}>
                <Row style={{ height: '100%' }} >
                  <Divider type='vertical' style={{ height: '100%' }} />
                  {props.processes.at(i) !== undefined ? (
                    <BucketItemProcessListItem doc={doc} bucketCRUDService={props.bucketCRUDService} processActor={props.processes.at(i) as any} />
                  ) : null}
                </Row>
              </Col>
              <Divider type='horizontal' style={{ margin: '0px', padding: '0px', width: '100%' }} />
            </Row>
          )}
        />
      </Col>
      <Col span={8}>
        <Card title='Actionable table (max. 5)'>

        </Card>
        <Card title='Reference/Support table (max. TBD)'>
          This is a table because as a reference it needs to be put into a category and maybe linked to a project, and as a support material needs to be necessary linked to a project that may not be even exists yet.
        </Card>
        <Card title='Trash'>

        </Card>
      </Col>
    </Row >
  );
}

export default ProcessModule;

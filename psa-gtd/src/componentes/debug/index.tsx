import React from 'react';
import { Button, Card, Col } from 'antd';
import { DeleteOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import createCRUDMachine from '../../lib/CRUDMachine';
import { BaseDoc, OptionalId } from '../../lib/Repository';

type DebugModuleProps<T extends BaseDoc> = {
  crudService: ActorRefFrom<ReturnType<typeof createCRUDMachine<T>>>
  newDoc: OptionalId<T>
  updateDoc: (doc: T) => Partial<T>
  span?: number
}

const DebugModule = <T extends BaseDoc>(props: DebugModuleProps<T>) => {
  const docs = useSelector(props.crudService, ({ context }) => context.docs);
  return (
    <>
      <Button
        icon={<PlusOutlined />}
        onClick={() => props.crudService.send({ type: 'CREATE', doc: props.newDoc })}
      >
        Add
      </Button>
      <Col span={props.span ?? 24}>
        {docs.map((doc) => (
          <Card
            key={doc._id}
            title={doc._id}
            extra={(
              <>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => props.crudService.send({ type: 'UPDATE', _id: doc._id, doc: props.updateDoc(doc) })}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => props.crudService.send({ type: 'DELETE', _id: doc._id })}
                />
              </>
            )}
          >
            <pre>{JSON.stringify(doc, null, 2)}</pre>
          </Card>
        ))}
      </Col>
    </>
  );
}

export default DebugModule;

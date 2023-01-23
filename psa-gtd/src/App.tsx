import React from 'react';
import { Button, Card, Col } from 'antd';
import { DeleteOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useInterpret, useSelector } from '@xstate/react';
import GlobalServicesMachine from './lib/GlobalServicesMachine';

function App() {
  const GlobalServices = useInterpret(GlobalServicesMachine);
  
  const TestCRUDService = useSelector(GlobalServices, ({ context }) => context.testCRUDActor);

  const docs = useSelector(TestCRUDService, ({ context }) => context.docs);

  return (
    <div className="App">
      <Button
        icon={<PlusOutlined />}
        onClick={() => TestCRUDService.send({ type: 'CREATE', doc: { title: 'New Test' } })}
      >
        Add
      </Button>
      <Col span={8}>
        {docs.map((doc) => (
          <Card
            key={doc._id}
            title={doc.title}
            extra={(
              <>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => TestCRUDService.send({ type: 'UPDATE', _id: doc._id, doc: { title: doc.title === 'New Test' ? 'Modified Test' : 'New Test' } })}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => TestCRUDService.send({ type: 'DELETE', _id: doc._id })}
                />
              </>
            )}
          >
            <pre>{JSON.stringify(doc, null, 2)}</pre>
          </Card>
        ))}
      </Col>
    </div>
  );
}

export default App;

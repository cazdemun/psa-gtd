import React, { useEffect, useState } from 'react';
import { Button, Card, Col } from 'antd';
import { DeleteOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import Repository from './lib/Repository';


type Test = {
  _id: string
  title: string
}

const datastore = new Repository<Test>('test');

function App() {
  const [docs, setDocs] = useState<Test[]>([])

  useEffect(() => {
    datastore.db.on('insert', () => {
      datastore.read({}).then((docs) => setDocs(docs))
    })

    datastore.db.on('remove', () => {
      datastore.read({}).then((docs) => setDocs(docs))
    })

    datastore.db.on('update', () => {
      datastore.read({}).then((docs) => setDocs(docs))
    })

    datastore.db.find({}).then((docs) => setDocs(docs))

    return () => {
      datastore.db.removeAllListeners('insert');
      datastore.db.removeAllListeners('update');
      datastore.db.removeAllListeners('remove');
    }
  }, []);

  return (
    <div className="App">
      <Button
        icon={<PlusOutlined />}
        onClick={() => datastore.create({ title: 'New Test' })}
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
                  onClick={() => datastore.update(doc._id, { title: doc.title === 'New Test' ? 'Modified Test' : 'New Test' })}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => datastore.delete(doc._id)}
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

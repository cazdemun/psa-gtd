import React, { useEffect, useState } from 'react';
import Datastore from 'nedb-promises';
import { Button, Card, Col } from 'antd';
import { DeleteOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';

type Test = {
  _id: string
  title: string
}

const datastore = Datastore.create('test') as Datastore<Test>;

function App() {
  const [docs, setDocs] = useState<Test[]>([])

  useEffect(() => {
    datastore.on('insert', () => {
      datastore.find({}).then((docs) => setDocs(docs))
    })

    datastore.on('remove', () => {
      datastore.find({}).then((docs) => setDocs(docs))
    })

    datastore.on('update', () => {
      datastore.find({}).then((docs) => setDocs(docs))
    })

    datastore.find({}).then((docs) => setDocs(docs))

    return () => {
      datastore.removeAllListeners('insert');
      datastore.removeAllListeners('update');
      datastore.removeAllListeners('remove');
    }
  }, []);

  return (
    <div className="App">
      <Button
        icon={<PlusOutlined />}
        onClick={() => datastore.insert<Omit<Test, '_id'>>({ title: 'New Test' })}
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
                  onClick={() => datastore.updateOne({ _id: doc._id }, { title: doc.title === 'New Test' ? 'Modified Test' : 'New Test' })}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => datastore.removeOne({ _id: doc._id }, {})}
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

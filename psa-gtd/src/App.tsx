import React, { useEffect, useState } from 'react';
import Datastore from 'nedb-promises';

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
      <header className="App-header">
        <button onClick={() => datastore.insert<Omit<Test, '_id'>>({ title: 'New Test' })}>Add</button>
        {docs.map((doc) => (
          <div key={doc._id} style={{ display: 'flex' }}>
            <button onClick={() => datastore.removeOne({ _id: doc._id }, {})}>Delete</button>
            <button onClick={() => datastore.updateOne({ _id: doc._id }, { title: doc.title === 'New Test' ? 'Modified Test' : 'New Test' })}>Update</button>
            <div>{JSON.stringify(doc, null, 2)}</div>
          </div>
        ))}
      </header>
    </div>
  );
}

export default App;

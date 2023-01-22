import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import Datastore from 'nedb-promises';

type Test = {
  _id: string
  title: string
}

const datastore = Datastore.create('test');

function App() {
  const [docs, setDocs] = useState<Test[]>([])

  useEffect(() => {
    datastore.find<Test>({})
    .then((docs) => setDocs(docs))
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {docs.map((doc) => <div>{JSON.stringify(doc, null, 2)}</div>)}
      </header>
    </div>
  );
}

export default App;

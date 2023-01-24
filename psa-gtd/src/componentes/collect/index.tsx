import React from 'react';
// import { useSelector } from '@xstate/react';
import { BucketCRUDStateMachine } from '../../lib/GlobalServicesMachine';
import { ActorRefFrom } from 'xstate';
import DebugModule from '../debug';

type CollectModuleProps = {
  bucketCRUDService: ActorRefFrom<BucketCRUDStateMachine>
}

const CollectModule: React.FC<CollectModuleProps> = (props) => {
  // const docs = useSelector(props.bucketCRUDService, ({ context }) => context.docs);
  return (
    <>
      <DebugModule
        crudService={props.bucketCRUDService}
        newDoc={{
          content: 'New Test',
          created: Date.now(),
        }}
        updateDoc={(doc) => ({
          content: doc.content === 'New Test' ? 'Modified Test' : 'New Test',
        })}
        span={24}
      />
    </>
  );
}

export default CollectModule;

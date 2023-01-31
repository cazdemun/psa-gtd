import React, { useContext } from 'react';
import { Card, List } from "antd";
import GlobalServicesContext from '../context/GlobalServicesContext';
import { useSelector } from '@xstate/react';

type ReferenceSupporTableProps = {
}

export const ReferenceSupporTable: React.FC<ReferenceSupporTableProps> = (props) => {
  const { service } = useContext(GlobalServicesContext);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const docs = useSelector(ProcessedCRUDService, ({ context }) => context.docs);

  const refSupItems = docs.filter((doc) => doc.type === 'reference' || doc.type === 'support');

  return (
    <>
      <Card title='Reference/Support table (max. TBD)'>
        This is a table because as a reference it needs to be put into a category and maybe linked to a project, and as a support material needs to be necessary linked to a project that may not be even exists yet.
        <List
          dataSource={refSupItems}
          renderItem={(processedItem) => (
            <List.Item>
              <pre>
                {JSON.stringify(processedItem, null, 2)}
              </pre>
            </List.Item>
          )}
        />
      </Card>
    </>
  );
};

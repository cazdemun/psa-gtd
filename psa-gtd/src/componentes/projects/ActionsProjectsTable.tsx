import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Space, Table } from "antd";
import { useInterpret, useSelector } from '@xstate/react';
import GlobalServicesMachine from '../../machines/GlobalServicesMachine';
import { ColumnsType } from 'antd/es/table';
import { Action, ProcessedItem, Project } from '../../models';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ActionModal from './ActionModal';
import { deleteItemWithConfirm } from '../../utils';

// interface DataType {
//   key: React.ReactNode;
//   name: string;
//   age: number;
//   address: string;
//   children?: DataType[];
// }

const columns = (props: {
  onEdit: (item: Action | Project) => any,
  onDelete: (item: Action | Project) => any,
}): ColumnsType<Action | Project> => [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (_, item: Action | Project) => item.type === 'project' ? `[Project] ${item.title}${item.modified}` : (
        <Space>
          <Checkbox />
          {item.title ?? item.content}
        </Space>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
      render: (_, item: Action | Project) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => props.onEdit(item)} />
          <Button icon={<DeleteOutlined />} onClick={() => props.onDelete(item)} />
        </Space>
      ),
    },
  ];

type TreeData = (Action | Project) & { key: React.ReactNode; children: (Action | Project)[] | undefined; }

const populateTree = (docs: string[], docsMap: Map<string, ProcessedItem>): TreeData[] => {
  return docs
    .map((doc) => docsMap.get(doc))
    .filter((doc): doc is ProcessedItem => doc !== undefined)
    .filter((doc): doc is (Action | Project) => doc.type === 'project' || doc.type === 'action')
    .map((doc) => ({
      ...doc,
      key: doc._id,
      children: doc.type === 'project' ? populateTree(doc.actions, docsMap) : undefined,
    }));
}

type ActionsProjectsTableProps = {
}

const ActionsProjectsTable: React.FC<ActionsProjectsTableProps> = (props) => {
  const [state, setState] = useState<'normal' | 'edit'>('normal');
  const [actionProjectToProcess, setActionProjectToProcess] = useState<Action | Project | undefined>(undefined);

  const GlobalServices = useInterpret(GlobalServicesMachine);

  const ProcessedCRUDService = useSelector(GlobalServices, ({ context }) => context.processedCRUDActor);
  const processedItems = useSelector(ProcessedCRUDService, ({ context }) => context.docs);
  const processedItemsMap = useSelector(ProcessedCRUDService, ({ context }) => context.docsMap);

  const [treeData, setTreeData] = useState<TreeData[]>();

  useEffect(() => {
    console.log('why');
    const rootActionsProjectsItems = processedItems
      .filter((doc): doc is (Action | Project) => doc.type === 'project' || doc.type === 'action')
      .filter((doc) => doc.project === undefined)
      .sort((a, b) => b.modified - a.modified)
      .map((doc) => doc._id);
    setTreeData(populateTree(rootActionsProjectsItems, processedItemsMap))
  }, [processedItems, processedItemsMap]);

  return (
    <>
      <Table
        columns={columns({
          onDelete: (item) => deleteItemWithConfirm(ProcessedCRUDService, item._id),
          onEdit: (item) => {
            setState('edit');
            setActionProjectToProcess(item);
          },
        })}
        onExpand={() => console.log('hey')}
        expandedRowKeys={processedItems.map((doc) => doc._id)}
        // rowSelection={{ ...rowSelection, checkStrictly }}
        dataSource={treeData}
      />
      <ActionModal
        open={state === 'edit'}
        onCancel={() => {
          setState('normal');
          setActionProjectToProcess(undefined);
        }}
        onOk={() => {
          if (window.confirm("Do you want to destroy this actionable and create an action/project?")) {
            setState('normal');
            setActionProjectToProcess(undefined);
          }
        }}
        actionToProcess={actionProjectToProcess}
        processedCRUDService={ProcessedCRUDService}
      />
    </>
  );
};

export default ActionsProjectsTable;

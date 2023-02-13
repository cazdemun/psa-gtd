import React, { useContext, useEffect, useState } from 'react';
import { Button, Checkbox, Row, Space, Table } from "antd";
import { useSelector } from '@xstate/react';
import { ColumnsType } from 'antd/es/table';
import { Action, ProcessedItem, Project } from '../../models';
import {
  CheckOutlined, DeleteOutlined, DownOutlined, EditFilled,
  EditOutlined, EyeOutlined, FileOutlined, PlusOutlined, SelectOutlined, ToTopOutlined, UpOutlined,
} from '@ant-design/icons';
import ActionModal from './ActionModal';
import { deleteActionWithConfirm, sortByIndex, uniqueValues } from '../../utils';
import MassActionsModal from './MassActionsModal';
import ActionableModal from '../process/ActionableModal';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { ActorRefFrom } from 'xstate';
import { ProcessedCRUDStateMachine } from '../../machines/GlobalServicesMachine';

import './ActionsTable.css';

// interface DataType {
//   key: React.ReactNode;
//   name: string;
//   age: number;
//   address: string;
//   children?: DataType[];
// }

const swapItem = (
  direction: 'up' | 'down',
  actionToSwap: Action,
  processedItems: ProcessedItem[],
  processedItemsMap: Map<string, ProcessedItem>,
  ProcessedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>
) => {
  const parentProject = (actionToSwap.project ? processedItemsMap.get(actionToSwap.project) : undefined) as Project | undefined;

  // Edge case: Technically there can be an action whose project have been deleted
  if (actionToSwap.project && processedItemsMap.get(actionToSwap.project) === undefined) return;

  // If action does not have a parent project take neighbours from root actions
  const actions = parentProject
    ? parentProject.actions
      .map((_id) => processedItemsMap.get(_id))
      .filter((action): action is Action | Project => action !== undefined)
      .filter((action): action is Action => action.type === 'action')
    : processedItems
      .filter((action): action is Action => action.type === 'action')
      .filter((action) => action.project === undefined);

  const siblingActions = actions
    .sort((a, b) => sortByIndex(a, b));

  const actionToSwapIndex = siblingActions.findIndex((siblingAction) => siblingAction._id === actionToSwap._id)
  const actionNeighbour = (
    actionToSwapIndex === -1
    || (actionToSwapIndex === 0 && direction === 'up')
    || (actionToSwapIndex === siblingActions.length - 1 && direction === 'down')
  )
    ? undefined
    : siblingActions.at(direction === 'up' ? actionToSwapIndex - 1 : actionToSwapIndex + 1);

  if (!actionNeighbour) return;

  ProcessedCRUDService.send({
    type: 'BATCH',
    data: [
      {
        type: 'UPDATE',
        _id: actionToSwap._id,
        doc: {
          index: actionNeighbour.index
        }
      },
      {
        type: 'UPDATE',
        _id: actionNeighbour._id,
        doc: {
          index: actionToSwap.index
        }
      },
    ],
  })
}

const columns = (props: {
  checkedKeys: string[],
  openAddModal?: (...args: any[]) => any,
  // General
  onEdit: (item: Action | Project) => any,
  onDelete: (item: Action | Project) => any,
  // Actions only
  onDo?: (item: Action) => any,
  onSwap?: (direction: 'up' | 'down', item: Action) => any,
  onCheck: (checked: boolean, item: Action | Project) => any,
  onDisabled: (item: Action | Project) => boolean,
  onMassActionMoveHidden: (item: Action | Project) => boolean,
  onMassActionMove: () => any,
  // Projects only
  onProjectDone?: (item: Project) => any,
  onProjectToTop?: (item: Project) => any,
}): ColumnsType<Action | Project> => [
    {
      title: (
        <Row align='middle'>
          <div style={{ flex: '1' }}>
            Title
          </div>
          <Button icon={<EyeOutlined />} disabled />
        </Row >
      ),
      dataIndex: 'title',
      key: 'title',
      render: (_, item: Action | Project) => item.type === 'project' ? `[Project] ${item.title} : ${item.index}` : (
        <Space title={item.content}>
          <Checkbox
            checked={props.checkedKeys.some((_id) => _id === item._id)}
            onChange={(checked) => props.onCheck(checked.target.checked, item)}
            disabled={props.onDisabled(item)}
          />
          {`${item.title ?? item.content} : ${item.index}`}
        </Space>
      ),
    },
    {
      title: (
        <Row align='middle'>
          <div style={{ flex: '1' }}>
            Operations
          </div>
          <Button icon={<PlusOutlined />} onClick={() => props.openAddModal && props.openAddModal()} />
        </Row >
      ),
      dataIndex: 'operation',
      key: 'operation',
      render: (_, item: Action | Project) => (
        <Space>
          {!props.onMassActionMoveHidden(item) && <Button icon={<EditOutlined />} onClick={() => props.onEdit(item)} />}
          {props.onMassActionMoveHidden(item) && <Button icon={<EditFilled />} onClick={() => props.onMassActionMove()} />}
          <Button icon={<DeleteOutlined />} onClick={() => props.onDelete(item)} />

          {(item.type === 'action' && props.onDo) && <Button icon={<SelectOutlined />} onClick={() => props.onDo && props.onDo(item)} />}
          {item.type === 'action' && <Button icon={<UpOutlined />} onClick={() => props.onSwap && props.onSwap('up', item)} />}
          {item.type === 'action' && <Button icon={<DownOutlined />} onClick={() => props.onSwap && props.onSwap('down', item)} />}

          {(item.type === 'project' && props.onProjectDone) && <Button icon={<CheckOutlined />} disabled onClick={() => props.onProjectDone && props.onProjectDone(item)} />}
          {(item.type === 'project') && <Button icon={<FileOutlined />} disabled onClick={() => { }} />}
          {(item.type === 'project' && props.onProjectToTop) && <Button icon={<ToTopOutlined />} onClick={() => props.onProjectToTop && props.onProjectToTop(item)} />}
        </Space>
      ),
    },
  ];

export const sortByProyectFirst = <T extends Action | Project>(a: T, b: T, reverse: boolean): number => {
  const aType = a.type === 'project' ? 0 : 1;
  const bType = b.type === 'project' ? 0 : 1;
  return reverse ? bType - aType : aType - bType;
}

type TreeData = (Action | Project) & { key: React.ReactNode; children: (Action | Project)[] | undefined; }

const populateTree = (docs: string[], docsMap: Map<string, ProcessedItem>): TreeData[] => {
  return docs
    .map((doc) => docsMap.get(doc))
    .filter((doc): doc is ProcessedItem => doc !== undefined)
    .filter((doc): doc is (Action | Project) => doc.type === 'project' || doc.type === 'action')
    .sort((a, b) => {
      if (a.type === 'project' && b.type === 'project') return b.modified - a.modified;
      if (a.type !== b.type) return sortByProyectFirst(a, b, true);
      return sortByIndex(a, b);
    })
    .map((doc) => ({
      ...doc,
      key: doc._id,
      children: doc.type === 'project' ? populateTree(doc.actions, docsMap) : undefined,
    }));
}

type ActionsProjectsTableProps = {
  onDo?: (item: Action) => any
  onProjectDone?: (item: Project) => any
}

const ActionsProjectsTable: React.FC<ActionsProjectsTableProps> = (props) => {
  const [state, setState] = useState<'normal' | 'create' | 'edit' | 'massedit'>('normal');
  const [actionProjectToProcess, setActionProjectToProcess] = useState<Action | Project | undefined>(undefined);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [expandedKeysFirstLoad, setExpandedKeysFirstLoad] = useState<boolean>(true);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);


  const { service } = useContext(GlobalServicesContext);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItems = useSelector(ProcessedCRUDService, ({ context }) => context.docs);
  const processedItemsMap = useSelector(ProcessedCRUDService, ({ context }) => context.docsMap);

  const [treeData, setTreeData] = useState<TreeData[]>();

  useEffect(() => {
    const rootActionsProjectsItems = processedItems
      .filter((doc): doc is (Action | Project) => doc.type === 'project' || doc.type === 'action')
      .filter((doc) => doc.project === undefined)
      .sort((a, b) => b.modified - a.modified)
      .map((doc) => doc._id);
    setTreeData(populateTree(rootActionsProjectsItems, processedItemsMap));

    if (processedItems.length > 0 && expandedKeysFirstLoad) {
      console.log(processedItems.length);
      setExpandedKeysFirstLoad(false);
      setExpandedKeys(rootActionsProjectsItems);
    }

  }, [processedItems, processedItemsMap, expandedKeysFirstLoad]);

  return (
    <>
      <Table
        columns={columns({
          checkedKeys,
          openAddModal: () => setState('create'),
          onDelete: (item) => deleteActionWithConfirm(ProcessedCRUDService, item, processedItemsMap),
          onEdit: (item) => {
            setState('edit');
            setActionProjectToProcess(item);
          },
          onMassActionMove: () => {
            setState('massedit');
          },
          onCheck: (checked, record) => {
            console.log(checked, record);
            if (!checked) {
              setCheckedKeys(checkedKeys.filter((key) => key !== record._id));
            } else {
              setCheckedKeys(uniqueValues([...checkedKeys, record._id]));
            }
          },
          onDisabled: (item) => {
            const [firstKey] = checkedKeys;
            if (!firstKey) return false;
            return (processedItemsMap.get(firstKey) as Action).project !== item.project;
          },
          onMassActionMoveHidden: (item) => {
            return checkedKeys.some((key) => key === item._id);
          },
          onDo: props.onDo,
          onSwap: (direction, item) => swapItem(direction, item, processedItems, processedItemsMap, ProcessedCRUDService),
          onProjectToTop: (project) => ProcessedCRUDService.send({
            type: 'UPDATE',
            _id: project._id,
            doc: {
              modified: Date.now(),
            },
          }),
          onProjectDone: props.onProjectDone,
        })}
        onExpand={(expanded, record) => {
          if (!expanded) {
            setExpandedKeys(expandedKeys.filter((key) => key !== record._id));
          } else {
            setExpandedKeys(uniqueValues([...expandedKeys, record._id]));
          }
        }}
        expandedRowKeys={expandedKeys}
        // rowSelection={{ ...rowSelection, checkStrictly }}
        dataSource={treeData}
      />
      <ActionModal
        open={state === 'edit'}
        onCancel={() => {
          setState('normal');
          setActionProjectToProcess(undefined);
        }}
        actionToProcess={actionProjectToProcess}
        processedCRUDService={ProcessedCRUDService}
      />
      <MassActionsModal
        open={state === 'massedit'}
        onCancel={() => {
          setState('normal');
          setActionProjectToProcess(undefined);
          setCheckedKeys([]);
        }}
        actionsToProcess={checkedKeys}
        processedCRUDService={ProcessedCRUDService}
      />
      <ActionableModal
        open={state === 'create'}
        onCancel={() => setState('normal')}
        actionableToProcess={{
          type: 'actionable',
          _id: '',
          content: '',
          created: Date.now(),
          index: '',
        }}
        processedCRUDService={ProcessedCRUDService}
      />
    </>
  );
};

export default ActionsProjectsTable;

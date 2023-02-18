import React, { useContext } from 'react';
import ActionsProjectsTable from '../projects/ActionsProjectsTable';
import { Col, Row } from 'antd';
import GlobalServicesContext from '../context/GlobalServicesContext';
import { useSelector } from '@xstate/react';
import { recursiveParent, uniqueValues } from '../../utils';
import { Action, FinishedActionable, ProcessedItem, Project } from '../../models';
import CookieJar from './CookieJar';
import { FinishedCRUDStateMachine, ProcessedCRUDStateMachine } from '../../machines/GlobalServicesMachine';
import { ActorRefFrom } from 'xstate';
import { NewDoc } from '../../lib/Repository';
import DoCategories from './DoCategories';

const onProjectDone = (
  projectToFinish: Project,
  processedItemsMap: Map<string, ProcessedItem>,
  ProcessedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>,
  FinishedCRUDService: ActorRefFrom<FinishedCRUDStateMachine>,
) => {
  const actions = projectToFinish.actions
    .map((_id) => processedItemsMap.get(_id))
    .filter((action): action is Project | Action => action !== undefined)

  if (actions.length > 0) {
    window.alert('You can\'t delete a project with actions');
    return;
  }

  const newFinishedItem: NewDoc<FinishedActionable> = {
    type: 'finished',
    item: projectToFinish,
    finished: Date.now(),
  }

  const updatedOldParents = recursiveParent(projectToFinish.project, processedItemsMap)
    .map((_id) => processedItemsMap.get(_id))
    .filter((doc): doc is Project => doc !== undefined)
    .map((doc, i) => ({
      type: 'UPDATE',
      _id: doc._id,
      doc: {
        modified: Date.now(),
        actions: i === 0 ? doc.actions.filter((action) => action !== projectToFinish._id) : doc.actions,
      },
    }) as const);

  // delete project and update parents
  ProcessedCRUDService.send({
    type: 'BATCH',
    data: [
      ...updatedOldParents,
      {
        type: 'DELETE',
        _id: projectToFinish._id,
      }
    ]
  });

  // add project to finished
  FinishedCRUDService.send({
    type: 'CREATE',
    doc: newFinishedItem,
  });
}

type DoModuleProps = {
}

const DoModule: React.FC<DoModuleProps> = (props) => {

  const { service } = useContext(GlobalServicesContext);

  const DoCategoryCRUDService = useSelector(service, ({ context }) => context.doCategoryCRUDActor);
  const doCategories = useSelector(DoCategoryCRUDService, ({ context }) => context.docs);

  const ProcessedCRUDService = useSelector(service, ({ context }) => context.processedCRUDActor);
  const processedItemsMap = useSelector(ProcessedCRUDService, ({ context }) => context.docsMap);

  const FinishedCRUDService = useSelector(service, ({ context }) => context.finishedCRUDActor);

  return (
    <Row gutter={[16, 16]}>
      <Col span={7}>
        <ActionsProjectsTable
          onProjectDone={(project) => onProjectDone(project, processedItemsMap, ProcessedCRUDService, FinishedCRUDService)}
          onDo={(item) => {
            const [firstCategory] = doCategories;
            if (firstCategory === undefined) return;
            if (firstCategory.actions.some((_id) => _id === item._id)) return;
            DoCategoryCRUDService.send({
              type: 'UPDATE',
              _id: firstCategory._id,
              doc: {
                actions: uniqueValues([...firstCategory.actions, item._id]),
              }
            })
          }}
        />
      </Col>
      <Col span={17}>
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <DoCategories />
          </Col>
          <Col span={8}>
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <CookieJar />
              </Col>
              <Col span={24}>
                Scheduled/Deadlined/Cyclic Actions
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default DoModule;

import { ProcessedCRUDStateMachine } from './machines/GlobalServicesMachine';
import { ActorRefFrom } from 'xstate';
import { NotLazyCRUDStateMachine } from './lib/CRUDMachine';
import { BaseDoc, NewDoc } from './lib/Repository';
import { Action, BucketItem, ProcessedItem, Project, Reference, Support } from './models';
// import { v4 as uuidv4 } from 'uuid';

export const trace = <T>(x: T): T => {
  console.log(x);
  return x;
}

export const imperativeMultiSlice = <T>(arr: T[], positions: number[]): T[][] => {
  let slices = [];
  let start = 0;
  for (let i = 0; i < positions.length; i++) {
    let end = positions[i];
    slices.push(arr.slice(start, end));
    start = end;
  }
  slices.push(arr.slice(start));
  return slices;
}

export const multiSlice = <T>(arr: T[], positions: number[]): T[][] => {
  let start = 0;
  return positions.reduce((slices, end) => {
    const newSlice = arr.slice(start, end);
    start = end;
    return slices.concat([newSlice]);
  }, [] as T[][]).concat([arr.slice(start)])
}

export const uniqueValues = <T>(array: T[]): T[] => [...new Set(array)];

export const nonNullabelString = (s: string | undefined): boolean => s !== undefined && s !== null && s !== '';

export const sortByIndex = <T extends { index: string }>(a: T, b: T) => {
  let aArr = a.index.split(".");
  let bArr = b.index.split(".");

  for (let i = 0; i < Math.min(aArr.length, bArr.length); i++) {
    if (aArr[i] !== bArr[i]) {
      return parseInt(aArr[i]) - parseInt(bArr[i]);
    }
  }

  return aArr.length - bArr.length;
}

export const getLastIndexFirstLevel = <T extends { index: string }>(docs: T[]): number => {
  const sortedIndexes = docs.slice().map((a) => parseInt(a.index.split(".")[0])).sort((a, b) => b - a);
  const [lastIndex] = sortedIndexes;
  return lastIndex ?? 0;
}


export const recursiveParent = (projectId: string | undefined, processedItemsMap: Map<string, ProcessedItem>): string[] => {
  if (projectId === undefined) return [];

  const project = processedItemsMap.get(projectId);

  if (project === undefined) return [];
  if (project.type !== 'project' && project.type !== 'action') return [];
  return [projectId].concat(recursiveParent(project.project, processedItemsMap));

}

// // Most references would be bookmarks, but some of them could be files like plain text or pdfs
// export type Reference = {
//   type: 'reference'
//   title?: string
//   path?: string // only for file:\\\ 
//   projects: string[]
// }

// // Support files are actually files, or at least should be, most of them
// export type Support = {
//   type: 'support'
//   title?: string
//   path?: string // only for file:\\\ 
//   projects: string[]
// }

export const rollbackReferenceItem = (reference: Reference, index: string): NewDoc<BucketItem> => {
  const content = `Title: ${reference.title ?? ''}\n` +
    `Proyects: ${reference.projects.join(" ")}\n` +
    `Path: ${reference.path ?? ''}\n\n` +
    `${reference.content}`;

  return {
    type: 'bucket',
    content,
    created: Date.now(),
    index,
  };
}

export const rollbackSupportItem = (reference: Support, index: string): NewDoc<BucketItem> => {
  const content = `Title: ${reference.title ?? ''}\n` +
    `Proyects: ${reference.projects.join(" ")}\n` +
    `Path: ${reference.path ?? ''}\n\n` +
    `${reference.content}`;

  return {
    type: 'bucket',
    content,
    created: Date.now(),
    index,
  };
}

export const deleteItemWithConfirm = <T extends BaseDoc>(crudService: ActorRefFrom<NotLazyCRUDStateMachine<T>>, _id: string,) => {
  if (window.confirm('Do you really want to delete this item? There is no coming back')) {
    crudService.send({ type: 'DELETE', _id })
  }
};

export const deleteActionWithConfirm = (
  ProcessedCRUDService: ActorRefFrom<ProcessedCRUDStateMachine>,
  action: Action | Project | undefined,
  processedItemsMap: Map<string, ProcessedItem>,
) => {
  if (action === undefined) return;
  if (action.type === 'project' && action.actions.length > 0) {
    window.alert('Can\'t delete project with children');
    return;
  }

  if (window.confirm('Do you really want to delete this item? There is no coming back')) {
    if (action.project !== undefined) {
      const updatedOldParents = recursiveParent(action.project, processedItemsMap)
        .map((_id) => processedItemsMap.get(_id))
        .filter((doc): doc is Project => doc !== undefined)
        .map((doc, i) => ({
          type: 'UPDATE',
          _id: doc._id,
          doc: {
            // modified: Date.now(), // only when deletion comes from item done
            actions: i === 0 ? doc.actions.filter((actionId) => actionId !== action._id) : doc.actions,
          },
        }) as const);

      ProcessedCRUDService.send({
        type: 'BATCH',
        data: [
          ...updatedOldParents,
          {
            type: 'DELETE',
            _id: action._id
          }
        ]
      })
    } else {
      ProcessedCRUDService.send({
        type: 'DELETE',
        _id: action._id
      })
    }
  }
};

export const getNextIndex = (lastIndex: number): string => (lastIndex + 1).toString();

// export const generateProjectsAndActions = (content: string): (Action | Project)[] => {
//   const lines = content.split('\n');
//   const result = lines.reduce((acc, line) => {
//     const name = line.trim();
//     if (!name) return acc;

//     const indentation = line.search(/\S|$/);
//     if (indentation === 0) {
//       const projectId = uuidv4();
//       acc.items.push({
//         type: 'project',
//         _id: projectId,
//         actions: [],
//         content: '',
//         created: Date.now(),
//         index: getNextIndex(acc.lastIndex),
//         modified: Date.now(),
//         title: line,
//       });
//       acc.currentProject = projectId;
//       acc.lastIndex = getNextIndex(acc.lastIndex);
//     } else {
//       const actionId = uuidv4();
//       acc.items.push({
//         type: 'action',
//         _id: actionId,
//         content: '',
//         created: Date.now(),
//         index: getNextIndex(acc.lastIndex),
//         modified: Date.now(),
//         project: 
//       });
//       if (acc.currentProject) {
//         acc.items.find(p => p._id === acc.currentProject)?.actions.push(actionId);
//       }
//       acc.lastIndex = getNextIndex(acc.lastIndex);
//     }
//     return acc;
//   }, {
//     items: [] as (Action | Project)[],
//     currentProject: undefined as string | undefined,
//     lastIndex: number
//   });

//   return result.items;
// };

export const generateProjectsAndActions = (content: string, lastIndex: number): (Action | Project)[] => {
  return [];
  // const lines = content.split("\n").filter((line) => line !== '' && line !== undefined);
  // // let projects: Project[] = [];
  // // let currentProject: Project | undefined;
  // // let indentLevel = 0;

  // const result = lines.reduce((acc, line, currentIndex, array) => {
  //   const trimmedLine = line.trim();
  //   // const previousIndentLevel = currentIndex > 0 ? array.at(currentIndex - 1)?.search(/\S|$/) : undefined;
  //   const currentIndentLevel = line.search(/\S|$/);
  //   const nextIndentLevel = array.at(currentIndex + 1)?.search(/\S|$/);

  //   // Case
  //   // Project 1
  //   //  Action 0
  //   // Action 1 <-
  //   // Action 2 | Project 2
  //   //
  //   // Case
  //   // Project 1
  //   //  Action 0
  //   // Action 1
  //   // Action 2 <-
  //   // EOF
  //   // 
  //   const isNextAction = currentIndentLevel === nextIndentLevel && currentIndentLevel === 0;
  //   const isLastAction = currentIndex === array.length - 1 && currentIndentLevel === 0;
  //   if (isNextAction || isLastAction) {
  //     // createAction without project
  //     // currentProject does not change
  //     // update lastIndex
  //     const actionId = uuidv4();

  //     acc.items.push({
  //       type: 'action',
  //       _id: actionId,
  //       content: trimmedLine,
  //       created: Date.now(),
  //       index: getNextIndex(acc.lastIndex),
  //       modified: Date.now(),
  //     });
  //     acc.lastIndex = acc.lastIndex + 1;
  //   }
  //   else if (currentIndentLevel === 0 || currentIndentLevel < (nextIndentLevel ?? 0)) {
  //     const projectId = uuidv4();
  //     acc.items.push({
  //       type: 'project',
  //       _id: projectId,
  //       actions: [],
  //       content: '',
  //       created: Date.now(),
  //       index: getNextIndex(acc.lastIndex),
  //       modified: Date.now(),
  //       title: trimmedLine,
  //     });
  //     acc.currentProject = projectId;
  //     acc.lastIndex = acc.lastIndex + 1;
  //   } else {
  //     const actionId = uuidv4();
  //     acc.items.push({
  //       type: 'action',
  //       _id: actionId,
  //       content: trimmedLine,
  //       created: Date.now(),
  //       index: getNextIndex(acc.lastIndex),
  //       modified: Date.now(),
  //       project: acc.currentProject
  //     });
  //     if (acc.currentProject) {
  //       (acc.items.find((p) => p._id === acc.currentProject) as Project)?.actions.push(actionId);
  //     }
  //     acc.lastIndex = acc.lastIndex + 1;
  //   }

  //   return acc;
  // }, {
  //   items: [] as (Action | Project)[],
  //   currentProject: undefined as string | undefined,
  //   lastIndex,
  // })

  // return result.items;
}

// Current problem

// Proyect 1
// 	Action 1
// 	Action 2
// 	Action 3
// 	Proyect 2
// 		Action 4
// 		Action 5
// 		Action 6
// 	Proyect 3
// 		Action 4.1
// 		Action 5.1
// 		Action 6.1
// 		Proyect 4
// 			Action 4.1.1
// 			Action 5.1.1
// 			Action 6.1.1
// 	Action 7
// Action 8
// Action 9
// Proyect 5
// 	Action 10
// 	Action 11

// With this logic Proyect 3 will appear as child of proyect 2

// Maybe another logic could actually work?


// Take first line, check if the next line has higher identation
// if it does evaluating the rest of lines, filter the ones with one more level identation and that the next line has equal or higher identation
// with this, Proyect 1 will also have action 10 and 11 as children
// create those as actions, initially


//   for (const [i, line] of lines.entries()) {
//     const trimmedLine = line.trim();
//     const currentIndentLevel = line.search(/\S|$/);

//     // Two consecutives level 0 means this action is a single one
//     // This problem is the first action actually, I have no idea if the next one
//     if (currentIndentLevel === indentLevel && currentIndentLevel == 0) {

//     }

//     if (currentIndentLevel > indentLevel) {
//       if (currentProject) {
//         const newProject = {
//           _id: uuidv4(),
//           type: "project",
//           title: trimmedLine,
//           content: "",
//           created: Date.now(),
//           index: i.toString(),
//           modified: Date.now(),
//           actions: []
//         };

//         currentProject.actions.push(newProject._id);
//         projects.push(newProject);
//         currentProject = newProject;
//       }
//       indentLevel = currentIndentLevel;
//     } else if (currentIndentLevel < indentLevel) {
//       while (indentLevel > currentIndentLevel && currentProject) {
//         currentProject = projects.find(
//           project => project._id === currentProject.project
//         );
//         indentLevel -= 2;
//       }
//     } else {
//       if (!currentProject) {
//         currentProject = {
//           _id: uuidv4(),
//           type: "project",
//           title: trimmedLine,
//           content: "",
//           created: Date.now(),
//           index: i.toString(),
//           modified: Date.now(),
//           actions: []
//         };
//         projects.push(currentProject);
//       } else {
//         currentProject.actions.push(
//           uuidv4(),
//           type: "action",
//           content: trimmedLine,
//           created: Date.now(),
//           index: i.toString(),
//           modified: Date.now()
//         );
//       }
//     }
//   }

//   return projects.reduce((acc, project) => acc.concat(project.actions), projects);
// };
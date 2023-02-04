import { NewDoc } from './lib/Repository';
import { BucketItem, Reference, Support } from './models';
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
    content,
    created: Date.now(),
    index,
  };
}

import { BaseDoc } from '../lib/Repository';

export type BucketItem = BaseDoc & {
  type: 'bucket'
  created: number
  content: string
  index: string
  // actionable?: boolean
}

export type Bucket = BucketItem[]

export type BaseProcessedItem = {
  created: number
  index: string
  content: string,
}

export type Trash = (BaseDoc & BaseProcessedItem) & {
  type: 'trash'
  item: ProcessedItem | BucketItem
}

export type Someday = (BaseDoc & BaseProcessedItem) & {
  type: 'someday'
  item: ProcessedItem | BucketItem
}

// Most references would be bookmarks, but some of them could be files like plain text or pdfs
export type Reference = (BaseDoc & BaseProcessedItem) & {
  type: 'reference'
  title?: string
  path?: string // only for file:\\\ 
  projects: string[]
}

// Support files are actually files, or at least should be, most of them
export type Support = (BaseDoc & BaseProcessedItem) & {
  type: 'support'
  title?: string
  path?: string // only for file:\\\ 
  projects: string[]
}

export type Actionable = (BaseDoc & BaseProcessedItem) & {
  type: 'actionable'
}

export type BaseAction = (BaseDoc & BaseProcessedItem) & {
  type: 'action' | 'project'
  project?: string
  title: string
  delegate?: boolean
  cyclic?: {
    finished: number
    period: number // days
  }
  scheduled?: {
    start: number
    deadline: number
  }
  finished?: number
  modified: number
}

export type Action = BaseAction & {
  type: 'action'
}

export type Project = (BaseDoc & BaseProcessedItem) & {
  type: 'project'
  project?: string
  title: string
  delegate?: boolean
  cyclic?: {
    finished: number
    period: number // days
  }
  scheduled?: {
    start: number
    deadline: number
  }
  finished?: number
  modified: number
}
  & { actions: string[] }// (Action | Project)[]

export type ProcessedItem =
  | Trash | Someday
  | Reference | Support
  | Project | Actionable | Action


export type FinishedActionable = BaseDoc & {
  type: 'finished'
  item: Project | Action | BucketItem
  finished: number
}

// wastelandsSupportFiles: string[] path of files (I think is best to just create a reference/support file when analizing the explorer)
// wastelandsReferenceFiles: string[] path of files
// This type is for custom categories on the do panel
// Examples:
// To do (3 work / 1 something else)
export type DoCategory = BaseDoc & {
  type: 'docategory'
  title: string
  created: number
  index: string
  description: string
  modified: number
  actions: string[] // actions
}

// export type ProcessedItem = (
//   | Trash | Someday
//   | Reference | Support
//   | Project | Actionable | Action
// ) & { _id: string }

// periodic action
// everyday action
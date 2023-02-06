import { BaseDoc } from '../lib/Repository';

export type BucketItem = BaseDoc & {
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

export type Action = (BaseDoc & BaseProcessedItem) & {
  type: 'action'
  project?: string
  delegate?: boolean
  scheduled?: {
    start: number
    deadline: number
  }
  finished?: number
  modified: number
}

export type Project = (BaseDoc & BaseProcessedItem) & {
  type: 'project'
  project?: string
  title: string
  actions: string[] // (Action | Project)[]
  scheduled?: {
    start: number
    deadline: number
  }
  modified: number
}

export type FinishedActionable = {
  type: 'finished'
  item: Project | Action | BucketItem
  finished?: number
}

export type ProcessedItem =
  | Trash | Someday
  | Reference | Support
  | Project | Actionable | Action

// wastelandsSupportFiles: string[] path of files (I think is best to just create a reference/support file when analizing the explorer)
// wastelandsReferenceFiles: string[] path of files
// This type is for custom categories on the do panel
// Examples:
// To do (3 work / 1 something else)
export type DoCategory = BaseDoc & {
  title: string
  created: number
  index: string
  description: string
  actions: string[] // actions and projects
}

// export type ProcessedItem = (
//   | Trash | Someday
//   | Reference | Support
//   | Project | Actionable | Action
// ) & { _id: string }

// periodic action
// everyday action
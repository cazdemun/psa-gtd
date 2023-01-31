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

export type Trash = {
  type: 'trash'
  item: ProcessedItem | BucketItem
}

export type Someday = {
  type: 'someday'
  item: ProcessedItem | BucketItem
}

export type Reference = {
  type: 'reference'
  title?: string
  path?: string // only for file:\\\ 
  projects: string[]
}

export type Support = {
  type: 'support'
  title?: string
  projects?: string[]
  path?: string
}

export type Actionable = {
  type: 'actionable'
}

export type Action = {
  type: 'action'
  delegate?: boolean
  scheduled?: number
  finished?: number
}

export type Project = {
  type: 'project'
  actions: (Action | Project)[]
  finished?: number
}

export type ProcessedItem = (BaseDoc & BaseProcessedItem)
  & (
    | Trash | Someday
    | Reference | Support
    | Project | Actionable | Action
  )

// export type ProcessedItem = (
//   | Trash | Someday
//   | Reference | Support
//   | Project | Actionable | Action
// ) & { _id: string }

// periodic action
// everyday action
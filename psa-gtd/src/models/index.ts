import { BaseDoc } from '../lib/Repository';

export type BucketItem = BaseDoc & {
  created: number
  content: string
  index: string
  // actionable?: boolean
}

export type Bucket = BucketItem[]

type BaseProcessedItem = {
  created: number
  index: string
}

type Trash = {
  item: ProcessedItems | BucketItem
}

type Someday = {
  item: ProcessedItems | BucketItem
}

type Reference = {}

type Support = {}

type Actionable = {
}
type Action = {
  delegate?: boolean
  scheduled?: number
}

type Project = {}

export type ProcessedItems = BaseDoc & BaseProcessedItem
  & (
    | Trash | Someday
    | Reference | Support
    | Project | Actionable | Action
  )

// periodic action
// everyday action
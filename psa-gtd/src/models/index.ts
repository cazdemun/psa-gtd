import { BaseDoc } from '../lib/Repository';

export type BucketItem = BaseDoc & {
  created: number
  content: string
  index: string
}

export type Bucket = BucketItem[]

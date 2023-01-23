// v3.0
import Datastore from 'nedb-promises';

export type BaseDoc = { _id: string }

export type OptionalProperty<T, U extends keyof T> = Omit<T, U> & { [P in U]?: T[U] }
export type RequiredPropertyInPartial<T, U extends keyof T> = Partial<Omit<T, U>> & { [P in U]: T[U] }

export type OptionalId<T extends BaseDoc> = OptionalProperty<T, '_id'>

export type PartialWithId<T extends BaseDoc> = RequiredPropertyInPartial<T, '_id'>

export default class Repository<T extends BaseDoc> {
  db: Datastore<T>;

  collection: string;

  constructor(collection: string) {
    this.db = Datastore.create({ filename: collection, autoload: true });
    this.collection = collection;
  }

  find(query?: Record<string, string>): Promise<T[]> {
    return this.db.find(query ?? {});
  }

  insert(newDocs: OptionalId<T> | (OptionalId<T>[])): Promise<T | (T[])> {
    return this.db.insert(newDocs);
  }

  update(_id: string, update: Partial<T>): Promise<number> {
    if (_id === '' || _id === undefined) return Promise.resolve(0);
    return this.db.update({ _id }, { $set: { ...update } })
  }

  updateMany(docs: PartialWithId<T>[]): Promise<number> {
    if (docs.length === 0) return Promise.resolve(0);
    return new Promise((resolve, reject) => {
      Promise.all(docs.map(({ _id, ...doc }) => this.update(_id, doc as Partial<T>)))
        .then((nums: number[]) => nums.reduce((acc, x) => acc + x, 0))
        .then(resolve)
        .catch((err) => reject(new Error(`Updating documents with _ids: ${JSON.stringify(docs.map((d) => (d as any)._id))} - ${err.message}`)));
    });
  }

  delete(_id: string): Promise<number> {
    if (_id === '' || _id === undefined) return Promise.resolve(0);
    return this.db.remove({ _id }, { multi: true });
  }

  deleteMany(_ids: string[]): Promise<number> {
    if (_ids.length === 0) return Promise.resolve(0);
    return this.db.remove({ _id: { $in: _ids } }, { multi: true });
  }
}

// update actions v1 to v2 (title)

export const migrationOne = () => {
  // const actionv1 = processedItems
  //   .filter((doc): doc is Action => doc.type === 'action')
  //   .filter((doc): doc is Action => doc.title === undefined)
  //   .map((doc) => ({
  //     type: 'UPDATE',
  //     _id: doc._id,
  //     doc: {
  //       title: doc.content
  //     },
  //   }) as const);

  // ProcessedCRUDService.send({
  //   type: 'BATCH',
  //   data: actionv1,
  // })
}

// update bucket items v1 to v2 (type)

export const migrationTwo = () => {
  // const actionv1 = bucketItems
  //   .map((doc) => ({
  //     type: 'UPDATE',
  //     _id: doc._id,
  //     doc: {
  //       type: 'bucket'
  //     },
  //   }) as const);

  // BucketCRUDService.send({
  //   type: 'BATCH',
  //   data: actionv1,
  // })
}
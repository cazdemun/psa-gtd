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

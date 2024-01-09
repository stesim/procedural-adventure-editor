export function find<T>(iterator : IterableIterator<T>, predicate : (value : T) => boolean) : T | undefined {
  for (const value of iterator) {
    if (predicate(value)) {
      return value
    }
  }
  return undefined
}


export function *map<T, U>(iterator : IterableIterator<T>, mapping : (value : T) => U) {
  for (const value of iterator) {
    yield mapping(value)
  }
}


export function join<T>(iterator : IterableIterator<T>, separator = ",") : string {
  const first = iterator.next()
  let string = !first.done ? "" + first.value : ""
  if (!first.done) {
    for (const value of iterator) {
      string += separator + value
    }
  }
  return string
}


export function *tail<T>(iterator : IterableIterator<T>) {
  iterator.next()
  yield *iterator
}


export function *filter<T>(iterator : IterableIterator<T>, predicate : (value : T) => boolean) {
  for (const value of iterator) {
    if (predicate(value)) {
      yield value
    }
  }
}

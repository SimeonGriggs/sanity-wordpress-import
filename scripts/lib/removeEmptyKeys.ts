export function removeEmptyKeys(object: {[key: string]: any}) {
  return Object.entries(object).reduce(
    (acc, [key, value]) => (value ? {...acc, [key]: value} : acc),
    {} as {[key: string]: string},
  )
}

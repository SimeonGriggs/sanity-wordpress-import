import type {Reference} from 'sanity'

export function createImageReference(id: string): {_type: 'image'; asset: Reference} {
  return {
    _type: 'image',
    asset: {_type: 'reference', _ref: id},
  }
}

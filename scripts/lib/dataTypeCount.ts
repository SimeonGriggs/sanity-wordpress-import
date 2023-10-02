import {BASE_URL} from './constants'

export async function dataTypeCount(type: string): Promise<number> {
  return await fetch(`${BASE_URL}/${type}?per_page=1`)
    .then((res) => res.headers.get('X-WP-Total'))
    .then((count) => (count ? parseInt(count, 10) : 0))
    .catch((error) => {
      console.error(error)
      return 0
    })
}

import {BASE_URL, PER_PAGE} from './constants'

type WordPressDataType = 'categories' | 'posts' | 'tags' | 'users'

export async function dataTypeFetch(type: WordPressDataType, count: number) {
  const data: any[] = []

  const total = Math.ceil(count / PER_PAGE)

  for (let index = 0; index < total; index++) {
    const page = index + 1
    console.log(`Fetching ${PER_PAGE} of ${count} total "${type}": ${page}/${total}`)

    const pageData = await fetch(`${BASE_URL}/${type}?page=${page}&per_page=${PER_PAGE}`)
      .then((res) => res.json())
      .catch(console.error)

    data.push(pageData)
  }

  return data.flat()
}

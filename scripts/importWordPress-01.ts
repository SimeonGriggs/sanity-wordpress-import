import {getCliClient} from 'sanity/cli'

import {dataTypeCount} from './lib/dataTypeCount'

const client = getCliClient()

async function importWordPress() {
  console.log(`Import WordPress data into:`)
  console.log(`Project ID: ${client.config().projectId}`)
  console.log(`Dataset: ${client.config().dataset}`)

  const tagCount = await dataTypeCount('tags')
  const categoryCount = await dataTypeCount('categories')
  const authorCount = await dataTypeCount('users')
  const postCount = await dataTypeCount('posts')

  console.log({tagCount, categoryCount, authorCount, postCount})
}

importWordPress()

import {getCliClient} from 'sanity/cli'

import {dataTypeCount} from './lib/dataTypeCount'
import {dataTypeFetch} from './lib/dataTypeFetch'

const client = getCliClient()

async function importWordPress() {
  console.log(`Import WordPress data into:`)
  console.log(`Project ID: ${client.config().projectId}`)
  console.log(`Dataset: ${client.config().dataset}`)

  // Create documents in "transactions" to lower API requests
  const transaction = client.transaction()

  // Fetch "category" data from WordPress
  const categoryCount = await dataTypeCount('categories')
  const categoryData = await dataTypeFetch('categories', categoryCount)

  // Transform into Sanity documents with deterministic IDs
  for (let cIndex = 0; cIndex < categoryData.length; cIndex++) {
    transaction.createOrReplace({
      _id: `category-${categoryData[cIndex].id}`,
      _type: 'category',
      name: categoryData[cIndex].name,
      slug: {current: categoryData[cIndex].slug},
    })
  }

  const tagCount = await dataTypeCount('tags')
  const tagData = await dataTypeFetch('tags', tagCount)

  for (let tIndex = 0; tIndex < tagData.length; tIndex++) {
    transaction.createOrReplace({
      _id: `tag-${tagData[tIndex].id}`,
      _type: 'tag',
      name: tagData[tIndex].name,
      slug: {current: tagData[tIndex].slug},
    })
  }

  // Commit the transaction to publish these new documents
  transaction
    .commit()
    .then((res) => console.log(`Created or updated ${res.results.length} documents`))
    .catch(console.error)
}

importWordPress()

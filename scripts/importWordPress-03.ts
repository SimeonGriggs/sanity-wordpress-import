import pLimit from 'p-limit'
import {getCliClient} from 'sanity/cli'

import {dataTypeCount} from './lib/dataTypeCount'
import {dataTypeFetch} from './lib/dataTypeFetch'
import {imageFetchFromUrl} from './lib/imageFetchFromUrl'
import {populateImageCache} from './lib/populateImageCache'

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
    .then((res) =>
      console.log(`Created or updated ${res.results.length} "category" and "tag" documents`),
    )
    .catch(console.error)

  transaction.reset()

  // Fetch "user" data from WordPress
  const userCount = await dataTypeCount('users')
  const userData = await dataTypeFetch('users', userCount)

  // Prepare a "cache" of existing images to prevent needless re-uploads
  const imageCache = await populateImageCache(client)

  // These document transformations include an async function to upload the image
  // So we limit the number of concurrent requests to avoid rate limiting
  const limit = pLimit(1)

  // Transform into Sanity documents with deterministic IDs
  const userDocuments = userData.map((user) =>
    limit(async () => ({
      _id: `author-${user.id}`,
      _type: 'author',
      name: user.name,
      slug: {current: user.slug},
      url: user.url ?? undefined,
      description: user.description ?? undefined,
      avatar: await imageFetchFromUrl(user.avatar_urls[96], client, {}, imageCache),
    })),
  )
  const userDocumentsProcessed = await Promise.all(userDocuments)

  for (let uIndex = 0; uIndex < userDocumentsProcessed.length; uIndex++) {
    transaction.createOrReplace(userDocumentsProcessed[uIndex])
  }

  // Commit the transaction to publish these new documents
  await transaction
    .commit()
    .then((res) => console.log(`Created or updated ${res.results.length} "author" documents`))
}

importWordPress()

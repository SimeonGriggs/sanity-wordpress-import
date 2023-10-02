import pLimit from 'p-limit'
import {getCliClient} from 'sanity/cli'

import {dataTypeCount} from './lib/dataTypeCount'
import {dataTypeFetch} from './lib/dataTypeFetch'
import {htmlToBlockContent} from './lib/htmlToBlockContent'
import {imageFetchFromId} from './lib/imageFetchFromId'
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

  transaction.reset()

  // Fetch "post" data from WordPress
  const postCount = await dataTypeCount('posts')
  const postData = await dataTypeFetch('posts', postCount)

  // Transform into Sanity documents with deterministic IDs
  const postDocuments = postData.map((post) => {
    return limit(async () => ({
      _id: `post-${post.id}`,
      _type: 'post',
      title: post.title.rendered,
      slug: {current: post.slug},
      date: new Date(post.date).toISOString(),
      modified: new Date(post.modified).toISOString(),
      sticky: Boolean(post.sticky),
      // Convert HTML to Sanity's Portable Text
      content: await htmlToBlockContent(post.content.rendered, client, imageCache),
      excerpt: await htmlToBlockContent(post.excerpt.rendered, client, imageCache),
      // Retrieve image details from API and upload
      featuredMedia: post.featured_media
        ? await imageFetchFromId(post.featured_media, client, imageCache)
        : undefined,
      // Create references to already-imported documents
      tags: post.tags.map((tagId: number) => ({_type: 'reference', _ref: `tag-${tagId}`})),
      categories: post.categories.map((categoryId: number) => ({
        _type: 'reference',
        _ref: `category-${categoryId}`,
      })),
      author: {_type: 'reference', _ref: `author-${post.author}`},
    }))
  })
  const postDocumentsProcessed = await Promise.all(postDocuments)

  // Chunk transactions into 1000 documents at a time
  // This avoids issues with the maximum request size
  const TRANSACTION_SIZE = 1000

  for (let pIndex = 0; pIndex < postDocumentsProcessed.length; pIndex += TRANSACTION_SIZE) {
    const chunk = postDocumentsProcessed.slice(pIndex, pIndex + TRANSACTION_SIZE)

    if (chunk.length === 0) {
      console.log(`No more "post" documents to create or update`)
      break
    }

    console.log(`Creating or updating ${chunk.length} "post" documents`)

    for (let cIndex = 0; cIndex < chunk.length; cIndex++) {
      transaction.createOrReplace(chunk[cIndex])
    }

    await transaction
      .commit({autoGenerateArrayKeys: true})
      .then((res) => console.log(`Created or updated ${res.results.length} "post" documents`))
      .catch(console.error)
  }
}

importWordPress()

import type {SanityClient} from 'sanity'

type ImageDocument = {_id: string; originalFilename: string}

export async function populateImageCache(client: SanityClient): Promise<{[k: string]: string}> {
  const images = await client.fetch<ImageDocument[]>(
    `*[_type == "sanity.imageAsset" && defined(originalFilename)]{ _id, originalFilename }`,
  )

  const indexById: {[k: string]: string} = {}

  for (const image of images) {
    indexById[image.originalFilename] = image._id
  }

  return indexById
}

import type {Reference, SanityClient} from 'sanity'

import {createImageReference} from './createImageReference'
import {getFilenameFromUrl} from './getFilenameFromUrl'
import {removeEmptyKeys} from './removeEmptyKeys'

export async function imageFetchFromUrl(
  url: string,
  client: SanityClient,
  metadata: {[key: string]: string | undefined} = {},
  imageCache: {[key: string]: string} = {},
): Promise<{_type: 'image'; asset: Reference} | undefined> {
  const filename = getFilenameFromUrl(url)

  if (!filename) {
    throw new Error(`Failed to parse filename from URL: ${url}`)
  }

  // Avoid re-uploading images that already exist
  if (filename && imageCache[filename]) {
    console.log(`Found cached image: ${imageCache[filename]}`)
    return createImageReference(imageCache[filename])
  }

  const imageBuffer = await fetch(url)
    .then((res) => {
      if (res.status !== 200) {
        throw new Error(`Bad request for image: ${url}`)
      }

      return res.arrayBuffer()
    })
    .then((arrayBuffer) => Buffer.from(arrayBuffer))
    .catch((error) => {
      console.error(`Failed to fetch image: ${url}`)
      console.error(error)
    })

  if (!imageBuffer || imageBuffer.byteLength === 0) {
    console.error(`Image buffer empty for: ${url}`)
    return undefined
  }

  const imageAsset = await client.assets
    .upload('image', imageBuffer, {
      filename,
      source: {
        id: filename,
        name: 'WordPress',
        url,
      },
      ...removeEmptyKeys(metadata),
    })
    .catch((error) => {
      console.error(`Failed to upload image: ${url}`)
      console.error(error)
    })

  if (imageAsset?._id) {
    console.log(`Uploaded image: ${imageAsset._id} with filename "${filename}"`)

    return createImageReference(imageAsset._id)
  }

  return undefined
}

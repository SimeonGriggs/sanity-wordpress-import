import type {SanityClient} from 'sanity'

import {BASE_URL} from './constants'
import {createImageReference} from './createImageReference'
import {getFilenameFromUrl} from './getFilenameFromUrl'
import {imageFetchFromUrl} from './imageFetchFromUrl'

export async function imageFetchFromId(
  id: number,
  client: SanityClient,
  imageCache: {[key: string]: string} = {},
) {
  const imageRecordUrl = `${BASE_URL}/wp-json/wp/v2/media/${id}`
  const imageData = await fetch(imageRecordUrl)
    .then((res) => res.json())
    .catch(console.error)

  if (!imageData || !imageData.source_url) {
    console.log(`No data found for ${imageRecordUrl}`)
    return undefined
  }

  const filename = getFilenameFromUrl(imageData.source_url)

  if (filename && imageCache[filename]) {
    console.log(`Found cached image: ${imageCache[id]}`)
    return createImageReference(imageCache[id])
  } else if (!filename) {
    return undefined
  }

  return imageFetchFromUrl(
    imageData.source_url,
    client,
    {
      alt: imageData.alt_text,
      title: imageData.title.rendered,
    },
    imageCache,
  )
}

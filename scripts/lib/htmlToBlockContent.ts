import {htmlToBlocks} from '@sanity/block-tools'
import {Schema} from '@sanity/schema'
import {JSDOM} from 'jsdom'
import pLimit from 'p-limit'
import type {FieldDefinition, SanityClient} from 'sanity'

import {schemaTypes} from '../../schemas'
import {imageFetchFromUrl} from './imageFetchFromUrl'

const defaultSchema = Schema.compile({types: schemaTypes})
const blockContentSchema = defaultSchema
  .get('post')
  .fields.find((field: FieldDefinition) => field.name === 'content').type

// https://github.com/sanity-io/sanity/blob/next/packages/%40sanity/block-tools/README.md
export async function htmlToBlockContent(
  html: string,
  client: SanityClient,
  imageCache: {[key: string]: string} = {},
) {
  // Convert HTML to Sanity's Portable Text
  const blocks = htmlToBlocks(html, blockContentSchema, {
    parseHtml: (html) => new JSDOM(html).window.document,
    rules: [
      {
        deserialize(node, next, block) {
          const el = node as HTMLElement

          if (node.nodeName.toLowerCase() === 'div') {
            const imgEl = el.querySelector('img')

            if (!imgEl?.src) {
              return undefined
            }

            const altText = imgEl.getAttribute('alt')
            const caption = el.querySelector('p.wp-caption-text')?.textContent

            // Return as new block, not child of existing block
            return block({
              _type: 'image',
              // placeholder, will be replaced by the actual image
              url: imgEl.src,
              altText: altText ?? undefined,
              description: caption ?? undefined,
            })
          }

          return undefined
        },
      },
    ],
  })

  // Find any image blocks and upload them, with rate limiting
  const limit = pLimit(2)

  const blocksWithUploads = blocks.map((block) => {
    return limit(async () => {
      if (block._type !== 'image') {
        return block
      }

      return imageFetchFromUrl(
        block.url,
        client,
        {
          altText: block.altText,
          description: block.description,
        },
        imageCache,
      )
    })
  })

  return Promise.all(blocksWithUploads)
}

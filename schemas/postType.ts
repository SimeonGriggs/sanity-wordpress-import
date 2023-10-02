// ./schemas/postType.ts

import {ComposeIcon, ImageIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({name: 'slug', type: 'slug'}),
    defineField({name: 'date', type: 'datetime'}),
    defineField({name: 'modified', type: 'datetime'}),
    defineField({
      name: 'content',
      type: 'array',
      of: [
        {type: 'block'},
        defineArrayMember({
          name: 'image',
          type: 'image',
          icon: ImageIcon,
        }),
      ],
    }),
    defineField({name: 'excerpt', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'featuredMedia', type: 'image'}),
    defineField({name: 'sticky', type: 'boolean'}),
    defineField({name: 'author', type: 'reference', to: [{type: 'author'}]}),
    defineField({
      name: 'categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
    }),
    defineField({name: 'tags', type: 'array', of: [{type: 'reference', to: [{type: 'tag'}]}]}),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'author.name',
      media: 'featuredMedia',
    },
  },
})

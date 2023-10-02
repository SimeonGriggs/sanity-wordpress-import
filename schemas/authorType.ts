// ./schemas/authorType.ts

import {UserIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'name', type: 'string'}),
    defineField({name: 'slug', type: 'slug'}),
    defineField({name: 'url', title: 'URL', type: 'url'}),
    defineField({name: 'description', type: 'text'}),
    defineField({name: 'avatar', type: 'image'}),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'url',
      media: 'avatar',
    },
  },
})

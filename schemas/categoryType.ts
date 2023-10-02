// ./schemas/categoryType.ts

import {FilterIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: FilterIcon,
  fields: [defineField({name: 'name', type: 'string'}), defineField({name: 'slug', type: 'slug'})],
  preview: {
    select: {
      title: 'name',
      subtitle: 'slug.current',
    },
  },
})

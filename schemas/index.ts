// ./schemas/index.ts

import {authorType} from './authorType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {tagType} from './tagType'

export const schemaTypes = [postType, authorType, categoryType, tagType]

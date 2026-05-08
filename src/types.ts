export type WishCategory = 'love' | 'career' | 'health' | 'money' | 'other'

export type WishRitual = 'fire' | 'water' | 'tree' | 'sky'

export interface Wish {
  id: string
  text: string
  category: WishCategory
  ritual: WishRitual
  createdAt: number
}

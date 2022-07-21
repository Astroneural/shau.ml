import type { Icon } from '$lib/types/icon'
import { site } from '$lib/config/site'

export const favicon: Icon = {
  src: 'https://shau.ml/favicon_48x42.png',
  sizes: '48x42',
  type: 'image/png'
} 

export const any: { [key: number]: Icon } = {
  180: {
    src: 'https://shau.ml/assets/icon_180x180.png',
    sizes: '180x180',
    type: 'image/png'
  },
  192: {
    src: 'https://shau.ml/assets/icon_1992x192.png',
    sizes: '192x192',
    type: 'image/png'
  },
  512: {
    src: 'https://shau.ml/assets/icon_512x512.png',
    sizes: '512x512',
    type: 'image/png'
  }
}

export const maskable: { [key: number]: Icon } = {
  192: {
    src: 'https://shau.ml/assets/icon_192x192.png',
    sizes: '192x192',
    type: 'image/png'
  },
  512: {
    src: 'https://shau.ml//assets/icon_512x512.png',
    sizes: '512x512',
    type: 'image/png'
  }
}

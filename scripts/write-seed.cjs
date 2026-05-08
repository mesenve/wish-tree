const fs = require('fs')
const path = require('path')

const cats = ['love', 'career', 'health', 'money', 'other']
const rits = ['fire', 'water', 'tree', 'sky']

const phrases = [
  'Ailem huzurlu olsun.',
  'Sagligim yerinde kalsin.',
  'Is hayatimda adil sans bulayim.',
  'Sevdigim insanlar mutlu olsun.',
  'Maddi kaygi azalsin.',
  'Ic huzurum artsin.',
  'Annem babam enerjik olsun.',
  'Yeni bir baslangic yapayim.',
  'Korkularim hafiflesin.',
  'Arkadaslarimla guzel anilar biriktireyim.',
  'Derslerimde basarili olayim.',
  'Ofiste saygi gorsun emegim.',
  'Kira ve faturalar dayanilir olsun.',
  'Ask hayatimda dogru kisiyle bulusayim.',
  'Spor aliskanligi kazanayim.',
  'Uyku duzenim duzelsin.',
  'Cocuklar guvende buyusun.',
  'Yurt disi yolculugu yapayim.',
  'Kitap yazma hayalimi ilerleteyim.',
  'Mentor bulayim yolumu aydinlatsin.',
  'Kredi borcum azalsin.',
  'Bahceme cicek ekeyim.',
  'Muzik calmayi ogreneyim.',
  'Migrenim azalsin.',
  'Sinavi basariyla geceyim.',
  'Terfi sansi dogsun.',
  'Komsularla gonul koprusu olsun.',
  'Dis agrim gecsin.',
  'Kalbime uygun is bulayim.',
  'Tasarruf edebileyim.',
  'Yoga ve nefes pratigi sursun.',
  'Stresim yonetilebilir olsun.',
  'Ekip lideri olmayi hak edeyim.',
  'Acil durum fonum dolsun.',
  'Gokyuzunu daha cok izleyeyim.',
  'Siiri yazabileyim.',
  'Barismak istedigimle yuzlesmekten korkmayayim.',
  'Freelance isler artsin.',
  'Borsada sabirli olayim.',
  'Evlilik yildonumu kutlanabilsin.',
  'Mulakat heyecanini yenebileyim.',
  'Araba masrafi surpriz olmasin.',
  'Alerjilerim hafiflesin.',
  'Kemiklerim guclu kalsin.',
  'Uzaktaki dostuma sarilayim.',
  'Kardesimle barisalim.',
  'Hidrellez dileklerim gercek olsun.',
  'Evren bana iyilik gondersin.',
  'Kucuk sevincler buyusun.',
  'Zorbalik bitsin okullarda.',
  'Gonlumce iyilik gelsin kotuluk uzak dursun.',
]

const seeds = phrases.map((text, i) => ({
  text,
  category: cats[i % cats.length],
  ritual: rits[i % rits.length],
}))

const base = Date.UTC(2026, 4, 1, 20, 0, 0)

const out = `import type { Wish, WishCategory, WishRitual } from './types'

type Seed = { text: string; category: WishCategory; ritual: WishRitual }

const seeds: Seed[] = ${JSON.stringify(seeds, null, 2)}

const base = Date.UTC(2026, 4, 1, 20, 0, 0)

export const SEED_WISHES: Wish[] = seeds.map((s, i) => ({
  id: \`hidrellez-seed-\${String(i + 1).padStart(3, '0')}\`,
  text: s.text,
  category: s.category,
  ritual: s.ritual,
  createdAt: base - i * 43 * 60 * 1000,
}))
`

fs.writeFileSync(path.join(__dirname, '..', 'src', 'seedWishes.ts'), out, 'utf8')
console.log('seedWishes.ts written', seeds.length)

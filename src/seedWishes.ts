import type { Wish, WishCategory, WishRitual } from './types'

type Seed = { text: string; category: WishCategory; ritual: WishRitual }

const seeds: Seed[] = [
  { text: 'Ailemle birlikte sağlıklı ve huzurlu bir yıl diliyorum.', category: 'health', ritual: 'tree' },
  { text: 'Kalbime iyi gelen bir aşk diliyorum.', category: 'love', ritual: 'sky' },
  { text: 'İşimde emeklerimin karşılığını almayı diliyorum.', category: 'career', ritual: 'fire' },
  { text: 'Maddi açıdan ferahlık ve bereket diliyorum.', category: 'money', ritual: 'water' },
  { text: 'İçimdeki kaygıların hafiflemesini diliyorum.', category: 'other', ritual: 'tree' },
  { text: 'Annemin ve babamın sağlığının hep iyi olmasını diliyorum.', category: 'health', ritual: 'sky' },
  { text: 'Hayatımda güven veren bir yol arkadaşlığı diliyorum.', category: 'love', ritual: 'water' },
  { text: 'Kariyerimde güzel bir fırsat kapısı açılsın istiyorum.', category: 'career', ritual: 'fire' },
  { text: 'Borçlarımı kolaylıkla kapatmayı diliyorum.', category: 'money', ritual: 'tree' },
  { text: 'Ruhuma iyi gelen sakin bir hayat diliyorum.', category: 'other', ritual: 'water' },
  { text: 'Bağışıklığımın güçlü olmasını diliyorum.', category: 'health', ritual: 'fire' },
  { text: 'Sevdiğim insanla yollarımızın kesişmesini diliyorum.', category: 'love', ritual: 'tree' },
  { text: 'Yeni projelerde cesur ve başarılı olmayı diliyorum.', category: 'career', ritual: 'sky' },
  { text: 'Kazancımın artmasını ve bereketlenmesini diliyorum.', category: 'money', ritual: 'fire' },
  { text: 'Evimde huzur ve neşe olmasını diliyorum.', category: 'other', ritual: 'sky' },
  { text: 'Uyku düzenimin düzelmesini ve dinç uyanmayı diliyorum.', category: 'health', ritual: 'water' },
  { text: 'Gönlümdeki sevginin karşılık bulmasını diliyorum.', category: 'love', ritual: 'fire' },
  { text: 'Sınavlarımda ve mülakatlarımda başarı diliyorum.', category: 'career', ritual: 'water' },
  { text: 'Beklenmedik güzel bir maddi kısmet diliyorum.', category: 'money', ritual: 'sky' },
  { text: 'Hayatımda daha çok ilham ve üretkenlik diliyorum.', category: 'other', ritual: 'tree' },
  { text: 'Ağrılarımın hafiflemesini ve bedenimin güçlenmesini diliyorum.', category: 'health', ritual: 'tree' },
  { text: 'Uzun zamandır özlediğim biriyle kavuşmayı diliyorum.', category: 'love', ritual: 'sky' },
  { text: 'Çalıştığım yerde değer görmeyi diliyorum.', category: 'career', ritual: 'fire' },
  { text: 'Evime bolluk ve bereket enerjisi gelsin diliyorum.', category: 'money', ritual: 'water' },
  { text: 'Kendime daha çok güvenmeyi ve huzur bulmayı diliyorum.', category: 'other', ritual: 'sky' },
]

const base = Date.UTC(2026, 4, 1, 20, 0, 0)

export const SEED_WISHES: Wish[] = seeds.map((s, i) => ({
  id: `hidrellez-seed-${String(i + 1).padStart(3, '0')}`,
  text: s.text,
  category: s.category,
  ritual: s.ritual,
  createdAt: base - i * 43 * 60 * 1000,
}))

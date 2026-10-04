import type { LocalizedString } from '../i18n/types'

export type CategoryId =
  | 'memory'
  | 'attention'
  | 'speed'
  | 'problemSolving'
  | 'flexibility'
  | 'math'
  | 'language'

export interface Game {
  id: string
  category: CategoryId
  name: LocalizedString
  description: LocalizedString
}

export const categoryOrder: CategoryId[] = [
  'memory',
  'attention',
  'speed',
  'problemSolving',
  'flexibility',
  'math',
  'language',
]

export const categoryLabels: Record<CategoryId, LocalizedString> = {
  memory: { tr: 'Hafıza', en: 'Memory' },
  attention: { tr: 'Dikkat', en: 'Attention' },
  speed: { tr: 'Hız', en: 'Speed' },
  problemSolving: { tr: 'Problem Çözme', en: 'Problem Solving' },
  flexibility: { tr: 'Esneklik', en: 'Flexibility' },
  math: { tr: 'Matematik', en: 'Math' },
  language: { tr: 'Dil', en: 'Language' },
}

export const games: Game[] = [
  {
    id: 'memory-matrix',
    category: 'memory',
    name: { tr: 'Hafıza Matrisi', en: 'Memory Matrix' },
    description: {
      tr: 'Karelerin anlık parlamasını izleyip doğru hücreleri hatırlayın.',
      en: 'Watch squares flash and recall the correct cells.',
    },
  },
  {
    id: 'digit-span',
    category: 'memory',
    name: { tr: 'Sayı Hafızası', en: 'Digit Span' },
    description: {
      tr: 'Giderek uzayan sayı dizilerini ezberleyip aynı sırayla tekrar tuşlayın.',
      en: 'Memorize increasingly long digit sequences and type them back in order.',
    },
  },
  {
    id: 'schulte-table',
    category: 'attention',
    name: { tr: 'Schulte Tablosu', en: 'Schulte Table' },
    description: {
      tr: 'Tablodaki sayıları 1\'den 25\'e kadar sırayla ve en hızlı şekilde bulun.',
      en: 'Find the numbers in the table in order from 1 to 25 as fast as possible.',
    },
  },
  {
    id: 'word-memory',
    category: 'language',
    name: { tr: 'Kelime Hafızası', en: 'Word Memory' },
    description: {
      tr: 'Ekrana gelen kelimeleri hatırlayıp, yeniyse "Yeni", eskiyse "Daha Önce Gördüm" deyin.',
      en: 'Remember words shown on screen. Click "New" if unseen, or "Seen" if it appeared before.',
    },
  },
  {
    id: 'speed-match',
    category: 'speed',
    name: { tr: 'Hız Eşleştirme', en: 'Speed Match' },
    description: {
      tr: 'Sembollerin bir önceki sembolle aynı mı farklı mı olduğuna saniyeler içinde karar verin.',
      en: 'Decide in seconds whether symbols match the previous one or not.',
    },
  },
  {
    id: 'chalkboard-challenge',
    category: 'problemSolving',
    name: { tr: 'Tahta Mücadelesi', en: 'Chalkboard Challenge' },
    description: {
      tr: 'Tahtadaki sayı dizilerindeki eksik parçayı mantık yürüterek bulun.',
      en: 'Find the missing piece in number sequences on the board.',
    },
  },
  {
    id: 'ciftleri-bul',
    category: 'memory',
    name: { tr: 'Çiftleri Bul', en: 'Find Pairs' },
    description: {
      tr: 'Kapalı kartların altındaki sembolleri eşleştirerek tabloyu en kısa sürede temizleyin.',
      en: 'Match the symbols under the closed cards to clear the board as fast as possible.',
    },
  },
  {
    id: 'dot-tap',
    category: 'speed',
    name: { tr: 'Çevik Nokta', en: 'Dot Tap' },
    description: {
      tr: 'Ekranda rastgele beliren noktalara süre bitmeden en hızlı şekilde tıklayın.',
      en: 'Click on randomly appearing dots as fast as possible before time runs out.',
    },
  },
  {
    id: 'word-bubbles',
    category: 'language',
    name: { tr: 'Kelime Baloncukları', en: 'Word Bubbles' },
    description: {
      tr: 'Ekranda uçuşan harf baloncuklarına sırasıyla tıklayarak istenilen hedef kelimeyi oluşturun.',
      en: 'Click the floating letter bubbles in order to form the target word.',
    },
  },
  {
    id: 'thought-train',
    category: 'attention',
    name: { tr: 'Düşünce Treni', en: 'Thought Train' },
    description: {
      tr: 'Aşağı inen objeleri kendi rengiyle eşleşen istasyonlara yönlendirin.',
      en: 'Route falling objects to the stations matching their color.',
    },
  },
  {
    id: 'merge-game',
    category: 'problemSolving',
    name: { tr: 'Sayı Birleştirme', en: 'Merge Game' },
    description: {
      tr: 'Aynı değerli blokları kaydırıp birleştirerek en yüksek sayıya ulaşın (2048).',
      en: 'Slide and combine blocks of the same value to reach the highest number (2048).',
    },
  },
  {
    id: 'balloon-pop',
    category: 'speed',
    name: { tr: 'Balon Patlatma', en: 'Balloon Pop' },
    description: {
      tr: 'Ekranda belirip saniyeler içinde kaybolan balonlara süresi bitmeden tıklayın.',
      en: 'Click on randomly appearing balloons before they disappear.',
    },
  },
  {
    id: 'raindrops',
    category: 'math',
    name: { tr: 'Yağmur Damlaları', en: 'Raindrops' },
    description: {
      tr: 'Düşen damlalardaki işlemleri zihinden çözüp doğru cevabı seçin.',
      en: 'Mentally solve equations on falling drops and pick the answer.',
    },
  },
  {
    id: 'color-match',
    category: 'flexibility',
    name: { tr: 'Renk Tuzağı', en: 'Color Trap' },
    description: {
      tr: 'Kelimenin anlamı ile yazı rengi çeliştiğinde doğru seçeneğe basın.',
      en: 'When word meaning and ink color conflict, choose the right option.',
    },
  },
  {
    id: 'penguin-pursuit',
    category: 'memory',
    name: { tr: 'Penguen Takibi', en: 'Penguin Pursuit' },
    description: {
      tr: 'Penguenlerin hareket sırasını izleyip son konumlarını hatırlayın.',
      en: 'Track penguin movements and remember their final positions.',
    },
  },
  {
    id: 'brain-shift',
    category: 'flexibility',
    name: { tr: 'Zihin Vitesi', en: 'Brain Shift' },
    description: {
      tr: 'Kurallar aniden değişirken hızlıca yeni stratejiye geçin.',
      en: 'Switch strategies quickly when the rules change mid-game.',
    },
  },
  {
    id: 'renk-cemberi',
    category: 'speed',
    name: { tr: 'Renk Çemberi', en: 'Color Circle' },
    description: {
      tr: 'Yukarıdan gelen topun rengi ile dönen çemberin rengini eşleştirerek reflekslerinizi test edin.',
      en: 'Test your reflexes by matching the falling ball color with the rotating circle color.',
    },
  },
  {
    id: 'splitting-seeds',
    category: 'math',
    name: { tr: 'Tohum Ayırma', en: 'Splitting Seeds' },
    description: {
      tr: 'Tohum gruplarını eşit paylaştırmak için hızlı bölme kararları verin.',
      en: 'Make quick division choices to split seed groups evenly.',
    },
  },
  {
    id: 'assist-ant',
    category: 'problemSolving',
    name: { tr: 'Karınca Yardımı', en: 'Assist Ant' },
    description: {
      tr: 'Karıncaya en kısa yolu çizerek labirentteki hedefe ulaştırın.',
      en: 'Draw the shortest path to guide the ant through the maze.',
    },
  },
  {
    id: 'star-search',
    category: 'attention',
    name: { tr: 'Yıldız Avı', en: 'Star Search' },
    description: {
      tr: 'Kalabalık sahnede gizlenmiş yıldızı süre dolmadan tespit edin.',
      en: 'Find the hidden star in a busy scene before time runs out.',
    },
  },
  {
    id: 'organic-order',
    category: 'problemSolving',
    name: { tr: 'Organik Sıra', en: 'Organic Order' },
    description: {
      tr: 'Büyüme kurallarına göre canlıları doğru sıraya dizin.',
      en: 'Order organisms correctly according to growth rules.',
    },
  },
  {
    id: 'feel-the-beat',
    category: 'attention',
    name: { tr: 'Ritmi Yakala', en: 'Feel the Beat' },
    description: {
      tr: 'Metronom ritmine uygun dokunuşlarla zamanlama hassasiyetinizi ölçün.',
      en: 'Tap in time with the metronome to test timing precision.',
    },
  },
  {
    id: 'memory-serves',
    category: 'memory',
    name: { tr: 'Servis Hafızası', en: 'Memory Serves' },
    description: {
      tr: 'Müşteri siparişlerini kısa süre dinleyip hatasız tekrarlayın.',
      en: 'Listen to short orders and repeat them back without mistakes.',
    },
  },
  {
    id: 'contextual',
    category: 'problemSolving',
    name: { tr: 'Bağlam Dedektifi', en: 'Contextual' },
    description: {
      tr: 'Cümle bağlamından eksik kelimeyi mantıksal çıkarımla tamamlayın.',
      en: 'Infer the missing word from sentence context.',
    },
  },
  {
    id: 'denge-denklemi',
    category: 'problemSolving',
    name: { tr: 'Denge Denklemi', en: 'Balance Equation' },
    description: {
      tr: 'Teraziyi dengede tutmak için eksik olan matematiksel sayıyı en hızlı şekilde bulun.',
      en: 'Find the missing mathematical number as quickly as possible to balance the scale.',
    },
  },
  {
    id: 'gizli-yol',
    category: 'memory',
    name: { tr: 'Gizli Yol', en: 'Hidden Path' },
    description: {
      tr: 'Kısa süreliğine beliren güvenli yolu akılda tutup sırasıyla tıklayarak bölümü geçin.',
      en: 'Memorize the briefly shown safe path and click it in order to pass the level.',
    },
  },
  {
    id: 'harf-avi',
    category: 'attention',
    name: { tr: 'Harf Avı', en: 'Letter Hunt' },
    description: {
      tr: 'Ekranda uçuşan harfler arasından belirtilen hedef harfi bulup tıklayın.',
      en: 'Find and click the specified target letter among the floating letters on screen.',
    },
  },
  {
    id: 'sekme',
    category: 'speed',
    name: { tr: 'Sekme', en: 'Rebound' },
    description: {
      tr: 'Platformu kaydırarak topu duvarlardan sektirin ve hedefleri vurun.',
      en: 'Slide the paddle to bounce the ball off walls and hit the targets.',
    },
  },
  {
    id: 'eagle-eye',
    category: 'attention',
    name: { tr: 'Kartal Gözü', en: 'Eagle Eye' },
    description: {
      tr: 'Geniş alanda beliren nesneyi hızlıca tespit edip tıklayarak dikkatinizi test edin.',
      en: 'Test your attention by quickly spotting and clicking the object appearing in a wide area.'
    },
  },
  {
    id: 'halve-your-cake',
    category: 'math',
    name: { tr: 'Pastayı Böl', en: 'Halve Your Cake' },
    description: {
      tr: 'Verilen kesirleri olabildiğince hızlı hesapla.',
      en: 'Calculate the given fractions as quickly as possible.',
    },
  },
  {
    id: 'hizli-eslestirme',
    category: 'speed',
    name: { tr: 'Hızlı Eşleştirme', en: 'Speed Match' },
    description: {
      tr: 'Ekranda beliren sembolün aynısını dört seçenek arasından hızlıca bulup tıkla!',
      en: 'Quickly find and tap the matching symbol from four options!',
    },
  }
]

# Loves Edition Gift Generation Guidelines

This file serves as a persistent guide for creating and processing gifts for the Loves Edition project. It outlines the schema, workflow, and common pitfalls.

---

## Workflow for Processing Orders

When the user asks to process a new order, ALWAYS follow these steps:

1. **Dapatkan KV ID & Order ID sebelum mulai menulis script.**
   - Jika KV ID belum diberikan, tanya dulu sebelum membuat script.
   - Jangan pernah mulai script dengan slug placeholder jika KV ID sudah tersedia.

2. **Fetch the Order from KV First**:
   - Never use static mock photos (`/photos/1.jpg`). The customer's uploaded photos and secret media are already stored in Cloudflare KV under the key `order:ORD-XXXXXXX`.
   - Always fetch the `order` object from KV first.
   - Extract `order.photos` array (up to 14 photos for the gallery) and `order.secretPhoto`.

3. **KV Keys**:
   - `order:{orderId}`: The raw order submitted from the form (contains uploaded photos).
   - `draft:{kvId}`: The draft metadata for the Studio dashboard.
   - `gift:{kvId}`: The actual gift payload used by the GiftPage.

---

## Music / Song URL Policy

> **PENTING**: Jangan pernah melakukan pencarian YouTube secara otomatis untuk mendapatkan link lagu.
> User (tim) akan mengisi `musicUrl` secara manual.

- Jika customer request lagu tertentu: tulis **placeholder** di script seperti:
  ```js
  musicUrl: "FILL_MANUALLY: Shape of My Heart - Backstreet Boys",
  ```
- Jika customer pilih "Let Team Decide": tulis:
  ```js
  musicUrl: "FILL_MANUALLY: team choose",
  ```
- Setelah script dijalankan dan gift dibuat, **ingatkan user** untuk mengupdate `musicUrl` di Studio Editor secara manual.

---

## Schema Mapping Rules

| Field | Rule |
|---|---|
| `timeTitle` | `"Your Journey"` untuk Ultah/individual, `"Our Journey"` untuk Anniversary/LDR/Couples. **PENTING**: Jika momennya spesifik ("Lainnya", misal: "Dinner pertama"), JANGAN gunakan template generik. Buat judul yang spesifik menyesuaikan momen (contoh: `"Since Our First Dinner"`). |
| `timeStartDate` | Gunakan tanggal lahir penerima untuk Ultah. Gunakan tanggal mulai hubungan untuk Anniversary/LDR. **Validasi tahun** — jika customer input tahun yang tidak masuk akal (misal 2026 untuk lahir), koreksi sendiri. |
| `metaphorChoice` | **Secara default (wajib), tetap buatkan `reasons` (6 buah) Reason Cards.** Opsi `seasons` (dengan 4 kartu metafora) sekarang **bersifat opsional**. JANGAN buat `seasons` array KECUALI jika user (saya) secara eksplisit memintanya. Jika diminta, pilih salah satu dari 4 preset yang tersedia di Studio Editor yang paling cocok dengan konteks cerita customer: **1. Seasons** (Spring, Summer, Autumn, Winter), **2. Flowers** (Rose, Tulip, Lily, Sunflower), **3. Time of Day** (Sunrise, Noon, Dusk, Midnight), atau **4. Keepsakes** (The Flame, The Letter, The Promise, The Key). Sesuaikan *copywriting* isi pesannya dengan pesan asli customer. |
| `secretCaption` | Selalu berikan caption kontekstual yang manis. Jangan biarkan kosong. |
| `writing tone` | Baca dengan seksama. Lihat tabel tone di bawah. |
| `heroLine1/2` | **Wajib** menyertakan nama panggilan/nama penerima atau unsur romantis yang kuat. Contoh: `heroLine1: "To My Precious,"`, `heroLine2: "Amorcito"`. Jangan hanya template kaku. |
| `gateSubtitle` | **WAJIB ADA** di `giftData`. Jangan sampai terlewat agar Amplop depan tidak "undefined". |
| `recipient` | **WAJIB ADA** di `giftData` (bukan cuma di draft) untuk `<title>` SEO tab browser. |
| `introText` | **JANGAN** pernah meringkas/memendekkan pesan asli customer! Gunakan seluruh isi pesan customer. Pisahkan per kalimat atau paragraf menjadi **Array of Strings** (contoh: `introText: ["paragraf 1", "paragraf 2"]`) agar rapi di UI. |
| `reasons` | **Wajib** buat persis **6 buah Reason Cards**. Gunakan key `desc` BUKAN `text`. Sesuaikan bahasa `title` dengan writing tone. **CRITICAL**: Buat `desc` **sangat padat dan ringkas** (1 kalimat pendek). **JANGAN PERNAH** menggunakan karakter em-dash (`—`) atau tanda hubung panjang di **section manapun**. |
| `closingTitle1/2` | Sesuaikan dengan momen (Ultah → "Happy Birthday", LDR → "See You Soon", dsb) |
| `celebrateBtnText` | Kreatif & sesuai momen: "celebrate ✨", "miss you ✨", "goodbye ✨", dll |
| `sender` | **WAJIB ADA** di `giftData`. Nama pengirim (from) agar muncul sebagai tanda tangan di bagian akhir Closing Section. |

---

## Writing Tone Templates

### Indoglish (Termasuk Puitis/Santai)
- Campur Bahasa Indonesia dan English secara natural dalam satu kalimat.
- Contoh: *"Bersamamu, aku belajar bahwa being loved sincerely is the most precious feeling in the world."*
- **PENTING**: Jika writing tone adalah Indoglish, pastikan `title` untuk Reason Cards selalu menggunakan Bahasa Inggris (meskipun `desc` nya Indoglish).

### Full English
- 100% Bahasa Inggris, tone hangat dan puitis
- Hindari kalimat yang terlalu kaku atau terjemahan literal

### Santai
- Gunakan bahasa sehari-hari, akrab, tidak terlalu formal
- Boleh emoji secukupnya
- Hindari diksi yang terlalu puitis/sastra

### Puitis (Indonesia)
- Gunakan metafora alam, waktu, dan perasaan
- Kalimat lebih panjang dan mengalir
- Hindari bahasa sehari-hari yang terlalu kasual

### Self Love
- Sapa diri sendiri ("Dear me...", "Kepada diriku...")
- Tone penuh penerimaan dan self-compassion
- Hindari ucapan yang terdengar seperti dari orang lain

---

## Example Pattern for Photos

> **ATURAN GALLERY QUOTES (REVISI PENTING)**: 
> 1. Caption untuk foto (array `words`) HARUS berupa **1 kata pendek per foto** yang jika digabungkan membentuk sebuah kalimat manis. 
> 2. **SANGAT KRITIKAL**: JUMLAH KATA dalam kalimatmu **HARUS SAMA PERSIS** dengan jumlah foto aktual di `orderPhotos.length`! Jangan ditebak, jangan di-hardcode ke 14/15, dan **JANGAN di-looping/modulo** (karena akan menghasilkan kalimat aneh/berulang).
> 3. Cara yang benar: Selalu cari tahu dulu berapa jumlah `orderPhotos.length` yang di-upload customer, lalu rangkai sebuah kalimat yang jumlah katanya *tepat dan pas* dengan jumlah foto tersebut.
> 
> Contoh: Jika customer hanya upload 8 foto, buatlah kalimat dengan tepat 8 kata:
> `const words = ["Selamat", "Ulang", "Tahun", "Gadis", "Paling", "Cantik", "Kesayanganku", "🤍"];`

```javascript
const order = await cfGet(`order:${orderId}`);
const orderPhotos = (order && order.photos) ? order.photos : [];

// Rangkai kalimat yang jumlah katanya SAMA PERSIS dengan orderPhotos.length!
// JANGAN gunakan modulo/looping array untuk mengisi kekurangan kata.
// Misal foto ada 8, siapkan array berisi 8 kata.
const words = ["Selamat", "Ulang", "Tahun", "Orang", "Paling", "Spesial", "Buat", "Aku"];

const photos = [];
for (let i = 0; i < orderPhotos.length; i++) {
  photos.push({
    url: orderPhotos[i] || '', // Use actual URL from KV
    caption: words[i] || ''
  });
}
const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';
```

---

## Section Title Variations

Biar hasil generate tidak monoton, selalu variasikan judul-judul di bawah ini (jangan selalu pakai default):

### 1. Gallery Section (`galleryTitle1` & `galleryTitle2`)
- **Default:** "Our Beautiful" + "Memories"
- **Opsi Lain:**
  - "Captured" + "Moments"
  - "A Glimpse" + "Of Us"
  - "Pages of" + "Our Story"
  - "Fragments of" + "Happiness"
  - "The Time" + "We Shared"
  - "Unforgettable" + "Journey"
  - "Visual" + "Diaries"

### 2. Reason Cards (`reasonsTitle1` & `reasonsTitle2`)
- **Default:** "6 Reasons Why" + "I Love You"
- **Opsi Lain:**
  - "Why You Are" + "So Special"
  - "Things I" + "Adore About You"
  - "What Makes" + "You Amazing"
  - "The Little" + "Details"
  - "Why My Heart" + "Chooses You"
  - "A Million" + "Reasons Why"

### 3. Intro Section (`introPreTitle` & `introHeadline1, 2, 3`)
- **Default:** "a little message" | "To" "My" "Favorite Person"
- **Opsi Lain:**
  - "a letter from the heart" | "For" "The One" "I Love"
  - "words unspoken" | "To" "My" "Dearest"
  - "a small note" | "To" "My" "Precious"
  - "a birthday wish" | "For" "My" "Beloved"
  - "just wanted to say" | "Dear" "My" "Everything"

### 4. Closing Section (`closingPreTitle` & `closingTitle1, 2`)
- **Default:** "always & forever" | "You Are Loved" "Beyond Words"
- **Opsi Lain:**
  - "to many more years" | "Happy" "Birthday"
  - "until next time" | "See You" "Soon"
  - "with all my heart" | "I Love" "You"
  - "endless gratitude" | "Thank" "You"
  - "forever yours" | "Always &" "Forever"

---

## Common Pitfalls to Avoid

- **Lupa `recipient` dan `gateSubtitle` di `giftData`**: Akan menyebabkan browser tab title dan amplop depan merender tulisan "undefined".
- **Lupa `timeEnabled: true` dan `timeSubtitle`**: Time Section tidak akan muncul atau formatnya tidak lengkap.
- **Salah Key pada Reason Cards**: Key untuk teks adalah `desc`, BUKAN `text`. Jika salah, deskripsi akan kosong di UI.
- **Salah Key pada Season Cards**: Key untuk Season Cards adalah `name`, `teaser` (teks pendek sebelum di-tap), dan `message` (teks panjang saat di-tap). Jangan gunakan `desc` karena akan membuat kartu kosong.
- **Salah Key pada Closing Section**: Key untuk teks panjang di akhir surat adalah `closingParagraph`, BUKAN `closingText`. Jika menggunakan `closingText`, teks akan otomatis kembali ke template bawaan bahasa Inggris.
- **Jangan mulai YouTube search** untuk lagu. User yang input manual.
- **Forgetting to fetch `order.photos`**: DO NOT hardcode `/photos/1.jpg`.
- **Misgendering / Wrong Pronoun in Headers**: Use "Your Journey" for birthdays (e.g. "Ultah"), and "Our Journey" for Anniversaries/LDR.
- **Title Mismatches**: Ensure titles follow user instructions (e.g., "The Reason I Love You" vs "The Reason I Adore You"). Reason Card title juga harus menyesuaikan tone (jangan full English jika customer minta Indoglish).
- **Tahun lahir salah**: Selalu validasi `timeStartDate`. Jika customer input tahun tidak logis (misal 2026 untuk orang lahir), koreksi ke tahun yang benar berdasarkan usia yang disebutkan.
- **Menunggu KV ID**: Jika KV ID belum diberikan bersamaan dengan order, **minta dulu** sebelum menulis script agar tidak perlu edit ulang.
- **Script baru per customer**: Ini normal tapi pastikan nama file unik (processNama.mjs) agar tidak tertimpa.

---

## Situasi Khusus

### Customer Tanpa Foto
- Jika customer tidak mengunggah foto sama sekali, section gallery akan otomatis tersembunyi (sudah dihandle di GiftPage.jsx).
- Tetap sertakan array `photos: []` di giftData.
- Fokus pada kata-kata yang lebih kuat karena tidak ada visual pendukung.

### Customer Self Love
- `timeTitle`: "Your Journey" (perjalanan diri sendiri)
- `gateSubtitle`: Nama si customer sendiri atau "Dear Me"
- `introSignOff`: Ditulis dari perspektif diri sendiri ("Love, Me" atau nama sendiri)
- Section reasons: Ubah judulnya menjadi "The Things I Love About Me" atau sejenisnya

### Customer Bittersweet (Perpisahan, LDR, dll)
- Sesuaikan `celebrateBtnText` dengan momen: "goodbye ✨", "miss you ✨"
- Nada tetap positif dan hangat meski ada nuansa sedih
- Hindari terlalu melodramatik

### Anniversary, Ultah, & Momen Khusus
- **Anniversary**: `timeTitle` default adalah "Our Journey", namun *sangat disarankan* menggunakan variasi lain agar tidak monoton, seperti: "Our Story", "Us Through Time", "Chapters of Us", "Growing Together", "Since We Met", "Miles of Love", atau "Beautiful Moments". Hitung dari tanggal mulai hubungan, gunakan anniversary date sebagai `specialDate`
- **Ultah**: `timeTitle` default adalah "Your Journey" (atau "Hadirmu Di Dunia.." untuk bahasa Indonesia), namun *sangat disarankan* menggunakan variasi lain agar tidak monoton, seperti: "The Story of You", "A Beautiful Life", "Chapter of You", "Miles & Memories", "Growing Gracefully", "Since Day One", atau "Time of Your Life". Hitung dari tanggal lahir.
- **Momen Khusus (Lainnya)**: JANGAN gunakan template generik "Your/Our Journey". Buat `timeTitle` yang merepresentasikan momen tersebut secara spesifik sesuai konteks yang diinginkan customer (contoh: "Since Our First Dinner", "Since Graduation Day").

---

## Efisiensi & Roadmap Improvement

> Dicatat dari sesi kerja 11-12 Juli 2026 untuk improvement ke depan.

### Yang Perlu Ditingkatkan (Future)

1. **Universal process script**: Daripada buat script baru per customer, idealnya ada satu `processOrder.mjs` yang menerima argumen:
   ```bash
   node processOrder.mjs --orderId ORD-XXX --slug auto-XXX --tone "Puitis,Indoglish"
   ```

2. **Validasi form order**: 
   - Field "Tgl Lahir Penerima" perlu validasi — tolak tahun yang tidak masuk akal
   - Tambahkan field konfirmasi usia (e.g. "Ulang tahun ke berapa?") untuk double-check
   - KV ID sebaiknya ditampilkan langsung di halaman konfirmasi form agar langsung bisa di-copy ke tim

3. **Studio Dashboard**:
   - ✅ Generate ID sudah ada (auto-xxxxxxx)
   - ✅ Post-create modal (Copy Form Link / Open Editor) sudah ada
   - Future: Tambahkan preview thumbnail gift langsung dari dashboard

### Pesan & Teks Penutup (Self-Learning)

1. **Improvisasi Pesan yang Terlalu Pendek**:
   Jika pesan (message) dari customer terlalu singkat/pendek, **tugasmu adalah mengimprovisasi dan membuatnya sedikit lebih panjang** dengan tetap mempertahankan inti pesannya.
   - Pastikan gaya bahasa, tone (misal: Puitis, Santai, Indoglish), dan perspektif beradaptasi mengikuti cara customer menulis.
   - Jangan sekadar menyalin mentah-mentah jika pesannya terlalu kaku atau kurang bermakna untuk dijadikan sebuah surat.

2. **Closing Text Wajib Personalisasi**:
   **JANGAN PERNAH** menggunakan closing template default seperti: 
   *"No matter where life takes us, know that somewhere in the universe, there is a garden blooming with every feeling I have ever held for you. You deserve the world. You deserve all the flowers. You deserve everything."*
   - Buat closing text sendiri yang **dipersonalisasi** berdasarkan cerita/konteks customer (misal: LDR disuruh cepat pulang, apresiasi atas kelulusan, rasa syukur atas kesabaran, dll).
   - **Panjang Teks**: Buat dengan ukuran sedang. Jangan terlalu pendek (hanya 1 kalimat) tetapi juga jangan terlalu panjang bertele-tele. Cukup 2-3 kalimat yang hangat, ringkas, dan menyentuh.

3. **Hero Subtitle Harus Merayakan Momen**:
   - Jangan terlalu kaku/terpaku pada pesan asli yang disampaikan customer untuk bagian ini. Fokus utama *Hero Section* adalah **merayakan momen** (misalnya Ulang Tahun atau Anniversary) dengan nuansa yang meriah, hangat, dan puitis.
   - Hindari template standar yang terlalu pendek seperti *"20 years of you."*
   - Buat sedikit lebih panjang dan puitis/bermakna, contohnya *"20 years of you making the world a brighter place."* atau *"20 beautiful years of your journey."*

4. **Handling Out-of-Schema Metaphors (e.g., Time / Waktu)**:
   - Terkadang customer memilih metafora yang tidak standar (seperti "Time (Waktu)").
   - **TETAP GUNAKAN** schema yang sama (`reasons` dengan 6 item). Jangan mengubah key pada JSON. Cukup sesuaikan judul dan deskripsi dari Reason Cards agar selaras dengan metafora tersebut (misal: "Jejak Waktu", "Waktu Berjalan", dsb).

5. **Handling Highly Emotional / Bittersweet Messages**:
   - Jika pesan customer mengandung kesedihan, kekecewaan, curhatan, atau passive-aggressive (contoh: diselingkuhi tapi masih memaafkan, rindu mantan), **JANGAN** menggunakan template ulang tahun yang terlalu ceria dan generik.
   - Sesuaikan *tone* agar lebih empatik, *bittersweet*, dan mengalir seperti curhatan natural.
   - Ubah `celebrateBtnText` menjadi sesuatu yang lebih pas, contohnya `"miss you ✨"` atau `"tetap sayang ✨"`.

6. **Gaya Bahasa Anak Muda (ABG / Teenager)**:
   - Jika mendeteksi customer masih remaja (umur belasan) dan meminta bahasa santai, gunakan gaya bahasa yang sesuai (misal: repetisi huruf "akuuu", "sayangg", "banget", "yaa"). Hal ini membuat hasil *generate* terasa lebih natural dan tidak kaku seperti robot AI.

7. **Standarisasi Teks Gate (Amplop Depan)**:
   - Secara default, teks untuk halaman Gate (seperti `gateSubtitle`) **harus selalu** diisi dengan `"Something Special For u"`. Jangan gunakan template teks lain kecuali ada instruksi spesifik.
8. **WhatsApp Preview Template**:
   - Setiap kali selesai memproses order baru, SELALU lampirkan template pesan WhatsApp di akhir respons agar tim (user) bisa langsung copy-paste ke customer.
   - Gunakan format ini:
     ```text
     Halo kak! ✨
     Boleh minta tolong di-preview dulu yaa hasilnya (ini belum final):
     👉 https://anniv.for-you-always.my.id/{KV_ID}

     Nanti kalau ada bagian yang mau direvisi, tolong di-list aja ya kak. Kalau dirasa sudah oke semua, kabarin aku biar langsung aku buatin barcode-nya! 🙏
     ```

9. **Wajib Mencantumkan Nama Pengirim (Sender)**:
   - JANGAN PERNAH lupa untuk menambahkan *key* `sender` di dalam `giftData`.
   - Nama pengirim (From) ini sangat penting untuk dimunculkan sebagai tanda tangan di bagian akhir *Closing Section*. Jika terlewat, bagian bawah surat akan terlihat kosong.

10. **Ending Surat (Intro Text) Harus Wholesome & Tuntas**:
    - Bagian akhir dari surat utama (`introText`) sering kali terkesan "menggantung" atau berhenti tiba-tiba.
    - **WAJIB** menambahkan kalimat penutup/ending yang *wholesome*, romantis (jika untuk pasangan), atau manis (jika untuk keluarga/sahabat).
    - Sesuaikan gaya bahasa penutup ini dengan *writing tone* dari customer.
    - Jangan terlalu panjang, cukup 1-2 kalimat yang pas untuk memberikan konklusi surat yang manis sebelum masuk ke *Reason Cards*.

11. **Penggunaan Emoji sebagai Ikon (Reason & Season Cards)**:
    - Jika konteks cerita dari customer cocok menggunakan emoji, pertimbangkan untuk menggunakan emoji sebagai ikon di *Reason Cards* dan *Season Cards*. Ini tidak terbatas pada *tone* santai/menyenangkan saja; cerita yang romantis, sedih (*bittersweet*), atau *wholesome* pun bisa dipakaikan emoji yang sesuai (karena emoji sangat beragam).
    - Untuk *Reason Cards*, tambahkan properti `icon` berisi **1 emoji** (contoh: `icon: "😂"` atau `icon: "🥀"`) pada setiap objek di array `reasons`. Jangan gabungkan emoji di dalam `title`.
    - Untuk *Season Cards*, ubah properti `icon` dari yang sebelumnya teks string standar (`spring`, `summer`, dll) menjadi **1 emoji** (contoh: `icon: "🚦"` atau `icon: "🌧️"`) pada setiap objek di array `seasons`. Jangan gabungkan emoji di dalam `name`.
    - Sistem website sudah mendukung *render* otomatis emoji menjadi ikon besar yang mempercantik tampilan kartu jika diset melalui *field* `icon`.

12. **Naturalisasi Bahasa Indonesia (Anti-Kaku)**:
    - **SANGAT KRITIKAL**: Hindari menghasilkan teks Bahasa Indonesia yang baku, kaku, dan terlalu formal layaknya robot atau buku cetak.
    - **Tiru Gaya Asli Customer**: Jika pesan dari customer cukup panjang, perhatikan dan **TIRU** pilihan kosakata mereka. Jika mereka memakai kata "nggak", "udah", "banget", "bikin", "capek", maka gunakan kata-kata yang sama. 
    - **Puitis yang Natural**: Sekalipun customer memilih *writing tone* "Puitis", JANGAN otomatis berubah menggunakan bahasa sastra kuno atau terlalu berat (contoh hindari: "niscaya", "senantiasa", "dikau", "kalbu") KECUALI customer memang menulis dengan gaya seperti itu. Gunakan "Puitis Santai/Modern".
    - Prioritas utama dari setiap surat adalah membuatnya terasa 100% ditulis oleh manusia yang sedang berbicara langsung ke pasangannya.

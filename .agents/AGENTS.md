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
| `timeTitle` | `"Your Journey"` untuk Ultah/individual, `"Our Journey"` untuk Anniversary/LDR/Couples |
| `timeStartDate` | Gunakan tanggal lahir penerima untuk Ultah. Gunakan tanggal mulai hubungan untuk Anniversary/LDR. **Validasi tahun** — jika customer input tahun yang tidak masuk akal (misal 2026 untuk lahir), koreksi sendiri. |
| `metaphorChoice` | Walaupun customer memilih Seasons (4 Musim), Flowers, atau Keepsakes, **tetap gunakan `reasons` (6 buah)**. Jangan pernah menggunakan key `seasons` di `giftData` karena akan menyebabkan error di frontend! |
| `secretCaption` | Selalu berikan caption kontekstual yang manis. Jangan biarkan kosong. |
| `writing tone` | Baca dengan seksama. Lihat tabel tone di bawah. |
| `heroLine1/2` | **Wajib** menyertakan nama panggilan/nama penerima atau unsur romantis yang kuat. Contoh: `heroLine1: "To My Precious,"`, `heroLine2: "Amorcito"`. Jangan hanya template kaku. |
| `gateTitle` | **WAJIB ADA** di `giftData`. Jangan sampai terlewat agar Amplop depan tidak "undefined". |
| `recipient` | **WAJIB ADA** di `giftData` (bukan cuma di draft) untuk `<title>` SEO tab browser. |
| `introText` | **JANGAN** pernah meringkas/memendekkan pesan asli customer! Gunakan seluruh isi pesan customer. Pisahkan per kalimat atau paragraf menjadi **Array of Strings** (contoh: `introText: ["paragraf 1", "paragraf 2"]`) agar rapi di UI. |
| `reasons` | **Wajib** buat persis **6 buah Reason Cards** (bukan 3 atau 4). Gunakan key `desc` BUKAN `text` (contoh: `{ title: "...", desc: "..." }`). Sesuaikan bahasa `title` dengan writing tone (jangan full English jika tone santai Indoglish). Buat `desc` **padat dan ringkas**, jangan terlalu panjang. |
| `closingTitle1/2` | Sesuaikan dengan momen (Ultah → "Happy Birthday", LDR → "See You Soon", dsb) |
| `celebrateBtnText` | Kreatif & sesuai momen: "celebrate ✨", "miss you ✨", "goodbye ✨", dll |

---

## Writing Tone Templates

### Indoglish + Puitis
- Campur Bahasa Indonesia dan English secara natural dalam satu kalimat
- Contoh: *"Bersamamu, aku belajar bahwa being loved sincerely is the most precious feeling in the world."*
- Judul section tetap English jika diminta "Title Full English"

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

> **ATURAN GALLERY QUOTES**: Caption untuk foto (array `words`) HARUS berupa **1 kata pendek per foto** yang jika digabungkan membentuk sebuah kalimat manis. 
> Contoh: `["Happy", "19th", "Birthday", "To", "My", "Precious", "Amorcito", "I", "Love", "You", "Forever"]`.
> JANGAN menggunakan kalimat panjang di dalam satu caption foto.

```javascript
const order = await cfGet(`order:${orderId}`);
const orderPhotos = (order && order.photos) ? order.photos : [];
const photos = [];
for (let i = 0; i < 14; i++) {
  photos.push({
    url: orderPhotos[i] || '', // Use actual URL from KV
    caption: words[i] || ''
  });
}
const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';
```

---

## Common Pitfalls to Avoid

- **Lupa `recipient` dan `gateTitle` di `giftData`**: Akan menyebabkan browser tab title dan amplop depan merender tulisan "undefined".
- **Salah Key pada Reason Cards**: Key untuk teks adalah `desc`, BUKAN `text`. Jika salah, deskripsi akan kosong di UI.
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
- `gateTitle`: Nama si customer sendiri atau "Dear Me"
- `introSignOff`: Ditulis dari perspektif diri sendiri ("Love, Me" atau nama sendiri)
- Section reasons: Ubah judulnya menjadi "The Things I Love About Me" atau sejenisnya

### Customer Bittersweet (Perpisahan, LDR, dll)
- Sesuaikan `celebrateBtnText` dengan momen: "goodbye ✨", "miss you ✨"
- Nada tetap positif dan hangat meski ada nuansa sedih
- Hindari terlalu melodramatik

### Anniversary vs Ultah
- **Anniversary**: `timeTitle` = "Our Journey", hitung dari tanggal mulai hubungan, gunakan anniversary date sebagai `specialDate`
- **Ultah**: `timeTitle` = "Your Journey", hitung dari tanggal lahir

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

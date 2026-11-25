# Maç Haritası

Avrupa'nın 6 ligindeki ve Şampiyonlar Ligi'ndeki maçları harita üzerinde, stadyumların 3D modelleriyle gösteren site.

Veriler [API-Football](https://www.api-football.com) üzerinden GitHub Actions ile her gün otomatik çekilir ve site GitHub Pages'te yayınlanır.

## Kurulum (bir kerelik)

1. **API anahtarını ekle:** Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: `API_FOOTBALL_KEY`
   - Secret: API-Football panelindeki anahtarın (Account → My Access)
2. **Pages'i aç:** Repo → **Settings** → **Pages** → *Build and deployment* → **Source: GitHub Actions**
3. **İlk çalıştırma:** Repo → **Actions** → *Veriyi güncelle ve yayınla* → **Run workflow**

İlk çalıştırma yaklaşık 10–15 dakika sürer. Bittiğinde site `https://oguzhanaydin25.github.io/mac-haritasi/` adresinde yayında olur.

## Nasıl çalışır?

- `scripts/fetch-data.mjs` her lig için takımları, fikstürü, puan durumunu ve gol krallığını çeker (7 lig × 4 istek = 28 istek).
- Kalan günlük kotayla maçların gol ayrıntılarını çeker. Ücretsiz planda günde 100 istek olduğu için bu kısım birkaç haftada tamamlanır.
- Stadyum konumları önce elle hazırlanmış tablodan (`src/data.js`) alınır, orada yoksa OpenStreetMap'ten bulunur.
- Çekilen her şey `data/` klasöründe saklanır. Sonraki çalışmalarda tekrar indirilmez, böylece kota korunur.
- API anahtarı yoksa site örnek (kurgusal) veriyle açılır.

## Ayarlar: `config.json`

| Ayar | Anlamı |
|---|---|
| `season` | Sezonun başladığı yıl. Ücretsiz plan 2022–2024 arasını verir. Güncel sezon için Pro plan gerekir, sonra `2026` yap. |
| `refreshDays` | Fikstür ve puan durumu kaç günde bir yenilensin. Biten sezon için 7 yeterli. Güncel sezonda `0` yap. |
| `eventsPerRun` | Her çalışmada en fazla kaç maçın gol ayrıntısı çekilsin. |
| `reserve` | Kotanın bu kadarı boş bırakılır. |
| `delayMs` | İstekler arası bekleme (ücretsiz planın dakika sınırı için). |

Güncel sezona geçince güncellemeyi daha sık yapmak için `.github/workflows/update.yml` içindeki `cron` satırını değiştir. Örneğin her 30 dakikada bir: `*/30 * * * *`.

## Yerelde çalıştırma

```
npm install
npm run demo        # örnek veri
npm run build       # dist/ klasörüne derler
cd dist && python -m http.server 8000   # http://localhost:8000
```

Gerçek veriyle denemek için (PowerShell): `$env:API_FOOTBALL_KEY="..."; npm run data; npm run build`

## Dosyalar

- `src/main.js` — harita, panel, sekmeler
- `src/stadium3d.js` — 3D stadyum üretici
- `src/data.js`, `src/data_eu.js` — elle hazırlanmış stadyumlar (konum, 3D model parametreleri)
- `src/automodel.js` — tabloda olmayan stadyumlar için otomatik model
- `src/known.js` — API takım adlarını tabloyla eşleştirme
- `src/season.js` — örnek (kurgusal) sezon üretici
- `geo/` — sınır verileri (geoBoundaries, Natural Earth)

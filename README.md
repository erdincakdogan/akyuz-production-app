# Akyüz Üretim — Tersine Kapasite MVP

Expo (React Native / TypeScript) uygulaması: bisküvi üretim hatları için Excel v4 tersine kapasite modeli.

## Ürünler & hatlar

- **Ürünler:** Choco Biss, Choco Buns, Choco Stiks (ayrı parametre setleri)
- **Varsayılanlar:** yalnızca **Choco Buns** (Excel v4 P-01…P-16)
- **Hatlar:** Fırın, Paketleme

## Ekranlar (Türkçe)

| Sekme | İçerik |
|-------|--------|
| **Özet** | Hedef kalıp RPM (H-05), pişme durumu, net kg/saat, ton/vardiya |
| **Parametreler** | P-01…P-16 elle düzenleme (P-03 türetilir) |
| **Hız Kartı** | SNR-01…08 senaryoları; dokunarak P-10/P-13 uygula |
| **Notlar** | Serbest metin, AsyncStorage |

Manuel giriş; backend yok. Formüller Excel v4 özeti ile aynıdır.

## Başlatma

```bash
npm install
npx expo start
```

Ardından Expo Go ile QR kodu tarayın, veya `a` (Android) / `i` (iOS simülatör).

## Doğrulama

```bash
npm run sanity
```

Choco Buns varsayılanları (1B+1D) için hedef RPM ≈ **10,51** olmalıdır.

```bash
npm run typecheck
```

## Kaynak

Excel: `Biskuvi_Uretim_Tersine_Kapasite_Modeli-v4.xlsx` (tersine kapasite / operatör hız kartı).

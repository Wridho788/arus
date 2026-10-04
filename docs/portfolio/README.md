# Portfolio material

- [Case study](CASE_STUDY.md): copy siap digunakan sebagai halaman proyek atau artikel portofolio.
- [Release verification](RELEASE_VERIFICATION.md): bukti pemeriksaan build produksi dan deployment publik.
- [Screenshot manifest](screenshots/manifest.json): ukuran viewport, waktu capture, browser, dan checksum gambar/aset.
- [Deployment asset comparison](deployment-assets.json): perbandingan SHA-256 build lokal dan aset publik.

## Screenshot selection

| File | Penggunaan / caption |
| --- | --- |
| `screenshots/landing-desktop.png` | Landing page: pengantar produk dan jalur menuju demo |
| `screenshots/dashboard-desktop.png` | Gambar utama proyek: ringkasan, grafik kategori, dan progres anggaran |
| `screenshots/transactions-desktop.png` | CRUD dan penyaringan transaksi dalam satu tampilan |
| `screenshots/budgets-desktop.png` | Perencanaan pengeluaran per kategori |
| `screenshots/dashboard-tablet.png` | Adaptasi dashboard pada ukuran tablet |
| `screenshots/landing-phone.png` | Landing page pada ponsel |
| `screenshots/dashboard-phone.png` | Ringkasan bulanan dalam susunan vertikal |
| `screenshots/transactions-phone.png` | Kartu transaksi, filter kategori, serta tombol edit/hapus |
| `screenshots/budgets-phone.png` | Anggaran kategori di ponsel |

Semua gambar adalah screenshot penuh dari build produksi dengan data contoh, tanpa entri pengujian dan tanpa pengeditan gambar. Untuk kartu portofolio, gunakan dashboard desktop sebagai gambar utama dan transaksi ponsel sebagai pendamping. Gambar ponsel dapat ditampilkan pada lebar 360px untuk menjaga keterbacaan.

## Reproduce

From the project root:

```powershell
npm run build
npm run capture:portfolio
```

The capture script starts a local production preview on port 4176, uses isolated browser contexts, waits for fonts, returns the page to its top, and writes the nine PNGs plus a manifest. The example clock is fixed to October 2026 for consistent seed data. No public deployment or personal browser storage is changed.

New captures replace the same filenames. Re-run production verification and visually review the images after UI changes. Public assets may change after the recorded verification date; the asset comparison is point-in-time evidence.

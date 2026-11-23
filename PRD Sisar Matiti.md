# PRD Sisar Matiti

Sistem Informasi Supervisi, Akuntabilitas, dan Realisasi Monitoring Aktivitas Terpadu Insan Teluk Bintuni — BPS Kabupaten Teluk Bintuni

Nov 17, 2026 · @Naufal

## 1. Ringkasan

Sisar Matiti adalah aplikasi web untuk memantau seluruh kegiatan dan pekerjaan di BPS Kabupaten Teluk Bintuni (sekitar 28 pegawai). Aplikasi ini memudahkan Kepala melihat progres, deadline, beban kerja, dan persentase capaian bulanan tiap pegawai. Persentase capaian tersebut menjadi patokan pengisian CKP.

**Masalah saat ini**

- Belum ada web atau dashboard tempat Kepala bisa melihat sejauh mana sebuah pekerjaan sudah berjalan dan kapan deadline-nya.
- Beban kerja tiap pegawai sulit dinilai, karena satu orang bisa terlibat di banyak kegiatan lintas tim.
- Belum ada angka yang objektif dan seragam untuk persentase penyelesaian pekerjaan bulanan sebagai dasar CKP.

## 2. Tujuan, ukuran keberhasilan, dan di luar cakupan

**Tujuan**

1. Kepala dapat melihat semua kegiatan, progres, dan deadline-nya dalam satu dashboard, dengan filter per bulan.
2. Beban kerja tiap pegawai terlihat dari total bobot pekerjaannya.
3. Persentase capaian bulanan tiap pegawai dihitung otomatis dari pekerjaan yang sudah di-approve, sehingga bisa langsung dipakai untuk CKP.

**Ukuran keberhasilan (3 bulan setelah dipakai)**

- 100% kegiatan kantor tercatat di Sisar Matiti.
- Kepala tidak perlu lagi menanyakan progres lewat WhatsApp atau rapat.
- Persentase CKP bisa ditarik langsung dari aplikasi, tanpa hitung manual.
- Jumlah pekerjaan yang terlambat menurun dari bulan ke bulan.

**Di luar cakupan**

- Absensi pegawai.
- Anggaran atau POK.
- Pengganti KipApp. Tidak ada integrasi, dan nilai CKP tetap disalin manual.
- Pemantauan mitra statistik.
- Penilaian kualitas. Target kualitatif hanya berupa keterangan.

## 3. Pengguna dan hak akses

Ada lima peran. Satu orang bisa memegang lebih dari satu peran. Misalnya, seseorang bisa menjadi anggota di tim besar, Ketua di tim kecil, dan PJ di sebuah kegiatan sekaligus.

| Peran | Siapa | Tugas utama |
| --- | --- | --- |
| Kepala | Kepala BPS Kabupaten | Memantau seluruh kegiatan, menetapkan bobot pekerjaan, dan (opsional) memberi approval tambahan atas pekerjaan Ketua Tim |
| Ketua Tim | Ketua tim besar atau tim kecil | Membuat kegiatan dan pekerjaan di timnya sendiri, menunjuk PJ dan pegawai, approve/tolak/unapprove pekerjaan, dan self-approve pekerjaannya sendiri |
| PJ Kegiatan | Ditunjuk Ketua Tim untuk satu kegiatan | Approve atau tolak pekerjaan di kegiatan yang ia pegang |
| Pegawai | Semua pegawai organik | Mengisi progres, menandai pekerjaan selesai, dan melihat kegiatan yang ia ikuti |
| Admin | Tim IPDS | Mengelola akun, tim, keanggotaan tim, ambang capaian, dan data master |

**Matriks hak akses**

| Aksi | Kepala | Ketua Tim | PJ Kegiatan | Pegawai | Admin |
| --- | --- | --- | --- | --- | --- |
| Lihat semua kegiatan kantor | Ya | Tim sendiri + yang diikuti | Yang diikuti | Yang diikuti | Ya |
| Buat atau ubah kegiatan dan pekerjaan | Tidak | Hanya di tim sendiri | Tidak | Tidak | Tidak |
| Tetapkan bobot pekerjaan | Ya | Tidak | Tidak | Tidak | Tidak |
| Isi progres dan tandai selesai | Pekerjaan sendiri | Pekerjaan sendiri | Pekerjaan sendiri | Pekerjaan sendiri | Tidak |
| Approve atau tolak | Pekerjaan Ketua Tim (opsional) | Pekerjaan di tim sendiri | Pekerjaan di kegiatannya | Tidak | Tidak |
| Unapprove | Tidak | Ya | Tidak | Tidak | Tidak |
| Lihat capaian dan beban kerja semua pegawai | Ya | Tidak | Tidak | Hanya diri sendiri | Ya |
| Kelola akun dan tim | Tidak | Tidak | Tidak | Tidak | Ya |

Pegawai tidak dapat melihat kegiatan yang tidak ia ikuti.

## 4. Struktur data

Data disusun bertingkat: Tim → Kegiatan → Sub-kegiatan → Pekerjaan → Penugasan per pegawai. Contohnya: Tim Sosial → Sakernas → Pelatihan Petugas → "Panitia pelatihan" → Budi.

| Entitas | Atribut utama | Aturan |
| --- | --- | --- |
| Tim | Nama, jenis (besar/kecil), tahun, ketua | Pegawai boleh masuk lebih dari satu tim besar maupun tim kecil per tahun (mis. Tim Umum + satu tim fungsi). Struktur tim bisa berubah tiap tahun. |
| Kegiatan | Nama, tim pemilik, PJ Kegiatan, periode mulai–selesai, keterangan | Hanya dibuat oleh Ketua tim pemilik. Contoh: Sakernas, Sensus Ekonomi. |
| Sub-kegiatan | Nama, kegiatan induk, periode | Contoh: Pelatihan Inda, Pelatihan Petugas, Pencacahan. |
| Pekerjaan | Nama, sub-kegiatan, peran (panitia/peserta/PML/PCL/dll.), target kuantitatif + satuan, target kualitatif (keterangan), deadline, bobot | Bobot (skala 1–10) ditetapkan Kepala. Pekerjaan yang belum diberi bobot tetap bisa ditugaskan dan dikerjakan, tetapi bertanda **Belum berbobot** dan belum dihitung ke beban kerja. Pekerjaan bisa diberikan ke pegawai dari tim mana pun. |
| Penugasan | Pekerjaan, pegawai, target per bulan, realisasi per bulan, status, catatan | Satu baris per pegawai. Pekerjaan lintas bulan dipecah menjadi target per bulan, yang diisi sendiri oleh Ketua Tim (misalnya 100 dokumen: Okt 60, Nov 40). |
| Riwayat | Penugasan, aksi, oleh siapa, waktu, alasan | Mencatat setiap perubahan progres, pengajuan, approve, tolak, unapprove, dan self-approve. |

Pekerjaan dibuat **per pegawai** (penugasan). Dengan begitu progres, status, dan approval bisa berbeda untuk setiap orang, walaupun nama pekerjaannya sama.

## 5. Alur status dan approval

Progres pegawai baru sah dan masuk ke perhitungan capaian setelah di-approve oleh Ketua Tim pemilik kegiatan atau PJ Kegiatan.

&#91;embedded content: alur status pekerjaan pegawai · approve, tolak, unapprove\]

**Aturan**

- **Pegawai** mengisi realisasi, lalu mengajukan pekerjaan sebagai selesai. Selama belum di-approve, progres belum sah.
- **Ditolak:** Ketua Tim atau PJ wajib menulis alasan. Status kembali ke Dikerjakan, dan alasan penolakan terlihat oleh pegawai.
- **Unapprove:** hanya Ketua Tim yang bisa, dan wajib disertai alasan. Status kembali ke Dikerjakan.
- **Lintas tim:** yang meng-approve adalah Ketua Tim pemilik kegiatan atau PJ Kegiatan, bukan ketua tim asal pegawai. Contohnya, orang IPDS yang menjadi PML Sakernas di-approve oleh Ketua Tim Sosial atau PJ Sakernas.
- **Pekerjaan Ketua Tim:** Ketua Tim melakukan self-approve dan progresnya langsung sah, tetapi diberi tanda **Self-approved**. Kepala bisa memberi approval tambahan. Tandanya lalu berubah menjadi **Diverifikasi Kepala**.
- **Terlambat:** pekerjaan yang disetujui setelah deadline, atau yang belum selesai saat deadline lewat, diberi label Terlambat. Labelnya hanya penanda dan tidak mengurangi nilai.
- Semua aksi tercatat di riwayat.

## 6. Rumus capaian dan beban kerja

Capaian bulanan pegawai adalah rata-rata progres semua penugasannya di bulan itu. Setiap pekerjaan bernilai sama. Bobot tidak dipakai di rumus capaian, karena bobot sifatnya subjektif dari Kepala.

**Progres satu penugasan di bulan m**

```latex
\text{Progres}_{i,m} = \min\left(\frac{\text{Realisasi disetujui}_{i,m}}{\text{Target}_{i,m}},\ 1\right) \times 100\%
```

**Capaian pegawai di bulan m** (n = jumlah penugasan yang punya target di bulan m)

```latex
\text{Capaian}_{m} = \frac{1}{n}\sum_{i=1}^{n} \text{Progres}_{i,m}
```

**Beban kerja pegawai di bulan m**

```latex
\text{Beban}_{m} = \sum_{i=1}^{n} \text{Bobot}_{i}
```

**Aturan**

- Yang dihitung hanya realisasi yang **sudah di-approve**. Realisasi yang masih menunggu approval atau ditolak tidak ikut dihitung.
- Progres boleh dilaporkan sebagian. Contohnya, target 50 dokumen dengan realisasi 30 dihitung 60%. Pekerjaan tanpa target angka (misalnya panitia) memakai target 1 kegiatan, sehingga progresnya 0% atau 100%.
- Realisasi melebihi target tetap dihitung maksimal 100%. Beban kerja hanya menjumlahkan pekerjaan yang sudah diberi bobot.
- Pekerjaan yang selesai lewat deadline tetap dihitung penuh, tetapi diberi tanda **Terlambat**.
- Pekerjaan lintas bulan dihitung di setiap bulan sesuai target per bulannya.
- Pegawai dengan capaian di bawah ambang (default **90%**, bisa diubah Admin) masuk ke daftar perhatian di dashboard Kepala.
- Batas input dan approval untuk bulan m adalah tanggal 5 bulan berikutnya. Setelah tanggal itu capaian bulan m dikunci. Progres untuk bulan yang sudah dikunci tetap boleh diajukan dan dicatat, tetapi tidak lagi mengubah capaian CKP bulan tersebut.

## 7. Kebutuhan fungsional per halaman

Prioritas: **P0** = wajib ada di MVP, **P1** = fase berikutnya.

### 7.1 Dashboard Kepala

| Fitur | Isi | Prioritas |
| --- | --- | --- |
| Ringkasan bulan | Filter bulan dan tahun. Menampilkan jumlah kegiatan aktif, serta jumlah pekerjaan selesai, berjalan, menunggu approval, dan terlambat | P0 |
| Daftar kegiatan setahun | Semua kegiatan dalam tahun berjalan beserta tim, PJ, periode, dan % progres. Bisa diklik untuk melihat detail | P0 |
| Pegawai di bawah ambang | Daftar pegawai dengan capaian bulan terpilih di bawah 90%, beserta capaian dan jumlah pekerjaannya | P0 |
| Peta beban kerja | Total bobot per pegawai di bulan terpilih, diurutkan dari yang tertinggi | P0 |
| Deadline 7 hari ke depan | Pekerjaan yang belum selesai dan deadline-nya ≤ 7 hari, beserta pegawai dan timnya | P0 |
| Penetapan bobot | Kepala mengisi atau mengubah bobot (skala 1–10). Pekerjaan yang belum berbobot ditandai dan dikumpulkan dalam satu daftar | P0 |
| Progres per tim, timeline/Gantt, tren bulanan | Grafik dan visual tambahan | P1 |
| Ekspor Excel/PDF | Rekap capaian per pegawai per bulan | P1 |

### 7.2 Detail kegiatan

- Header: nama kegiatan, tim, PJ, periode, keterangan, dan % progres. **P0**
- Daftar sub-kegiatan. Setiap sub-kegiatan memuat pekerjaan dan orang-orang yang ditugaskan beserta perannya (panitia, peserta, dll.), target kuantitatif, target kualitatif, deadline, bobot, progres, dan status. **P0**
- Riwayat perubahan dan approval. **P0**

### 7.3 Kelola kegiatan (Ketua Tim)

- Buat, ubah, dan hapus kegiatan, sub-kegiatan, dan pekerjaan, hanya di tim sendiri. Menghapus pekerjaan yang sudah di-approve dilakukan sebagai soft delete (dinonaktifkan), sehingga riwayat CKP tetap utuh. **P0**
- Tugaskan pegawai dari tim mana pun beserta perannya, dan isi target per bulan. **P0**
- Tunjuk PJ Kegiatan. **P0**
- Duplikasi kegiatan dari tahun atau bulan sebelumnya. **P1**

### 7.4 Antrean approval (Ketua Tim, PJ Kegiatan, Kepala)

- Daftar pengajuan selesai yang menunggu keputusan. **P0**
- Tombol Approve, serta Tolak dengan alasan wajib. **P0**
- Unapprove dengan alasan (khusus Ketua Tim). **P0**
- Kepala melihat daftar pekerjaan yang di-self-approve Ketua Tim dan bisa memberi approval tambahan. **P0**

### 7.5 Pekerjaan Saya (Pegawai)

- Daftar penugasan sendiri, dengan filter bulan dan status. **P0**
- Isi realisasi, atau centang selesai untuk pekerjaan tanpa target angka, lalu ajukan. Tidak wajib mengunggah bukti. Tersedia kolom catatan opsional, misalnya untuk link. **P0**
- Melihat alasan penolakan. **P0**
- Kartu capaian bulan ini dan total bobot sendiri. **P0**

### 7.6 Kegiatan yang Saya Ikuti

- Hanya kegiatan tempat pegawai punya penugasan. Pegawai bisa melihat detail kegiatan itu termasuk rekan yang terlibat, tanpa capaian pribadi mereka. **P0**

### 7.7 Admin

- Kelola akun pegawai (buat, nonaktifkan, reset password). **P0**
- Kelola tim per tahun, ketua tim, dan anggota. **P0**
- Atur ambang capaian (default 90%). **P0**
- Kelola daftar peran pekerjaan dan satuan target. **P1**

## 8. Notifikasi

Notifikasi hanya muncul di dalam aplikasi: ikon lonceng dengan angka jumlah notifikasi yang belum dibaca. Setelah login, pengguna langsung melihat ringkasan, misalnya "3 pekerjaan deadline minggu ini, 1 ditolak". Notifikasi lewat email dipertimbangkan di P1, sedangkan WhatsApp tidak dipakai.

| Pemicu | Penerima |
| --- | --- |
| Ditugaskan ke pekerjaan baru | Pegawai |
| Pekerjaan ditolak (beserta alasan) atau di-unapprove | Pegawai |
| Deadline tinggal H-3 dan pekerjaan belum selesai | Pegawai |
| Ada pengajuan selesai yang menunggu approval | Ketua Tim dan PJ Kegiatan |
| Pekerjaan lewat deadline | Kepala, Ketua Tim |
| Ada pekerjaan baru yang belum diberi bobot | Kepala |

## 9. Kebutuhan non-fungsional dan teknis

| Aspek | Kebutuhan |
| --- | --- |
| Platform | Aplikasi web responsif yang nyaman dipakai di laptop dan HP. Tidak ada aplikasi native. |
| Koneksi | Wajib online. Tidak ada mode offline. Halaman harus tetap ringan untuk koneksi lambat di Teluk Bintuni. |
| Teknologi | Next.js dan PostgreSQL, dikembangkan oleh satu orang (Admin IPDS). |
| Hosting | Server BPS. Mengikuti ketentuan keamanan dan deploy yang berlaku. |
| Login | Akun lokal (username dan password) yang dibuat Admin. Password disimpan dalam bentuk hash. SSO BPS menyusul (P1). |
| Skala | Sekitar 28 pengguna aktif. Pengguna bisa dinonaktifkan, tetapi datanya tidak dihapus. |
| Integrasi | Tidak ada di MVP. Nilai capaian disalin manual ke KipApp. |
| Jejak audit | Setiap perubahan status, approve, tolak, unapprove, dan self-approve tercatat: siapa, kapan, dan alasannya. |
| Data awal | Mulai dari nol. Kegiatan yang sedang berjalan tidak dimigrasikan. |

## 10. Tahapan rilis dan pertanyaan terbuka

Rilis dilakukan dalam tiga tahap. Tanggal setiap tahap ditentukan oleh pengembang.

1. **Tahap 1, fondasi:** login, Admin (akun, tim, ambang), serta kelola kegiatan, sub-kegiatan, pekerjaan, dan penugasan oleh Ketua Tim.
2. **Tahap 2, alur kerja:** Pekerjaan Saya, pengisian progres, approval/tolak/unapprove/self-approve, riwayat, dan notifikasi di aplikasi.
3. **Tahap 3, dashboard Kepala:** ringkasan bulan, daftar kegiatan setahun, penetapan bobot, peta beban kerja, pegawai di bawah ambang, dan deadline 7 hari. Setelah tahap ini, MVP siap dipakai untuk satu bulan CKP penuh.

P1 sesudah MVP: progres per tim, timeline/Gantt, tren bulanan, ekspor Excel/PDF, notifikasi email, SSO BPS, dan duplikasi kegiatan.

**Keputusan atas pertanyaan terbuka (17 Nov 2026)**

- **Penguncian bulan:** capaian bulan m dikunci tanggal 5 bulan berikutnya, karena batas input juga tanggal 5.
- **Progres bulan lalu:** tetap boleh diajukan, tetapi tidak memengaruhi CKP bulan yang sudah dikunci.
- **Skala bobot:** 1–10 untuk sementara.
- **Belum berbobot:** pekerjaan tetap bisa ditugaskan dan dikerjakan, diberi tanda, dan belum dihitung ke beban kerja sampai Kepala memberi bobot.
- **Hapus pekerjaan yang sudah di-approve:** soft delete.

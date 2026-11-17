# Deploy Sisar Matiti di Server BPS

Panduan untuk Admin IPDS. Aplikasi berjalan sebagai dua container (PostgreSQL + Next.js) di belakang reverse proxy HTTPS.

## 1. Prasyarat

- Server Linux dengan Docker Engine + Docker Compose plugin.
- Domain/subdomain internal dan sertifikat HTTPS (mengikuti ketentuan keamanan BPS).
- Nginx (atau reverse proxy lain yang disetujui) di depan aplikasi.

## 2. Instalasi pertama

```bash
git clone <repo> /opt/sisar-matiti && cd /opt/sisar-matiti
cp .env.example .env.production
# Edit .env.production: POSTGRES_PASSWORD dan CRON_SECRET wajib diganti (string acak panjang)
openssl rand -base64 32   # contoh membuat CRON_SECRET

docker compose --env-file .env.production up -d --build db app
docker compose --env-file .env.production run --rm migrate
docker compose --env-file .env.production run --rm migrate \
  npm run admin:buat -- admin "Nama Admin IPDS" "PasswordAwalKuat123"
```

Login sebagai admin, lalu:
1. **Admin → Pegawai**: buat akun ±28 pegawai (password awal; pegawai diminta menggantinya). Tandai akun Kepala.
2. **Admin → Tim**: buat tim besar & tim kecil tahun berjalan, tunjuk ketua, isi anggota.
3. **Admin → Pengaturan**: periksa ambang capaian (default 90%).
4. Ketua Tim mulai membuat kegiatan dari menu **Kelola Kegiatan**.

> PRD: data awal mulai dari nol. **Jangan** menjalankan `npm run db:seed` di produksi (itu data contoh).

## 3. Reverse proxy (nginx)

```nginx
server {
  listen 443 ssl http2;
  server_name sisar.bps-bintuni.example;   # sesuaikan
  ssl_certificate     /etc/ssl/...;
  ssl_certificate_key /etc/ssl/...;

  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml;
  client_max_body_size 2m;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Cookie sesi memakai flag `Secure` di produksi, jadi aplikasi **harus** diakses lewat HTTPS. Bila sementara hanya tersedia HTTP di jaringan internal, isi `COOKIE_INSECURE=1` (tidak disarankan).

## 4. Job harian (penguncian bulan & notifikasi deadline)

Job ini:
- mengunci capaian bulan *m* setelah tanggal 5 bulan berikutnya (WIT) dan menyimpan snapshot CKP;
- mengirim notifikasi H-3 deadline (pegawai) dan lewat deadline (Kepala & Ketua Tim).

Aplikasi juga menjalankannya otomatis maksimal sekali sehari saat ada yang membuka aplikasi, tetapi sebaiknya tetap dijadwalkan lewat cron server:

```cron
# /etc/cron.d/sisar-matiti — setiap hari 00:15 WIT
15 0 * * * root curl -fsS -X POST -H "Authorization: Bearer <CRON_SECRET>" https://sisar.bps-bintuni.example/api/cron/harian > /dev/null
```

## 5. Backup database

```cron
# Backup harian 01:00, simpan 30 hari
0 1 * * * root cd /opt/sisar-matiti && docker compose --env-file .env.production exec -T db pg_dump -U sisar sisar_matiti | gzip > /var/backups/sisar/sisar-$(date +\%F).sql.gz && find /var/backups/sisar -name '*.sql.gz' -mtime +30 -delete
```

Restore: `gunzip -c file.sql.gz | docker compose --env-file .env.production exec -T db psql -U sisar sisar_matiti`

## 6. Update versi aplikasi

```bash
cd /opt/sisar-matiti && git pull
docker compose --env-file .env.production up -d --build app
docker compose --env-file .env.production run --rm --build migrate
```

## 7. Tanpa Docker (opsional)

Node.js 24 + PostgreSQL 15+:

```bash
npm ci && npm run build
DATABASE_URL=... npm run db:migrate
DATABASE_URL=... npm run admin:buat -- admin "Nama" "Password123"
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
DATABASE_URL=... CRON_SECRET=... TZ=Asia/Jayapura node .next/standalone/server.js   # jalankan via systemd/pm2
```

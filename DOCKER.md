# Hướng dẫn Docker cho Backend (Laravel + MySQL)

Tài liệu này giải thích cách backend **Laravel** và **MySQL** được chạy bằng Docker trong dự án `6T-php-tripmate`, cách dùng hằng ngày và cách xử lý lỗi thường gặp.

> Frontend Angular **không** chạy trong Docker — chạy trực tiếp trên máy bằng `yarn start` (xem `README.md`).

---

## 1. Tổng quan

```
┌──────────────────────── Máy của bạn ────────────────────────┐
│                                                              │
│  Trình duyệt ──► localhost:4200  (Angular, yarn start)       │
│                       │                                      │
│                       ▼                                      │
│               localhost:8000 ─────┐                          │
│  DBeaver /           │            │   Docker                 │
│  TablePlus ──► localhost:3307     │   ┌───────────────────┐  │
│                       │           └──►│ backend :8000     │  │
│                       │               │ (PHP 8.4/Laravel) │  │
│                       │               └────────┬──────────┘  │
│                       │                        │ mysql:3306  │
│                       │               ┌────────▼──────────┐  │
│                       └──────────────►│ mysql :3306       │  │
│                                       │ (MySQL 8.4)       │  │
│                                       └───────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

| Service   | Image / Build        | Cổng trên máy → container | Vai trò |
|-----------|----------------------|---------------------------|---------|
| `mysql`   | `mysql:8.4`          | `3307` → `3306`           | Cơ sở dữ liệu |
| `backend` | build từ `backend/Dockerfile` | `8000` → `8000`  | Laravel (`php artisan serve`) |

Các file liên quan:

```
6T-php-tripmate/
├── docker-compose.yml     # khai báo 2 service mysql + backend
└── backend/
    ├── Dockerfile         # cách đóng gói môi trường PHP
    ├── .dockerignore      # file không gửi vào lúc build image
    ├── .env               # cấu hình Laravel (không commit)
    └── .env.example       # mẫu cấu hình
```

---

## 2. Yêu cầu

- **Docker Desktop** (đã bật, biểu tượng cá voi đứng yên).
- Không cần cài PHP, Composer hay MySQL trên máy — tất cả nằm trong container.

Kiểm tra:

```bash
docker --version
docker compose version
```

---

## 3. Chạy lần đầu

```bash
cd 6T-php-tripmate

# Tạo file cấu hình Laravel nếu chưa có
cp backend/.env.example backend/.env

# Build image + khởi động
docker compose up -d --build

# Tạo APP_KEY (chỉ cần 1 lần, nếu .env chưa có APP_KEY)
docker compose exec backend php artisan key:generate
```

Lần đầu mất vài phút (tải image, cài thư viện Composer). Khi xong:

- Kiểm tra backend: <http://localhost:8000/up> → trả về trang "Application up".
- Xem log: `docker compose logs -f backend`

Khi container `backend` khởi động, nó **tự động** chạy theo thứ tự:

1. `composer install` — cài thư viện PHP vào `backend/vendor` (nếu thiếu).
2. `php artisan migrate --seed --force` — tạo/cập nhật bảng và nạp dữ liệu mẫu.
3. `php artisan serve --host=0.0.0.0 --port=8000` — chạy server.

> Seeder được viết để chạy lại nhiều lần không bị trùng dữ liệu (dùng `upsert` / `firstOrCreate`).

---

## 4. Giải thích cấu hình

### 4.1. `backend/Dockerfile`

```dockerfile
FROM php:8.4-cli
```
Image PHP 8.4 chính thức, bản dòng lệnh (CLI) — đủ để chạy `php artisan serve` khi phát triển.

```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libzip-dev \
    && docker-php-ext-install pdo_mysql zip bcmath \
    && rm -rf /var/lib/apt/lists/*
```
- `git`, `unzip`: Composer cần để tải và giải nén package.
- `pdo_mysql`: extension để Laravel kết nối MySQL (**bắt buộc**).
- `zip`, `bcmath`: extension hay dùng (giải nén, tính toán số thập phân chính xác — hữu ích cho tiền tệ).
- `rm -rf /var/lib/apt/lists/*`: dọn cache để image nhỏ hơn.

```dockerfile
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
```
Lấy sẵn file `composer` từ image Composer chính thức, không cần cài tay.

```dockerfile
WORKDIR /var/www/html
EXPOSE 8000
CMD ["sh", "-c", "composer install --no-interaction && php artisan migrate --seed --force && php artisan serve --host=0.0.0.0 --port=8000"]
```
- Thư mục làm việc trong container là `/var/www/html` — chính là thư mục `backend/` trên máy (được mount ở `docker-compose.yml`).
- `--host=0.0.0.0` để truy cập được từ ngoài container (mặc định `127.0.0.1` chỉ truy cập được bên trong).
- `--force` để `migrate` không hỏi xác nhận.

### 4.2. `docker-compose.yml`

**Service `mysql`:**

```yaml
mysql:
  image: mysql:8.4
  environment:
    MYSQL_ROOT_PASSWORD: root      # mật khẩu tài khoản root
    MYSQL_DATABASE: tripmate       # tự tạo database này lần đầu
    MYSQL_USER: tripmate           # tự tạo user này
    MYSQL_PASSWORD: tripmate
    TZ: UTC                        # múi giờ máy chủ DB
  command: ["--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
  ports:
    - "3307:3306"
  volumes:
    - mysql_data:/var/lib/mysql
  healthcheck: ...
```

- `utf8mb4`: lưu đầy đủ tiếng Việt có dấu và emoji.
- `3307:3306`: trên máy dùng cổng **3307** (tránh đụng MySQL khác đang chạy ở 3306), trong mạng Docker vẫn là 3306.
- `mysql_data`: **volume** lưu dữ liệu. Dừng/xóa container **không** mất dữ liệu; chỉ mất khi chạy `docker compose down -v`.
- `MYSQL_DATABASE` / `MYSQL_USER` chỉ có tác dụng ở **lần khởi tạo đầu tiên** (khi volume còn trống). Đổi sau đó sẽ không có hiệu lực trừ khi xóa volume.
- `healthcheck`: Docker kiểm tra MySQL đã sẵn sàng chưa (`mysqladmin ping`) mỗi 5 giây.

**Service `backend`:**

```yaml
backend:
  build: ./backend
  depends_on:
    mysql:
      condition: service_healthy
  environment:
    DB_CONNECTION: mysql
    DB_HOST: mysql
    DB_PORT: 3306
    DB_DATABASE: tripmate
    DB_USERNAME: tripmate
    DB_PASSWORD: tripmate
  ports:
    - "8000:8000"
  volumes:
    - ./backend:/var/www/html
```

- `depends_on … service_healthy`: chỉ khởi động backend **sau khi** MySQL báo healthy → tránh lỗi "Connection refused" khi migrate.
- `DB_HOST: mysql`: trong mạng Docker, các container gọi nhau bằng **tên service**. Không dùng `127.0.0.1` ở đây.
- `volumes: ./backend:/var/www/html`: mount code từ máy vào container → **sửa code là có hiệu lực ngay**, không cần build lại image.

### 4.3. Biến môi trường: `.env` vs `docker-compose.yml`

Laravel đọc cấu hình từ `backend/.env`, nhưng **biến môi trường thật** (khai báo ở `environment:` trong `docker-compose.yml`) được **ưu tiên** hơn giá trị trong `.env`.

| Chạy ở đâu | `DB_HOST` | `DB_PORT` | Lấy từ |
|------------|-----------|-----------|--------|
| Trong Docker (`docker compose up`) | `mysql` | `3306` | `docker-compose.yml` |
| Trên máy (`php artisan` cài local) | `127.0.0.1` | `3307` | `backend/.env` |

Vì vậy `backend/.env` để `DB_HOST=127.0.0.1`, `DB_PORT=3307` vẫn đúng cho cả hai cách chạy.

### 4.4. `backend/.dockerignore`

```
vendor
node_modules
storage/logs/*
.env
```
Những file này không được gửi vào khi build image (giảm dung lượng, không đóng gói file bí mật). Khi chạy, code vẫn được mount qua volume nên Laravel vẫn đọc được `.env`.

---

## 5. Lệnh thường dùng

Chạy tại thư mục `6T-php-tripmate/`:

| Mục đích | Lệnh |
|----------|------|
| Khởi động (nền) | `docker compose up -d` |
| Khởi động + build lại image (sau khi sửa `Dockerfile`) | `docker compose up -d --build` |
| Xem trạng thái | `docker compose ps` |
| Xem log backend (theo dõi liên tục) | `docker compose logs -f backend` |
| Dừng (giữ dữ liệu) | `docker compose down` |
| Dừng **và xóa dữ liệu MySQL** | `docker compose down -v` |
| Khởi động lại backend | `docker compose restart backend` |
| Mở shell trong container backend | `docker compose exec backend bash` |

**Lệnh Laravel (chạy trong container):**

```bash
docker compose exec backend php artisan migrate                 # chạy migration mới
docker compose exec backend php artisan migrate:fresh --seed    # xóa sạch bảng, tạo lại + seed
docker compose exec backend php artisan make:model Trip -m      # tạo model + migration
docker compose exec backend php artisan make:controller Api/TripController --api
docker compose exec backend php artisan route:list
docker compose exec backend php artisan tinker                  # REPL thử code
docker compose exec backend composer require <package>          # thêm thư viện
docker compose exec backend php artisan test                    # chạy test
```

> Mẹo: tạo alias cho gọn, ví dụ `alias art="docker compose exec backend php artisan"` → `art migrate`.

**Truy cập MySQL:**

```bash
# Dòng lệnh trong container
docker compose exec mysql mysql -utripmate -ptripmate tripmate
```

Bằng công cụ đồ họa (DBeaver, TablePlus, MySQL Workbench, DataGrip):

| Trường   | Giá trị |
|----------|---------|
| Host     | `127.0.0.1` |
| Port     | `3307` |
| User     | `tripmate` (hoặc `root`) |
| Password | `tripmate` (hoặc `root`) |
| Database | `tripmate` |

---

## 6. Xử lý lỗi thường gặp

**`additional privileges requested: pass "--allow=fs.read=..."` khi build**
Do đường dẫn thư mục có dấu tiếng Việt (VD: `Học Tập`, `Đồ án`). Cách xử lý:
```bash
BUILDX_BAKE_ENTITLEMENTS_FS=0 docker compose up -d --build
```
hoặc chuyển dự án sang thư mục **không dấu**.

**`port is already allocated` / `address already in use`**
Cổng 8000 hoặc 3307 đang bị chương trình khác dùng. Tìm và tắt chương trình đó:
```bash
lsof -i :8000
```
hoặc đổi cổng bên trái trong `docker-compose.yml`, ví dụ `"8080:8000"`.

**Backend báo `SQLSTATE[HY000] [2002] Connection refused`**
MySQL chưa sẵn sàng hoặc sai `DB_HOST`. Kiểm tra `docker compose ps` (mysql phải `healthy`) và chắc chắn `DB_HOST` trong Docker là `mysql`.

**`SQLSTATE[HY000] [1045] Access denied for user 'tripmate'`**
Đã đổi mật khẩu/user trong `docker-compose.yml` sau khi volume được tạo. Xóa volume để MySQL khởi tạo lại (**mất dữ liệu**):
```bash
docker compose down -v && docker compose up -d
```

**`No application encryption key has been specified`**
Chạy `docker compose exec backend php artisan key:generate`.

**Migration lỗi giữa chừng / muốn làm lại CSDL từ đầu**
```bash
docker compose exec backend php artisan migrate:fresh --seed
```

**Sửa `Dockerfile` mà không thấy thay đổi**
Phải build lại: `docker compose up -d --build`.

**Container backend tự tắt ngay**
Xem nguyên nhân: `docker compose logs backend`.

---

## 7. Chạy song song với dự án Python

Hai dự án dùng cổng khác nhau nên có thể chạy cùng lúc:

| | PHP (dự án này) | Python |
|---|---|---|
| Backend | `8000` | `8001` |
| MySQL   | `3307` | `3308` |
| Frontend| `4200` | `4201` |

Mỗi dự án có `name:` riêng trong `docker-compose.yml` (`tripmate-php` / `tripmate-python`) nên container và volume không đụng nhau.

---

## 8. Lưu ý

- Cấu hình này dành cho **môi trường phát triển** (`php artisan serve`, mật khẩu đơn giản). Khi triển khai thật cần dùng PHP-FPM + Nginx, mật khẩu mạnh và không mở cổng MySQL ra ngoài.
- Không commit file `backend/.env`.

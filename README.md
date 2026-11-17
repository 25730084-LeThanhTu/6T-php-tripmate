# 6T-php-tripmate
Ứng dụng quản lý chuyến đi — **Laravel 13 + MySQL 8.4 + Angular 22**

## Cấu trúc

```
6T-php-tripmate/
├── docker-compose.yml   # MySQL + backend Laravel
├── backend/             # Laravel (PHP 8.4)
│   ├── app/Models/
│   ├── database/migrations/   # 18 bảng theo tài liệu thiết kế CSDL
│   └── database/seeders/      # danh mục chi tiêu mặc định + user test
└── frontend/            # Angular
    └── src/
        ├── app/core/      # services, models dùng chung
        ├── app/shared/    # component dùng chung
        ├── app/features/  # các module chức năng
        └── environments/  # apiUrl
```

## Cổng

| Dịch vụ  | Địa chỉ                 |
|----------|-------------------------|
| Frontend | http://localhost:4200   |
| Backend  | http://localhost:8000   |
| MySQL    | localhost:**3307** (user/pass: `tripmate` / `tripmate`, DB: `tripmate`) |

## Chạy dự án

Yêu cầu: Docker Desktop, Node.js 22+.

```bash
# 1. Backend + MySQL (tự chạy composer install, migrate, seed)
docker compose up -d --build

# 2. Frontend
cd frontend
npm install
npm start
```

Kiểm tra backend: http://localhost:8000/up

> **Lỗi `additional privileges requested: --allow=fs.read=...` khi build:**
> do đường dẫn thư mục có dấu tiếng Việt. Build bằng lệnh:
> `BUILDX_BAKE_ENTITLEMENTS_FS=0 docker compose up -d --build`
> (hoặc chuyển dự án sang thư mục không dấu).

## Lệnh thường dùng

```bash
docker compose exec backend php artisan migrate:fresh --seed   # tạo lại CSDL
docker compose exec backend php artisan make:model Trip         # tạo model
docker compose logs -f backend                                  # xem log
docker compose down                                             # dừng
```

## Ghi chú chuyển đổi PostgreSQL → MySQL

- `UUID` → `CHAR(36)` (model dùng trait `HasUuids`)
- `TIMESTAMPTZ` → `TIMESTAMP` (lưu UTC), `JSONB` → `JSON`
- Partial index `notifications(user_id) WHERE is_read = FALSE` → index ghép `(user_id, is_read)`
- Bảng `users` bổ sung `password`, `remember_token` phục vụ đăng nhập

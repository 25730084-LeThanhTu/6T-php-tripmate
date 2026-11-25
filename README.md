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

Yêu cầu: Docker Desktop, Node.js 22+, Yarn 1.x (`npm i -g yarn` hoặc `corepack enable`).

```bash
# 1. Backend + MySQL (tự chạy composer install, migrate, seed)
docker compose up -d --build

# 2. Frontend (Angular build bằng Rspack)
cd frontend
yarn install
yarn start        # dev server: http://localhost:4200
```

### Lệnh frontend

| Lệnh          | Chức năng |
|---------------|-----------|
| `yarn start`  | `rspack serve` – dev server (cấu hình development, dùng `environment.development.ts`) |
| `yarn build`  | `rspack build` – build production ra `frontend/dist/frontend` |
| `yarn watch`  | build development và tự build lại khi sửa code |
| `yarn test`   | chạy unit test (Angular CLI + Vitest) |
| `yarn ng generate component features/trips/trip-list` | tạo component bằng Angular CLI |

Cấu hình Rspack nằm ở `frontend/rspack.config.mts` (dùng `@nx/angular-rspack`).

## Thiết kế (Figma) & giao diện (Tailwind CSS)

- File thiết kế: [TripMate-Design](https://www.figma.com/design/kCwlsGlyGh5DhiN0Zwnpr3/TripMate-Design) — 25 màn, mỗi màn có bản mobile (390px) và desktop (1440px).
- `frontend/src/app/core/figma/figma-screens.ts`: danh sách 25 màn ↔ route ↔ node Figma. Route được sinh từ danh sách này; màn chưa dựng hiển thị trang tạm có link mở đúng frame Figma.
- Style dùng **Tailwind CSS v4** (`frontend/src/styles.css`). Token lấy từ Figma khai báo trong `@theme`:
  - Màu: `primary`, `primary-soft`, `primary-tint`, `canvas`, `surface`, `ink`, `muted`, `line`, `accent` → `bg-primary`, `text-muted`, `border-line`…
  - Bo góc: `rounded-card` (20), `rounded-media` (18), `rounded-button` (15), `rounded-input` (13), `rounded-panel` (12), `rounded-item` (10)
  - Font: Be Vietnam Pro (`font-sans`)
- Layout: `layout/auth-layout` (đăng nhập/đăng ký) và `layout/app-shell` (sidebar + thanh công cụ trên desktop, header + thanh điều hướng dưới trên mobile, breakpoint `lg` = 1024px).
- Logo, ảnh, icon tải từ Figma nằm ở `frontend/public/images` và `frontend/public/icons`.

Kiểm tra backend: http://localhost:8000/up

📘 Hướng dẫn chi tiết cấu hình Docker cho backend: [DOCKER.md](DOCKER.md)

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

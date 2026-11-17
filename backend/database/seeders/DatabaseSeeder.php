<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Danh mục chi tiêu mặc định (mục 5 tài liệu thiết kế)
        DB::table('expense_categories')->upsert([
            ['name' => 'Ăn uống', 'icon_name' => 'restaurant'],
            ['name' => 'Lưu trú / Khách sạn', 'icon_name' => 'hotel'],
            ['name' => 'Di chuyển / Đi lại', 'icon_name' => 'directions_car'],
            ['name' => 'Vé tham quan', 'icon_name' => 'confirmation_number'],
            ['name' => 'Mua sắm cá nhân', 'icon_name' => 'shopping_bag'],
            ['name' => 'Phát sinh khác', 'icon_name' => 'receipt_long'],
        ], ['name'], ['icon_name']);

        // Tài khoản dùng thử (mật khẩu: password)
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['username' => 'testuser', 'full_name' => 'Test User', 'password' => 'password'],
        );
    }
}

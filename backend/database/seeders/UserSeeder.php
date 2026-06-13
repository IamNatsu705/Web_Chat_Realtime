<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        $users = [
            // ── Admin ─────────────────────────────────────────────────────
            [
                'name'              => 'Admin PTIT',
                'email'             => 'admin@ptit.edu.vn',
                'avatar'            => $this->avatar('Admin PTIT', '4f46e5'),
                'role'              => 'admin',
                'bio'               => 'Quản trị viên hệ thống PTIT Social.',
                'student_id'        => null,
                'department'        => 'Ban quản trị',
                'is_banned'         => false,
                'email_verified_at' => now(),
                'last_seen_at'      => now()->subMinutes(5),
            ],

            // ── 3 Acc Test Chính ──────────────────────────────────────────
            [
                'name'              => 'Nguyễn Văn An',
                'email'             => 'an@ptit.edu.vn',
                'avatar'            => $this->avatar('Nguyen Van An', 'f43f5e'),
                'role'              => 'user',
                'bio'               => 'Sinh viên CNTT yêu thích lập trình web và AI ',
                'student_id'        => 'B21DCCN001',
                'department'        => 'Công nghệ thông tin',
                'is_banned'         => false,
                'email_verified_at' => now(),
                'last_seen_at'      => now()->subMinutes(2),
            ],
            [
                'name'              => 'Trần Thị Bình',
                'email'             => 'binh@ptit.edu.vn',
                'avatar'            => $this->avatar('Tran Thi Binh', '7c3aed'),
                'role'              => 'user',
                'bio'               => 'An toàn thông tin là niềm đam mê ',
                'student_id'        => 'B22DCAT045',
                'department'        => 'An toàn thông tin',
                'is_banned'         => false,
                'email_verified_at' => now(),
                'last_seen_at'      => now()->subMinutes(10),
            ],
            [
                'name'              => 'Lê Minh Cường',
                'email'             => 'cuong@ptit.edu.vn',
                'avatar'            => $this->avatar('Le Minh Cuong', '059669'),
                'role'              => 'user',
                'bio'               => 'Full-stack developer | Open source contributor',
                'student_id'        => 'B21DCCN099',
                'department'        => 'Công nghệ thông tin',
                'is_banned'         => false,
                'email_verified_at' => now(),
                'last_seen_at'      => now()->subHours(1),
            ],

            // ── 5 Acc Phụ — phong phú hoá dữ liệu ──────────────────────
            [
                'name'              => 'Phạm Thanh Duy',
                'email'             => 'duy@ptit.edu.vn',
                'avatar'            => $this->avatar('Pham Thanh Duy', 'ea580c'),
                'role'              => 'user',
                'bio'               => 'Data Science enthusiast | Kaggle competitor',
                'student_id'        => 'B22DCCN018',
                'department'        => 'Công nghệ thông tin',
                'is_banned'         => false,
                'email_verified_at' => now(),
                'last_seen_at'      => now()->subMinutes(30),
            ],
            [
                'name'              => 'Hoàng Thị Mai',
                'email'             => 'mai@ptit.edu.vn',
                'avatar'            => $this->avatar('Hoang Thi Mai', 'ec4899'),
                'role'              => 'user',
                'bio'               => 'UX/UI designer tương lai 🎨 Figma lover',
                'student_id'        => 'B22DCMM012',
                'department'        => 'Đa phương tiện',
                'is_banned'         => false,
                'email_verified_at' => now(),
                'last_seen_at'      => now()->subHours(3),
            ],
            [
                'name'              => 'Vũ Đình Khoa',
                'email'             => 'khoa@ptit.edu.vn',
                'avatar'            => $this->avatar('Vu Dinh Khoa', '0891b2'),
                'role'              => 'user',
                'bio'               => 'DevOps & Cloud ☁️ | AWS Certified',
                'student_id'        => 'B21DCCN042',
                'department'        => 'Công nghệ thông tin',
                'is_banned'         => false,
                'email_verified_at' => now(),
                'last_seen_at'      => now()->subHours(5),
            ],
            [
                'name'              => 'Đỗ Quỳnh Nga',
                'email'             => 'nga@ptit.edu.vn',
                'avatar'            => $this->avatar('Do Quynh Nga', 'd946ef'),
                'role'              => 'user',
                'bio'               => 'Yêu thích tiếng Anh và lập trình 🌍',
                'student_id'        => 'B23DCVT008',
                'department'        => 'Viễn thông',
                'is_banned'         => false,
                'email_verified_at' => now(),
                'last_seen_at'      => now()->subDays(1),
            ],

            // ── 1 Acc Bị Banned — demo quản trị ────────────────────────
            [
                'name'              => 'Ngô Bá Hùng',
                'email'             => 'hung@ptit.edu.vn',
                'avatar'            => $this->avatar('Ngo Ba Hung', '6b7280'),
                'role'              => 'user',
                'bio'               => 'Tài khoản bị khóa',
                'student_id'        => 'B22DCCN077',
                'department'        => 'Công nghệ thông tin',
                'is_banned'         => true,
                'banned_at'         => now()->subDays(3),
                'ban_reason'        => 'Vi phạm quy tắc cộng đồng: đăng nội dung spam nhiều lần.',
                'email_verified_at' => now(),
                'last_seen_at'      => now()->subDays(3),
            ],
        ];

        foreach ($users as $data) {
            User::create(array_merge($data, [
                'password'       => $password,
                'remember_token' => Str::random(10),
            ]));
        }
    }

    private function avatar(string $name, string $bg): string
    {
        return 'https://ui-avatars.com/api/?name=' . urlencode($name)
            . '&background=' . $bg . '&color=ffffff&size=200&bold=true';
    }
}

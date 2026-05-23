<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Tạo 20 users: 1 admin + 3 acc test chính + 15 acc phụ + 1 acc bị ban.
 *
 * 3 acc test chính (password: "password"):
 *   - huong@webchat.vn  (Trần Thị Hương)
 *   - khoa@webchat.vn   (Lê Văn Khoa)
 *   - lan@webchat.vn    (Phạm Thị Lan)
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        $users = [
            // ── Admin ─────────────────────────────────────────────────────
            [
                'name'              => 'Nguyễn Minh Admin',
                'email'             => 'admin@webchat.vn',
                'avatar'            => $this->avatar('Nguyen Minh Admin', '4f46e5'),
                'role'              => 'admin',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(90),
                'last_seen_at'      => now()->subMinutes(5),
            ],

            // ── 3 Acc Test Chính ──────────────────────────────────────────
            [
                'name'              => 'Trần Thị Hương',
                'email'             => 'huong@webchat.vn',
                'avatar'            => $this->avatar('Tran Thi Huong', 'f43f5e'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(60),
                'last_seen_at'      => now()->subMinutes(2),
            ],
            [
                'name'              => 'Lê Văn Khoa',
                'email'             => 'khoa@webchat.vn',
                'avatar'            => $this->avatar('Le Van Khoa', '7c3aed'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(55),
                'last_seen_at'      => now()->subMinutes(10),
            ],
            [
                'name'              => 'Phạm Thị Lan',
                'email'             => 'lan@webchat.vn',
                'avatar'            => $this->avatar('Pham Thi Lan', '059669'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(50),
                'last_seen_at'      => now()->subHours(1),
            ],

            // ── 15 Acc Phụ ────────────────────────────────────────────────
            [
                'name'              => 'Nguyễn Đức Dũng',
                'email'             => 'dung.nguyen@gmail.com',
                'avatar'            => $this->avatar('Nguyen Duc Dung', 'd97706'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(45),
                'last_seen_at'      => now()->subMinutes(30),
            ],
            [
                'name'              => 'Võ Thị Bích Ngọc',
                'email'             => 'ngoc.vo@gmail.com',
                'avatar'            => $this->avatar('Vo Thi Ngoc', 'db2777'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(42),
                'last_seen_at'      => now()->subHours(6),
            ],
            [
                'name'              => 'Đặng Hữu Toàn',
                'email'             => 'toan.dang@gmail.com',
                'avatar'            => $this->avatar('Dang Huu Toan', '0284c7'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(40),
                'last_seen_at'      => now()->subDays(1),
            ],
            [
                'name'              => 'Hoàng Thị Mai',
                'email'             => 'mai.hoang@gmail.com',
                'avatar'            => $this->avatar('Hoang Thi Mai', '7c3aed'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(38),
                'last_seen_at'      => now()->subMinutes(45),
            ],
            [
                'name'              => 'Bùi Quang Minh',
                'email'             => 'minh.bui@gmail.com',
                'avatar'            => $this->avatar('Bui Quang Minh', '1d4ed8'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(35),
                'last_seen_at'      => now()->subHours(2),
            ],
            [
                'name'              => 'Trịnh Thùy Linh',
                'email'             => 'linh.trinh@gmail.com',
                'avatar'            => $this->avatar('Trinh Thuy Linh', 'be185d'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(30),
                'last_seen_at'      => now()->subHours(12),
            ],
            [
                'name'              => 'Đinh Tiến Đạt',
                'email'             => 'dat.dinh@gmail.com',
                'avatar'            => $this->avatar('Dinh Tien Dat', '0f766e'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(28),
                'last_seen_at'      => now()->subDays(2),
            ],
            [
                'name'              => 'Ngô Thị Thu Hà',
                'email'             => 'ha.ngo@gmail.com',
                'avatar'            => $this->avatar('Ngo Thi Ha', 'c2410c'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(25),
                'last_seen_at'      => now()->subHours(4),
            ],
            [
                'name'              => 'Vũ Hoàng Long',
                'email'             => 'long.vu@gmail.com',
                'avatar'            => $this->avatar('Vu Hoang Long', '1e40af'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(22),
                'last_seen_at'      => now()->subMinutes(15),
            ],
            [
                'name'              => 'Lý Thị Kim Ngân',
                'email'             => 'ngan.ly@gmail.com',
                'avatar'            => $this->avatar('Ly Thi Ngan', '065f46'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(20),
                'last_seen_at'      => now()->subHours(8),
            ],
            [
                'name'              => 'Phan Tuấn Anh',
                'email'             => 'anh.phan@gmail.com',
                'avatar'            => $this->avatar('Phan Tuan Anh', '92400e'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(18),
                'last_seen_at'      => now()->subDays(3),
            ],
            [
                'name'              => 'Dương Thị Phương',
                'email'             => 'phuong.duong@gmail.com',
                'avatar'            => $this->avatar('Duong Thi Phuong', '9d174d'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(15),
                'last_seen_at'      => now()->subHours(20),
            ],
            [
                'name'              => 'Trần Quốc Huy',
                'email'             => 'huy.tran@gmail.com',
                'avatar'            => $this->avatar('Tran Quoc Huy', '1e3a8a'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(12),
                'last_seen_at'      => now()->subMinutes(60),
            ],
            [
                'name'              => 'Cao Thị Bảo Châu',
                'email'             => 'chau.cao@gmail.com',
                'avatar'            => $this->avatar('Cao Thi Chau', '6d28d9'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(10),
                'last_seen_at'      => now()->subHours(5),
            ],
            [
                'name'              => 'Hoàng Minh Tú',
                'email'             => 'tu.hoang@gmail.com',
                'avatar'            => $this->avatar('Hoang Minh Tu', '115e59'),
                'role'              => 'user',
                'is_banned'         => false,
                'email_verified_at' => now()->subDays(7),
                'last_seen_at'      => now()->subMinutes(2),
            ],

            // ── Acc bị Ban ────────────────────────────────────────────────
            [
                'name'              => 'Nguyễn Văn Bình',
                'email'             => 'binh.spam@gmail.com',
                'avatar'            => $this->avatar('Nguyen Van Binh', '6b7280'),
                'role'              => 'user',
                'is_banned'         => true,
                'banned_at'         => now()->subDays(5),
                'ban_reason'        => 'Gửi tin nhắn spam quảng cáo liên tục, vi phạm quy tắc cộng đồng',
                'email_verified_at' => now()->subDays(8),
                'last_seen_at'      => now()->subDays(5),
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

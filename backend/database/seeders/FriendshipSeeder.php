<?php

namespace Database\Seeders;

use App\Models\FriendRequest;
use App\Models\User;
use Database\Seeders\Traits\SeederHelper;
use Illuminate\Database\Seeder;

class FriendshipSeeder extends Seeder
{
    use SeederHelper;

    public function run(): void
    {
        $this->loadUsers();

        $admin = $this->user('admin@ptit.edu.vn');
        $an    = $this->user('an@ptit.edu.vn');
        $binh  = $this->user('binh@ptit.edu.vn');
        $cuong = $this->user('cuong@ptit.edu.vn');
        $duy   = $this->user('duy@ptit.edu.vn');
        $mai   = $this->user('mai@ptit.edu.vn');
        $khoa  = $this->user('khoa@ptit.edu.vn');
        $nga   = $this->user('nga@ptit.edu.vn');

        // ── Mạng lưới bạn bè chính — tạo mutual friends cho gợi ý kết bạn ──
        // An kết bạn với: Bình, Cường, Duy, Mai
        $this->befriend($an, $binh);
        $this->befriend($an, $cuong);
        $this->befriend($an, $duy);
        $this->befriend($an, $mai);

        // Bình kết bạn với: Cường, Duy (→ mutual friends với An = Duy)
        $this->befriend($binh, $cuong);
        $this->befriend($binh, $duy);

        // Cường kết bạn với: Khoa (→ Khoa có mutual = Cường với An)
        $this->befriend($cuong, $khoa);

        // Duy kết bạn với: Mai (→ Mai có mutual = Duy, An)
        $this->befriend($duy, $mai);

        // Mai kết bạn với: Nga (→ Nga có mutual = Mai với An)
        $this->befriend($mai, $nga);

        // ── Lời mời kết bạn pending — demo UI lời mời ─────────────────────
        // Khoa gửi lời mời cho An (An sẽ thấy pending request)
        FriendRequest::create([
            'sender_id'   => $khoa->id,
            'receiver_id' => $an->id,
            'status'      => 'pending',
            'created_at'  => now()->subHours(6),
        ]);

        // Nga gửi lời mời cho An
        FriendRequest::create([
            'sender_id'   => $nga->id,
            'receiver_id' => $an->id,
            'status'      => 'pending',
            'created_at'  => now()->subHours(2),
        ]);

        // Bình gửi lời mời cho Admin
        FriendRequest::create([
            'sender_id'   => $binh->id,
            'receiver_id' => $admin->id,
            'status'      => 'pending',
            'created_at'  => now()->subDays(1),
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Models\FriendRequest;
use App\Models\User;
use Database\Seeders\Traits\SeederHelper;
use Illuminate\Database\Seeder;

/**
 * Tạo quan hệ bạn bè, pending requests và rejected requests.
 *
 * Ưu tiên dữ liệu cho 3 acc test:
 *   - Hương: 10 bạn bè, nhận 2 pending
 *   - Khoa:  9 bạn bè, gửi 1 pending
 *   - Lan:   8 bạn bè, nhận 1 pending
 */
class FriendshipSeeder extends Seeder
{
    use SeederHelper;

    public function run(): void
    {
        $this->loadUsers();

        $huong  = $this->user('huong@webchat.vn');
        $khoa   = $this->user('khoa@webchat.vn');
        $lan    = $this->user('lan@webchat.vn');
        $dung   = $this->user('dung.nguyen@gmail.com');
        $ngoc   = $this->user('ngoc.vo@gmail.com');
        $toan   = $this->user('toan.dang@gmail.com');
        $mai    = $this->user('mai.hoang@gmail.com');
        $minh   = $this->user('minh.bui@gmail.com');
        $linh   = $this->user('linh.trinh@gmail.com');
        $dat    = $this->user('dat.dinh@gmail.com');
        $ha     = $this->user('ha.ngo@gmail.com');
        $long   = $this->user('long.vu@gmail.com');
        $ngan   = $this->user('ngan.ly@gmail.com');
        $anh    = $this->user('anh.phan@gmail.com');
        $phuong = $this->user('phuong.duong@gmail.com');
        $huy    = $this->user('huy.tran@gmail.com');
        $chau   = $this->user('chau.cao@gmail.com');
        $tu     = $this->user('tu.hoang@gmail.com');

        /*
        |----------------------------------------------------------------------
        | Bạn bè của Hương (10 người)
        |----------------------------------------------------------------------
        */
        $this->befriend($huong, $khoa);
        $this->befriend($huong, $lan);
        $this->befriend($huong, $dung);
        $this->befriend($huong, $ngoc);
        $this->befriend($huong, $mai);
        $this->befriend($huong, $minh);
        $this->befriend($huong, $linh);
        $this->befriend($huong, $ha);
        $this->befriend($huong, $long);
        $this->befriend($huong, $huy);

        /*
        |----------------------------------------------------------------------
        | Bạn bè của Khoa (thêm 8, đã có Hương)
        |----------------------------------------------------------------------
        */
        $this->befriend($khoa, $lan);
        $this->befriend($khoa, $dung);
        $this->befriend($khoa, $ngoc);
        $this->befriend($khoa, $toan);
        $this->befriend($khoa, $minh);
        $this->befriend($khoa, $dat);
        $this->befriend($khoa, $huy);
        $this->befriend($khoa, $chau);

        /*
        |----------------------------------------------------------------------
        | Bạn bè của Lan (thêm 6, đã có Hương + Khoa)
        |----------------------------------------------------------------------
        */
        $this->befriend($lan, $dung);
        $this->befriend($lan, $ngoc);
        $this->befriend($lan, $toan);
        $this->befriend($lan, $mai);
        $this->befriend($lan, $linh);
        $this->befriend($lan, $dat);

        /*
        |----------------------------------------------------------------------
        | Nhóm đồng nghiệp (Minh, Linh, Đạt, Hà)
        |----------------------------------------------------------------------
        */
        $this->befriend($minh, $linh);
        $this->befriend($minh, $dat);
        $this->befriend($minh, $ha);
        $this->befriend($linh, $dat);
        $this->befriend($linh, $ha);
        $this->befriend($dat, $ha);

        /*
        |----------------------------------------------------------------------
        | Nhóm xóm trọ (Long, Ngân, Toàn, Đạt)
        |----------------------------------------------------------------------
        */
        $this->befriend($long, $ngan);
        $this->befriend($long, $toan);
        $this->befriend($long, $dat);
        $this->befriend($ngan, $toan);

        /*
        |----------------------------------------------------------------------
        | Nhóm bạn bè khác
        |----------------------------------------------------------------------
        */
        $this->befriend($huy, $chau);
        $this->befriend($huy, $tu);
        $this->befriend($chau, $tu);
        $this->befriend($mai, $linh);
        $this->befriend($mai, $huy);
        $this->befriend($ngoc, $mai);
        $this->befriend($toan, $huy);
        $this->befriend($anh, $phuong);
        $this->befriend($anh, $dat);
        $this->befriend($phuong, $chau);
        $this->befriend($ngan, $chau);
        $this->befriend($tu, $dat);

        /*
        |----------------------------------------------------------------------
        | Pending Requests (chưa chấp nhận)
        |----------------------------------------------------------------------
        */
        $pendingRequests = [
            [$ngan, $huong],    // Ngân gửi cho Hương
            [$tu, $huong],      // Tú gửi cho Hương
            [$khoa, $phuong],   // Khoa gửi cho Phương
            [$anh, $lan],       // Anh gửi cho Lan
            [$ngoc, $huy],      // Ngọc gửi cho Huy
            [$phuong, $minh],   // Phương gửi cho Minh
        ];

        foreach ($pendingRequests as [$sender, $receiver]) {
            FriendRequest::create([
                'sender_id'   => $sender->id,
                'receiver_id' => $receiver->id,
                'status'      => 'pending',
                'created_at'  => now()->subHours(rand(1, 48)),
            ]);
        }

        /*
        |----------------------------------------------------------------------
        | Rejected Requests (đã từ chối)
        |----------------------------------------------------------------------
        */
        $spam = $this->user('binh.spam@gmail.com');

        FriendRequest::create([
            'sender_id'   => $spam->id,
            'receiver_id' => $huong->id,
            'status'      => 'rejected',
            'created_at'  => now()->subDays(6),
        ]);
        FriendRequest::create([
            'sender_id'   => $spam->id,
            'receiver_id' => $lan->id,
            'status'      => 'rejected',
            'created_at'  => now()->subDays(6),
        ]);
    }
}

<?php

namespace Database\Seeders;

use Database\Seeders\Traits\SeederHelper;
use Illuminate\Database\Seeder;

/**
 * Tạo DM + Group conversations kèm messages và read receipts.
 * Tập trung dữ liệu cho 3 acc test: Hương, Khoa, Lan.
 */
class ConversationSeeder extends Seeder
{
    use SeederHelper;

    public function run(): void
    {
        $this->loadUsers();

        $huong = $this->user('huong@webchat.vn');
        $khoa  = $this->user('khoa@webchat.vn');
        $lan   = $this->user('lan@webchat.vn');
        $dung  = $this->user('dung.nguyen@gmail.com');
        $ngoc  = $this->user('ngoc.vo@gmail.com');
        $toan  = $this->user('toan.dang@gmail.com');
        $mai   = $this->user('mai.hoang@gmail.com');
        $minh  = $this->user('minh.bui@gmail.com');
        $linh  = $this->user('linh.trinh@gmail.com');
        $dat   = $this->user('dat.dinh@gmail.com');
        $ha    = $this->user('ha.ngo@gmail.com');
        $long  = $this->user('long.vu@gmail.com');
        $ngan  = $this->user('ngan.ly@gmail.com');
        $huy   = $this->user('huy.tran@gmail.com');
        $chau  = $this->user('chau.cao@gmail.com');
        $tu    = $this->user('tu.hoang@gmail.com');

        $this->seedDirectMessages(
            $huong, $khoa, $lan, $dung, $ngoc, $toan,
            $mai, $minh, $linh, $dat, $ha, $long, $ngan, $huy, $chau, $tu
        );

        $this->seedGroups(
            $huong, $khoa, $lan, $dung, $ngoc, $toan,
            $mai, $minh, $linh, $dat, $ha, $long, $ngan, $huy, $chau, $tu
        );
    }

    private function seedDirectMessages($huong, $khoa, $lan, $dung, $ngoc, $toan, $mai, $minh, $linh, $dat, $ha, $long, $ngan, $huy, $chau, $tu): void
    {
        // ── DM: Hương ↔ Khoa ──
        $this->makeDM($huong, $khoa, [
            [$huong, 'Khoa ơi, mai mình có họp nhóm không?'],
            [$khoa,  'Có đó Hương, 9h sáng tại phòng D202 nha'],
            [$huong, 'Ok, mình nhớ rồi. Mang laptop theo không?'],
            [$khoa,  'Mang đi cho chắc, thầy hay yêu cầu demo bất ngờ lắm'],
            [$huong, 'Trời ơi thiệt hả, thôi ok mang theo vậy. Cảm ơn Khoa nha!'],
            [$khoa,  'Không có gì, mai gặp nha Hương!'],
        ]);

        // ── DM: Hương ↔ Lan ──
        $this->makeDM($huong, $lan, [
            [$huong, 'Lan ơi cuối tuần này rảnh không? Mình muốn đi cafe'],
            [$lan,   'Rảnh nè, đi đâu vậy Hương?'],
            [$huong, 'Quán The Dreamer Coffee ở Q1, nghe nói wifi mạnh lắm'],
            [$lan,   'Ok hay quá! Mình mang laptop đi làm việc luôn nha'],
            [$huong, 'Ừ mình cũng tính vậy, 9h sáng thứ 7 nhé'],
            [$lan,   'Oke hẹn gặp Hương!'],
            [$huong, 'À mà nhớ mang sạc nha, laptop mình gần hết pin hoài'],
        ]);

        // ── DM: Hương ↔ Minh ──
        $this->makeDM($huong, $minh, [
            [$huong, 'Anh Minh ơi, em muốn xin anh review CV của em được không ạ?'],
            [$minh,  'Được chứ Hương! Gửi cho anh qua email đi'],
            [$huong, 'Dạ em gửi rồi ạ, cảm ơn anh nhiều'],
            [$minh,  'CV em khá tốt nhưng phần skills cần cụ thể hơn nha'],
            [$huong, 'Dạ em hiểu rồi ạ, em sẽ update lại. Cảm ơn anh!'],
        ]);

        // ── DM: Hương ↔ Mai ──
        $this->makeDM($huong, $mai, [
            [$mai,   'Hương ơi mày tập yoga ở đâu vậy? Da mày đẹp quá'],
            [$huong, 'Tao tập với Adriene trên YouTube thôi, free mà hay lắm'],
            [$mai,   'Thật không? Mày gửi link cho tao với'],
            [$huong, 'Oke tao gửi liền, mày tập 20 phút mỗi sáng là thấy khác'],
            [$mai,   'Cảm ơn mày, bestie thật sự!'],
        ]);

        // ── DM: Hương ↔ Dũng ──
        $this->makeDM($huong, $dung, [
            [$dung,  'Hương ơi bài assignment môn Mạng máy tính làm chưa?'],
            [$huong, 'Làm gần xong rồi, còn phần diagram. Mày sao?'],
            [$dung,  'Tao đang kẹt phần routing, OSPF với BGP lẫn hoài'],
            [$huong, 'OSPF dùng nội bộ, BGP dùng giữa ISP. Tối nay mình làm cùng nhé'],
            [$dung,  'Ok cảm ơn mày, 8h tối mình call video nha!'],
        ]);

        // ── DM: Khoa ↔ Lan ──
        $this->makeDM($khoa, $lan, [
            [$khoa, 'Lan ơi, tao vừa push code mới rồi nha'],
            [$lan,  'Oke tao pull về test liền. Bug hôm qua fix chưa?'],
            [$khoa, 'Fix rồi, mày check branch feature/login-fix nhé'],
            [$lan,  'OK tao thấy rồi, code sạch hơn nhiều! Good job'],
            [$khoa, 'Cảm ơn, cuối tuần merge vào main nhé'],
        ]);

        // ── DM: Khoa ↔ Dũng ──
        $this->makeDM($khoa, $dung, [
            [$khoa, 'Dũng ơi, tao đang code API login bị lỗi 401 hoài'],
            [$dung, 'Mày check Authorization header chưa? Thường quên Bearer prefix'],
            [$khoa, 'Ồ đúng rồi, mày tài vãi! Fix được liền'],
            [$dung, 'Nhớ lần sau coi log response nha, tiết kiệm thời gian hơn'],
            [$khoa, 'Oke cảm ơn mày. Tối nay nhậu không? Rủ thêm Lan và Ngọc'],
            [$dung, 'Đi chứ, 7h nhà hàng Xưa nha'],
        ]);

        // ── DM: Khoa ↔ Đạt ──
        $this->makeDM($khoa, $dat, [
            [$khoa, 'Đạt ơi, portfolio website mới của mày đẹp quá!'],
            [$dat,  'Cảm ơn Khoa! React + TypeScript + Tailwind, stack quen thuộc'],
            [$khoa, 'Animation scroll mượt thật sự, dùng Framer Motion hả?'],
            [$dat,  'Đúng rồi, Framer Motion giúp rất nhiều. Mày cũng thử đi'],
            [$khoa, 'Oke để tao research thêm, cảm ơn nha!'],
        ]);

        // ── DM: Lan ↔ Ngọc ──
        $this->makeDM($lan, $ngoc, [
            [$lan,  'Ngọc ơi, bài assignment môn KTPM mày làm chưa?'],
            [$ngoc, 'Làm rồi nhưng chưa xong phần diagram'],
            [$lan,  'Mình làm cùng nhau đi, mình đang ở thư viện'],
            [$ngoc, 'Ok tao sang liền, 10 phút nữa tao tới nha'],
            [$lan,  'Oke mình giữ chỗ cho mày rồi. Nhớ mang charger nha!'],
            [$ngoc, 'Mang rồi, cảm ơn mày!'],
        ]);

        // ── DM: Lan ↔ Linh ──
        $this->makeDM($lan, $linh, [
            [$lan,  'Linh ơi, mày dùng skincare gì vậy? Da mày đẹp quá'],
            [$linh, 'Tao dùng Anessa sunscreen với CeraVe moisturizer thôi'],
            [$lan,  'Mua ở đâu vậy? Online hay tiệm?'],
            [$linh, 'Shopee đó, hay có voucher 20% lắm. Để tao gửi link'],
            [$lan,  'Ok cảm ơn mày, bestie thật sự!'],
        ]);

        // ── DM: Minh ↔ Linh ──
        $this->makeDM($minh, $linh, [
            [$minh, 'Linh ơi, em đã push code lên chưa? Mình đang chờ review'],
            [$linh, 'Rồi anh ơi, em push lên branch feature/login-fix rồi ạ'],
            [$minh, 'OK để anh xem. À em nhớ viết unit test nha'],
            [$linh, 'Dạ em viết rồi ạ, coverage 85%'],
            [$minh, 'Ngon! Approve rồi, em merge đi nhé'],
            [$linh, 'Cảm ơn anh! Em merge liền ạ'],
        ]);

        // ── DM: Long ↔ Ngân ──
        $this->makeDM($long, $ngan, [
            [$long, 'Ngân ơi hôm nay mưa to quá, em đi làm về chưa?'],
            [$ngan, 'Chưa anh ơi, đang kẹt xe ở Nguyễn Văn Linh'],
            [$long, 'Thôi ráng chịu đi em, về đến nhà nhắn anh nha'],
            [$ngan, 'Dạ anh. Anh ăn cơm chưa? Em mua bánh mì mang về không?'],
            [$long, 'Mua 1 cái cho anh, bánh mì thịt nguội nhé'],
            [$ngan, 'Ok anh, em mua cho!'],
        ]);

        // ── DM: Đạt ↔ Hà ──
        $this->makeDM($dat, $ha, [
            [$dat, 'Hà ơi, deadline dự án là thứ 6 này đúng không?'],
            [$ha,  'Đúng rồi Đạt ơi, 5pm thứ 6. Còn phần báo cáo chưa?'],
            [$dat, 'Còn khoảng 3 trang nữa. Chiều nay hop video call 3h nhé'],
            [$ha,  'Oke mình set Google Meet liền. Thêm Linh và Minh vào nữa nha'],
            [$dat, 'Done, sent link rồi!'],
        ]);

        // ── DM: Huy ↔ Châu ──
        $this->makeDM($huy, $chau, [
            [$huy,  'Châu ơi mình xem phim gì tối nay nhỉ?'],
            [$chau, 'Xem Inside Out 2 chưa? Mình nghe hay lắm'],
            [$huy,  'Chưa xem, chiều CN nhé, 3h CGV Vincom'],
            [$chau, 'Oke confirmed! Mua bắp rang chưa?'],
            [$huy,  'Chưa, em mua ngay đây. Mua thêm nước cam nha'],
        ]);

        // ── DM: Tú ↔ Châu ──
        $this->makeDM($tu, $chau, [
            [$tu,   'Châu ơi đơn hàng ship chưa vậy?'],
            [$chau, 'Tao check rồi, đang ở kho HCM, chiều nay giao thôi'],
            [$tu,   'Oke good, mình đang cần gấp mấy cái đó'],
            [$chau, 'Sao không tự đi mua cho lẹ?'],
            [$tu,   'Online rẻ hơn mà thôi!'],
        ]);

        // ── DM: Mai ↔ Linh ──
        $this->makeDM($mai, $linh, [
            [$mai,  'Linh ơi, cuối tuần này đi chạy bộ cùng mình không?'],
            [$linh, 'Được chứ! Mấy giờ và ở đâu vậy Mai?'],
            [$mai,  '6h sáng công viên Gia Định, chạy 5km nhé'],
            [$linh, 'Oke mình đi, mang thêm bình nước nha'],
        ]);

        // ── DM: Toàn ↔ Châu ──
        $this->makeDM($toan, $chau, [
            [$toan, 'Châu ơi, mày đang dùng laptop gì vậy? Mình xem mua mới'],
            [$chau, 'MacBook Air M2 nè, dùng gần 1 năm rồi, hài lòng lắm'],
            [$toan, 'Pin có trâu không? Mình cần dùng cả ngày'],
            [$chau, 'Khoảng 14-16 tiếng nếu dùng nhẹ, code và browse bình thường'],
            [$toan, 'Ngon vậy! Thôi mua 16GB cho chắc'],
        ]);
    }

    private function seedGroups($huong, $khoa, $lan, $dung, $ngoc, $toan, $mai, $minh, $linh, $dat, $ha, $long, $ngan, $huy, $chau, $tu): void
    {
        // ── Group 1: Dự Án KTPM (Hương + Khoa + Lan đều có) ──
        $this->makeGroup(
            'Nhóm Dự Án KTPM - HK2',
            $this->avatar('KTPM', '3b82f6'),
            $khoa, [$huong, $lan, $dung, $ngoc, $toan],
            [
                [$khoa,  'Chào cả nhóm! Tạo group tiện liên lạc về đồ án nhé'],
                [$huong, 'Hay quá! Vậy ai nhận phần nào rồi?'],
                [$dung,  'Tao nhận phần backend API, Khoa mày làm database design nha'],
                [$lan,   'Mình làm frontend nhé, mình quen React rồi'],
                [$ngoc,  'Mình làm frontend cùng Lan nha, chia nhau component'],
                [$toan,  'Để tao làm phần testing và documentation'],
                [$khoa,  'Perfect! Mọi người dùng GitHub nhé, mình tạo repo rồi'],
                [$huong, 'Gửi link đây Khoa ơi'],
                [$khoa,  'https://github.com/ktpm-nhom5/project - request access nha'],
                [$dung,  'Done, tao đã request rồi'],
                [$lan,   'Mình cũng xong. Deadline first sprint khi nào?'],
                [$khoa,  'Thứ 6 tuần sau, mình họp review nhé'],
            ],
        );

        // ── Group 2: Team Backend VietSoft (Hương là member) ──
        $this->makeGroup(
            'Team Backend - Công ty VietSoft',
            $this->avatar('VS', '16a34a'),
            $minh, [$huong, $linh, $dat, $ha, $huy],
            [
                [$minh,  'Team ơi, server production đang bị slow, ai đang trực?'],
                [$dat,   'Anh Minh ơi em đang online, em check ngay'],
                [$ha,    'Em cũng online, query database hay traffic cao vậy anh?'],
                [$minh,  'Check Datadog đi, tao thấy response time lên 3s rồi'],
                [$dat,   'Found it! Query N+1 ở endpoint /api/orders, đang fix'],
                [$linh,  'Em thêm eager loading vào được không anh?'],
                [$huy,   'Em vừa deploy hotfix lên staging, test thử nhé'],
                [$minh,  'Response time xuống 180ms rồi! Merge lên production đi'],
                [$huong, 'Hú hồn, may mà phát hiện sớm. Team mình giỏi quá!'],
            ],
        );

        // ── Group 3: Hội Yêu Phim (Hương + Khoa + Lan) ──
        $this->makeGroup(
            'Hội Yêu Phim',
            $this->avatar('Film', 'e11d48'),
            $huy, [$huong, $khoa, $lan, $chau, $tu, $mai],
            [
                [$huy,   'Hội phim ơi, tuần này xem gì nào?'],
                [$chau,  'Mình muốn xem Inside Out 2, nghe hay lắm'],
                [$tu,    'Mình xem trailer rồi, khóc từ trailer luôn'],
                [$huong, 'Thế thì xem thôi, chắc chắn hay!'],
                [$lan,   'Khi nào đi? Cuối tuần này được không?'],
                [$khoa,  'Mình bận sáng thứ 7, chiều được không?'],
                [$huy,   'Chiều CN nhé, 3h CGV Vincom'],
                [$mai,   'Mình book vé nhé, ai muốn ghế nào?'],
                [$lan,   'Hàng G giữa nha, tầm nhìn tốt nhất'],
                [$huong, 'G7 đến G13, 7 vé. Mỗi người 95k chuyển khoản Mai nha'],
            ],
        );

        // ── Group 4: Xóm Trọ (Khoa là member) ──
        $this->makeGroup(
            'Xóm Trọ 18B Nguyễn Trãi',
            $this->avatar('Xom Tro', 'f59e0b'),
            $long, [$khoa, $ngan, $toan, $dat],
            [
                [$long, 'Mọi người ơi, tiền điện tháng này ai chưa đóng?'],
                [$ngan, 'Em chưa anh ơi, bao nhiêu vậy?'],
                [$long, '450k/phòng, tháng này xài điều hòa nhiều'],
                [$toan, 'Mình chuyển ngay, STK VPBank 0123456789 đúng không?'],
                [$khoa, 'Mình cũng chuyển rồi anh Long nha'],
                [$dat,  'Anh Long ơi bồn nước tầng 3 bị rỉ nước'],
                [$long, 'Trời ơi, để anh gọi thợ. Thứ 7 sửa hết một lần nhé'],
                [$ngan, 'Cảm ơn anh Long nhé!'],
            ],
        );

        // ── Group 5: Gia Đình Nhỏ (Hương admin) ──
        $this->makeGroup(
            'Gia Đình Nhỏ',
            $this->avatar('Gia Dinh', '8b5cf6'),
            $huong, [$lan, $minh, $chau],
            [
                [$huong, 'Mọi người ăn tối chưa? Nay mình nấu canh chua cá lóc'],
                [$lan,   'Chưa đây chị, thơm chưa?'],
                [$chau,  'Cá lóc! Tuyệt vời, em về liền'],
                [$huong, 'Còn 20 phút nữa xong, mọi người về ăn cơm nha'],
                [$minh,  'Anh mua thêm nước ngọt nha chị'],
                [$huong, 'Mua Sting đỏ nha, tủ lạnh hết rồi'],
                [$chau,  'Em về rồi! Mùi thơm quá trời'],
                [$huong, 'Vào rửa tay ăn cơm nào mọi người!'],
            ],
        );

        // ── Group 6: Book Club (Hương + Khoa) ──
        $this->makeGroup(
            'Book Club Sài Gòn',
            $this->avatar('Book', 'dc2626'),
            $huong, [$khoa, $dung, $chau, $tu, $linh],
            [
                [$huong, 'Chào book lovers! Group chia sẻ sách hay nha'],
                [$dung,  'Mình đang đọc Atomic Habits, hay đó mọi người'],
                [$chau,  'Mình đang đọc Người Giàu Nhất Thành Babylon'],
                [$khoa,  'Deep Work của Cal Newport nha, dân IT nên đọc'],
                [$linh,  'Mình đọc Sapiens, không thể đặt xuống được'],
                [$tu,    'Mình có bản epub share cho mọi người được không?'],
                [$huong, 'Tháng này đọc cùng Sapiens nhé? Thảo luận cuối tháng'],
                [$dung,  'Sapiens hay lắm, đọc lại vẫn oke!'],
            ],
        );

        // ── Group 7: Runners Club (Hương + Lan) ──
        $this->makeGroup(
            'Runners Club HCM',
            $this->avatar('Run', '16a34a'),
            $mai, [$huong, $lan, $huy, $linh, $chau],
            [
                [$mai,   'Group này để cùng nhau lên kế hoạch chạy bộ nha!'],
                [$huy,   'Một mình thiếu motivation, chạy nhóm vui hơn'],
                [$huong, 'Mình mới bắt đầu 2 tuần, còn yếu lắm mọi người ơi'],
                [$mai,   'Không sao, chạy theo pace của mình là được nha'],
                [$lan,   'Chạy sáng hay chiều? Mình prefer sáng sớm'],
                [$chau,  'Sáng 6h được không? Kịp về tắm rồi đi làm'],
                [$linh,  'Công viên Gia Định rộng, track rõ ràng hơn'],
                [$huy,   'Thứ 7 đầu tiên 8h sáng, starter run 3km nhé'],
            ],
        );

        // ── Group 8: Hội Nấu Ăn (Lan admin) ──
        $this->makeGroup(
            'Hội Nấu Ăn Cuối Tuần',
            $this->avatar('Cook', 'ea580c'),
            $lan, [$huong, $ngan, $mai, $ha, $ngoc],
            [
                [$lan,   'Hội chị em! Share công thức và nấu ăn cùng nhau nha'],
                [$mai,   'Hay quá! Cuối tuần mình hay không biết nấu gì'],
                [$ngan,  'Mình mới học cách làm phở bò chuẩn vị'],
                [$ha,    'Phở bò nghe hấp dẫn! Ninh xương bao lâu vậy Ngân?'],
                [$ngan,  'Ít nhất 6 tiếng, bù lại nước dùng ngọt lắm'],
                [$ngoc,  'Mình biết làm bánh flan, ai muốn học không?'],
                [$huong, 'Mình muốn học! Thứ 7 này nhà Lan nhé'],
                [$lan,   'Oke mọi người, thứ 7 tụ họp nha!'],
            ],
        );

        // ── Group 9: Cựu Sinh Viên K18 (Khoa + Hương + Lan) ──
        $this->makeGroup(
            'Cựu Sinh Viên CNTT K18',
            $this->avatar('K18', '2563eb'),
            $khoa, [$huong, $lan, $dung, $ngoc, $toan, $minh],
            [
                [$khoa,  'Chào cả lớp K18! Group liên lạc và tụ họp nha'],
                [$huong, 'Lâu rồi không gặp cả lớp, nhớ quá!'],
                [$lan,   'Ai đang làm ở đâu rồi? Check-in đi mọi người!'],
                [$toan,  'Mình đang Software Engineer tại FPT Software'],
                [$minh,  'Senior Backend tại VietSoft, cần refer việc nhắn anh'],
                [$dung,  'Năm nay tốt nghiệp được 2 năm rồi, thấy già thật'],
                [$ngoc,  'Mình cũng muốn đi họp lớp!'],
                [$khoa,  'Tháng 6 này họp lớp không mọi người?'],
                [$lan,   'Đi chứ!! Nhớ hồi còn đi học quá'],
                [$huong, 'Vote thứ 7 28/6, nhà hàng hay quán nào đó?'],
            ],
        );
    }
}

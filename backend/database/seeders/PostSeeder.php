<?php

namespace Database\Seeders;

use Database\Seeders\Traits\SeederHelper;
use Illuminate\Database\Seeder;

/**
 * Tạo bài viết kèm media, likes, comments và replies.
 * Tập trung cho 3 acc test: Hương (4 bài), Khoa (3 bài), Lan (3 bài).
 */
class PostSeeder extends Seeder
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

        // ── Hương - Bài 1 ──
        $this->makePost($huong,
            "Hôm nay hoàn thành xong môn KTPM cuối cùng rồi 🎓 Cảm giác như trút được gánh nặng! Cảm ơn cả nhóm đã cùng nhau chiến đấu suốt 4 tháng qua. Mình sẽ nhớ mãi những đêm code đến 2h sáng 🖥️",
            ['https://picsum.photos/seed/graduation/800/450'],
            [$khoa, $lan, $dung, $ngoc, $toan, $minh, $huy],
            [
                [$khoa, 'Congratulations Hương!! Cả nhóm ăn mừng thôi', [[$lan, 'Đi ăn buffet đi, tao bao!']]],
                [$minh, 'Chúc mừng em nhé! Cứ tiếp tục phát huy'],
                [$ngoc, '🎉 Ăn mừng thôi!!'],
            ], false, 2);

        // ── Hương - Bài 2 ──
        $this->makePost($huong,
            "Những cuốn sách thay đổi cuộc đời mình 📚\n\n1. \"Nhà Giả Kim\" - Paulo Coelho\n2. \"Đắc Nhân Tâm\" - Dale Carnegie\n3. \"Sapiens\" - Yuval Noah Harari\n4. \"Deep Work\" - Cal Newport\n5. \"The Subtle Art of Not Giving a F*ck\" - Mark Manson\n\nMỗi cuốn đều có bài học riêng. Đọc sách là đầu tư tốt nhất cho bản thân!",
            [],
            [$khoa, $lan, $dung, $minh, $linh, $huy, $chau, $tu, $dat, $toan],
            [
                [$minh, 'Deep Work là cuốn mình recommend cho cả team, cực kỳ thiết thực'],
                [$lan, 'Nhà Giả Kim đọc 3 lần rồi, lần nào cũng rút ra điều mới'],
                [$huy, 'Thêm Thinking Fast and Slow vào list đi Hương!'],
                [$chau, 'Subtle Art relatable lắm!', [[$huong, 'Đúng Châu ơi, thẳng thắn và hài hước!']]],
            ], false, 12);

        // ── Hương - Bài 3 ──
        $this->makePost($huong,
            "Buổi sáng tập yoga đầu tiên sau 3 tháng lười biếng 🧘‍♀️\n\nMệt. Đau. Nhưng thấy dễ chịu lắm sau đó! Cơ thể mình cứng đơ như cây gỗ rồi 😂\n\nAi tập yoga không? Share tips cho mình với nhé!",
            ['https://picsum.photos/seed/yoga/800/450'],
            [$mai, $linh, $ngan, $chau, $lan],
            [
                [$mai, 'Yoga with Adriene trên YouTube, beginner friendly lắm!', [[$huong, 'Cảm ơn Mai! Mình thử xem']]],
                [$chau, 'Tập đi rồi quen, mình tập 6 tháng rồi, da tốt hẳn'],
            ], false, 1);

        // ── Hương - Bài 4 ──
        $this->makePost($huong,
            "Tips phỏng vấn mà mình đúc kết được sau 5 lần fail 😅\n\n1. Chuẩn bị STAR method cho behavioral questions\n2. Đọc kỹ JD và match từng điểm với kinh nghiệm\n3. Hỏi ngược interviewer ít nhất 3 câu\n4. Follow up email trong vòng 24h\n5. Đừng nói xấu công ty cũ!\n\nHy vọng giúp ích cho ai đang tìm việc!",
            [],
            [$khoa, $minh, $dat, $linh, $ha, $huy],
            [
                [$minh, 'STAR method là must-know, mình dùng khi phỏng vấn ứng viên luôn'],
                [$dat, 'Điểm 3 quan trọng lắm, cho thấy mình quan tâm đến vị trí'],
            ], false, 5);

        // ── Khoa - Bài 1 ──
        $this->makePost($khoa,
            "Vừa deploy xong project lên VPS lần đầu tiên 🚀 Mất 3 tiếng debug Nginx nhưng cuối cùng cũng sống rồi. Domain trỏ đúng, SSL xanh lét, database connect thành công!",
            ['https://picsum.photos/seed/server/800/450'],
            [$lan, $dung, $minh, $dat, $huy, $toan, $linh, $huong],
            [
                [$minh, 'Chúc mừng! Lần đầu deploy luôn hồi hộp', [[$khoa, 'Cảm ơn anh Minh!']]],
                [$lan, 'Nginx là nỗi đau của mọi developer lần đầu 😂'],
                [$dung, 'Lần sau dùng Docker đi Khoa, tiện hơn nhiều'],
            ], false, 3);

        // ── Khoa - Bài 2 ──
        $this->makePost($khoa,
            "Review quán cà phê mới: The Dreamer Coffee ☕\n\nĐịa chỉ: 12 Nguyễn Huệ, Q.1\nGiá: 45k-75k\nWifi: 100Mbps\nĐiện: Đủ ổ cắm\nNhạc: Lo-fi, không ồn\n\nOverall: 9/10 - Perfect cho work từ xa!",
            ['https://picsum.photos/seed/cafe1/800/450', 'https://picsum.photos/seed/cafe2/800/450'],
            [$huong, $lan, $ngoc, $dung, $dat, $linh, $minh],
            [
                [$huong, 'Save lại rồi! Cuối tuần mình ghé thử nhé Khoa'],
                [$lan, 'Wifi 100Mbps là must-have cho remote work!'],
                [$ngoc, 'Không gian cây xanh + lo-fi là combo hoàn hảo!', [[$khoa, 'Đúng rồi Ngọc!']]],
            ], false, 11);

        // ── Khoa - Bài 3 ──
        $this->makePost($khoa,
            "Chia sẻ lộ trình học Backend cho người mới 🗺️\n\n📌 Tháng 1-2: PHP/Laravel cơ bản\n📌 Tháng 3-4: Database design + API RESTful\n📌 Tháng 5-6: Authentication, caching, queue\n📌 Tháng 7-8: Docker, CI/CD, deployment\n📌 Tháng 9-12: System design, microservices\n\nQuan trọng nhất: LÀM PROJECT THỰC TẾ!",
            [],
            [$minh, $linh, $dat, $ha, $huong, $toan, $tu],
            [
                [$minh, 'Roadmap chuẩn! Thêm Redis và WebSocket nữa nhé'],
                [$dat, 'Làm project thực tế là cách nhanh nhất để giỏi, đồng ý!'],
            ], false, 7);

        // ── Lan - Bài 1 ──
        $this->makePost($lan,
            "Công thức làm bánh bông lan Nhật (Japanese Cheesecake) 🍰\n\nNguyên liệu:\n• 250g cream cheese\n• 6 trứng gà\n• 60g bơ\n• 100ml sữa tươi\n• 60g bột mì\n• 140g đường\n\nNướng cách thủy 160°C trong 60 phút. Kết quả: Mềm như mây ☁️",
            ['https://picsum.photos/seed/cake1/800/450', 'https://picsum.photos/seed/cake2/800/450'],
            [$huong, $ngoc, $mai, $linh, $ha, $ngan, $chau, $tu],
            [
                [$huong, 'Nhìn là thèm rồi! Lan tài năng thật!', [[$lan, 'Qua nhà tao làm thử cùng đi!']]],
                [$ngoc, 'Mình thử làm mà hay bị xẹp, bí quyết gì vậy Lan?'],
                [$mai, 'Save ngay! Cuối tuần này thử làm'],
            ], false, 4);

        // ── Lan - Bài 2 ──
        $this->makePost($lan,
            "Kết quả sau 30 ngày chạy bộ mỗi sáng 🏃‍♀️\n\nTuần 1: 2km đã thở không ra hơi\nTuần 2: 3km cảm thấy ổn\nTuần 3: 5km trở thành bình thường\nTuần 4: 7km, PB mới!\n\nThay đổi rõ rệt: ngủ ngon hơn, da sáng hơn, năng lượng dồi dào. Bắt đầu từ nhỏ thôi!",
            ['https://picsum.photos/seed/running/800/450'],
            [$huong, $linh, $ngan, $chau, $mai, $ngoc, $ha, $tu],
            [
                [$huong, 'Mình muốn bắt đầu chạy bộ! Mai motivate mình đi'],
                [$linh, '7km sau 1 tháng là tiến bộ cực nhanh! Respect'],
                [$chau, 'Mình cần thử rồi!', [[$lan, 'Quan trọng là consistent nhé Châu!']]],
            ], false, 1);

        // ── Lan - Bài 3 ──
        $this->makePost($lan,
            "Tổng hợp app hữu ích mình đang dùng hàng ngày 📱\n\n• Notion - ghi chú và quản lý task\n• Forest - tập trung học/làm việc\n• Headspace - thiền 10 phút/ngày\n• Duolingo - học tiếng Anh mỗi sáng\n• YNAB - quản lý chi tiêu\n\nMọi người có app hay thì share nhé!",
            [],
            [$tu, $huy, $mai, $huong, $linh, $ngoc, $dat, $ha, $khoa],
            [
                [$tu, 'Notion không thể thiếu nhưng learning curve hơi cao', [[$lan, 'Quen rồi thì không bỏ được!']]],
                [$huy, 'Thêm Obsidian vào đi, note-taking cực ngon'],
                [$khoa, 'Duolingo streak mình 234 ngày rồi, không dám bỏ 😂'],
            ], false, 8);

        // ── Bài viết của acc phụ ──
        $this->makePost($minh,
            "Sau 2 năm tự học, hôm nay chính thức được promote lên Senior Backend Engineer 🎉\n\nNhìn lại hành trình từ junior viết code sai syntax, đến bây giờ lead team 5 người — thực sự tự hào.\n\nCảm ơn tất cả mentor và đồng nghiệp!",
            [], [$linh, $dat, $ha, $huy, $huong, $khoa, $lan, $chau, $tu],
            [
                [$linh, 'Chúc mừng anh Minh!!! Xứng đáng quá!', [[$minh, 'Cảm ơn Linh!']]],
                [$huong, 'Chúc mừng anh! Team tự hào về anh'],
            ], false, 3);

        $this->makePost($dat,
            "Chia sẻ resource học lập trình miễn phí 📚\n\n📖 roadmap.sh - lộ trình cho từng role\n📖 MDN Web Docs - thánh địa HTML/CSS/JS\n📖 freeCodeCamp - học có chứng chỉ free\n\n🎬 YouTube: Traversy Media, Fireship, Kevin Powell\n\nTips: Học đi đôi với làm project!",
            [], [$minh, $linh, $ha, $khoa, $huong, $huy, $toan, $tu, $long],
            [
                [$minh, 'Roadmap.sh là gem, mình dùng từ hồi mới vào nghề'],
                [$khoa, 'Save bài này để gửi cho junior sau'],
            ], false, 5);

        $this->makePost($ngoc,
            "Hôm nay đi hiking Bà Nà Hills, mệt nhưng đỉnh thật sự 🏔️\n\nCầu Vàng nhìn ngoài đời còn đẹp hơn ảnh nhiều. Trời se lạnh, sương mờ, như đang ở Châu Âu 🌫️",
            ['https://picsum.photos/seed/danang1/800/450', 'https://picsum.photos/seed/danang2/800/450'],
            [$lan, $huong, $khoa, $toan, $mai, $linh, $ha, $huy, $chau],
            [
                [$huong, 'Ghen tị quá! Mình chưa đi Đà Nẵng lần nào'],
                [$lan, 'Ảnh đẹp quá Ngọc ơi!', [[$ngoc, 'Đẹp lắm Lan ơi nhưng đông du khách']]],
            ], false, 6);

        $this->makePost($linh,
            "Vừa hoàn thành khóa AWS Cloud Practitioner và đậu certification ☁️🏅\n\nĐây là cert đầu tiên trong lộ trình cloud. Next target: AWS Solutions Architect Associate tháng 8!\n\n#AWS #CloudComputing",
            [], [$minh, $dat, $ha, $huy, $khoa, $dung, $toan],
            [
                [$minh, 'Chúc mừng Linh!! Cloud là tương lai', [[$linh, 'Cảm ơn anh Minh!']]],
                [$khoa, 'Impressive! Chia sẻ tài liệu ôn thi với mình nhé'],
            ], false, 10);

        $this->makePost($long,
            "Road trip Đà Lạt 3 ngày 2 đêm cùng team xóm trọ 🚗🏔️\n\nNgày 1: Ăn bún bò Bà Ngọc, nghỉ homestay view đồi chè\nNgày 2: Hồ Tuyền Lâm, vườn dâu, cà phê Mê Linh\nNgày 3: Chợ Đà Lạt sáng sớm, mua mứt và hoa về",
            ['https://picsum.photos/seed/dalat1/800/450', 'https://picsum.photos/seed/dalat2/800/450'],
            [$ngan, $toan, $dat, $huong, $minh, $khoa, $huy, $chau, $tu],
            [
                [$ngan, 'Chuyến đi tuyệt vời nhất! Cảm ơn anh Long'],
                [$huong, 'Ghen tị cực kỳ! Lần sau rủ mình với'],
            ], false, 9);

        $this->makePost($huy,
            "Review phim Inside Out 2 ⭐⭐⭐⭐⭐\n\nPixar một lần nữa chứng minh tại sao họ là ông vua animation. Câu chuyện về anxiety thật sự chạm đến lòng mình.\n\nAi chưa xem thì xem ngay đi!",
            ['https://picsum.photos/seed/cinema/800/450'],
            [$chau, $tu, $mai, $ngoc, $lan, $huong, $dat],
            [
                [$chau, 'Tao khóc từ đầu đến cuối luôn 😭'],
                [$tu, 'Anxiety trông cute nhưng stress lắm', [[$huy, 'Đúng không? Xem xong hiểu mình hơn']]],
            ], false, 1);

        $this->makePost($chau,
            "Tổng kết chi tiêu tháng 4 💰\n\nThu nhập: 18.000.000đ\n- Thuê nhà: 4.500.000đ (25%)\n- Ăn uống: 3.200.000đ (18%)\n- Đi lại: 800.000đ (4%)\n- Shopping: 1.500.000đ (8%)\n- Tiết kiệm: 7.400.000đ (41%) 🎯\n\nMục tiêu tiết kiệm 40% mỗi tháng - tháng này đạt rồi!",
            [], [$huy, $tu, $linh, $dat, $ha, $ngan, $huong],
            [
                [$huy, 'Tiết kiệm 41% là kỷ luật thép! Mình mới 20%'],
                [$tu, 'Nhìn breakdown này mới biết mình xài ăn uống nhiều quá'],
            ], false, 10);

        $this->makePost($tu,
            "Thi IELTS lần 2 đạt 7.0 🎉\n\nLần 1: 5.5. Ôn 4 tháng:\n- Listening: shadowing BBC News\n- Reading: The Economist\n- Writing: luyện online 3 buổi/tuần\n- Speaking: Tandem app\n\nBand: L8.0 R7.5 W6.5 S6.5 → Overall 7.0!\n\nĐừng bỏ cuộc!",
            [], [$huy, $chau, $linh, $lan, $huong, $minh, $dat, $ngoc],
            [
                [$huy, 'Impressive lắm Tú! Chúc mừng nhé', [[$tu, 'Cảm ơn Huy!']]],
                [$lan, 'Tandem app hay không? Mình muốn luyện Speaking'],
            ], false, 8);

        $this->makePost($ha,
            "Kết thúc sprint 3 thành công! 🚀\n\nTeam deliver đúng deadline với 0 critical bug, acceptance rate 98%.\n\nBài học:\n1. Daily standup 15 phút giúp sync hiệu quả\n2. Code review kỹ trước merge\n3. Document ngay khi làm\n4. Celebrate nhỏ sau mỗi milestone",
            [], [$minh, $linh, $dat, $huy, $khoa],
            [
                [$minh, 'Team làm tốt lắm! Sprint 4 nâng bar cao hơn nhé'],
                [$huy, 'Celebrate: chiều nay trà sữa cả team, tao mời! 🧋'],
            ], false, 2);

        $this->makePost($toan,
            "Hà Nội tháng 5 - Mùa hoa phượng đỏ 🌺\n\nVề quê thăm bà ngoại, buổi sáng đi dạo hồ Tây thấy phượng nở đỏ rực. Nhớ những ngày còn đi học.\n\nAi ở Hà Nội tranh thủ ra hồ chụp ảnh đi, đẹp lắm!",
            ['https://picsum.photos/seed/flower/800/450'],
            [$khoa, $lan, $ngoc, $dung, $huong, $ha, $minh],
            [
                [$lan, 'Hoa phượng! Mình nhớ Hà Nội quá, mấy năm chưa về'],
                [$ngoc, 'Ảnh đẹp quá! Dùng máy gì vậy?', [[$toan, 'iPhone 15 Pro thôi, ánh sáng tự nhiên đẹp']]],
            ], false, 6);

        $this->makePost($ngan,
            "Cuối tuần vào bếp làm bánh tiramisu 🍰\n\nLần đầu làm mà ra lò không tệ! Vị cà phê đậm, kem mascarpone mịn. Cả nhà khen nức nở 🥰\n\nCông thức: 500g mascarpone, 4 lòng đỏ, 100g đường, 200ml kem tươi, ladyfinger, espresso.",
            ['https://picsum.photos/seed/tiramisu/800/450'],
            [$long, $lan, $mai, $huong, $linh, $chau, $tu, $ha],
            [
                [$lan, 'Nhìn ngon quá Ngân! Mày làm bánh giỏi vậy'],
                [$long, 'Em tài năng quá!', [[$ngan, 'Em để phần anh một miếng nhé 😄']]],
            ], false, 2);

        $this->makePost($dung,
            "Sách hay tháng này: Atomic Habits 📖\n\nKey takeaway: Cải thiện 1% mỗi ngày. Sau 1 năm tốt hơn 37 lần.\n\nMình áp dụng: dậy sớm 5 phút/ngày, đọc 10 trang/ngày, code 30 phút trước khi ngủ. Hiệu quả rõ sau 2 tháng!",
            [], [$khoa, $lan, $huong, $toan, $minh, $linh, $huy, $chau],
            [
                [$khoa, 'Phần habit stacking hay nhất theo mình'],
                [$minh, 'Sách này mình mua cho cả team đọc rồi, kinh điển'],
            ], false, 5);
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\Traits\SeederHelper;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
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

        // ═══════════════════════════════════════════════════════════════════
        //  Bài 1 — An: Chia sẻ kinh nghiệm (nhiều like, nhiều comment)
        // ═══════════════════════════════════════════════════════════════════
        $this->makePost(
            $an,
            "Vừa hoàn thành xong hệ thống chat realtime cho đồ án tốt nghiệp! 🎉\n\nCông nghệ sử dụng:\n• Backend: Laravel 12 + Reverb (WebSocket)\n• Frontend: React + TypeScript\n• Database: MySQL + Redis\n\nTính năng chính: chat 1-1, chat nhóm, streak, chia sẻ tài liệu, bảng tin. Cảm giác thật sự thoả mãn khi thấy tin nhắn xuất hiện realtime trên 2 tab khác nhau 💻🔥\n\n#PTIT #DoAnTotNghiep #Laravel #React",
            ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'],
            [$binh, $cuong, $duy, $mai, $khoa],
            [
                [$binh, 'Chúc mừng bạn! WebSocket xử lý concurrent tốt không?', [
                    [$an, 'Test thử 50 tabs đồng thời vẫn mượt 👌'],
                    [$cuong, 'Xịn thật sự, cho xin source tham khảo được không? 😂'],
                ]],
                [$duy, 'Hay quá! Mình cũng đang tìm hiểu WebSocket cho project ML.'],
                [$mai, 'UI nhìn clean lắm bạn ơi 🎨 Dùng Tailwind hay CSS thuần?'],
            ],
            false,
            0 // hôm nay
        );

        // ═══════════════════════════════════════════════════════════════════
        //  Bài 2 — Bình: Chia sẻ tài liệu (có ảnh)
        // ═══════════════════════════════════════════════════════════════════
        $this->makePost(
            $binh,
            "📚 Chia sẻ bộ tài liệu OWASP Top 10 bản tiếng Việt!\n\nMình vừa dịch xong bộ tài liệu OWASP Top 10 - 2024, cover các lỗ hổng bảo mật web phổ biến nhất. Rất hữu ích cho bạn nào đang học An toàn thông tin hoặc chuẩn bị phỏng vấn.\n\nĐã upload vào nhóm 'Cộng Đồng IT PTIT' rồi nhé!\n\n#ATTT #CyberSecurity #OWASP",
            ['https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800'],
            [$an, $cuong, $duy],
            [
                [$an, 'Cảm ơn Bình nhiều! Đang cần tài liệu này cho phần bảo mật đồ án.', [
                    [$binh, 'Không có chi, anh em giúp nhau học 💪'],
                ]],
                [$khoa, 'Tài liệu này có cover phần API Security không bạn?', [
                    [$binh, 'Có nhé, API Security nằm ở mục A1 và A7.'],
                ]],
            ],
            false,
            1
        );

        // ═══════════════════════════════════════════════════════════════════
        //  Bài 3 — Cường: Hỏi bài (nhiều comment tương tác)
        // ═══════════════════════════════════════════════════════════════════
        $this->makePost(
            $cuong,
            "🆘 Ai có tài liệu ôn thi môn Mạng Máy Tính không, cứu với!!!\n\nThi cuối kỳ còn 5 ngày nữa mà mình chưa ôn gì cả. Cần gấp:\n• Slide bài giảng\n• Đề thi các năm\n• Tóm tắt lý thuyết\n\nCó gì share giúp mình với 🙏🙏🙏",
            [],
            [$an, $binh],
            [
                [$an, 'Lên nhóm Cộng Đồng IT PTIT xem, hình như có người up slide rồi đó.', [
                    [$cuong, 'Ok để mình check thử, cảm ơn bạn!'],
                ]],
                [$duy, 'Mình có đề thi năm ngoái, inbox mình nha.'],
                [$mai, 'Mạng Máy Tính khó ở phần subnetting, bạn focus chỗ đó nhé.'],
            ],
            false,
            1
        );

        // ═══════════════════════════════════════════════════════════════════
        //  Bài 4 — Duy: Data Science (có ảnh)
        // ═══════════════════════════════════════════════════════════════════
        $this->makePost(
            $duy,
            "🏆 Vừa đạt Top 10% trên Kaggle Competition!\n\nChủ đề: House Price Prediction\nModel: XGBoost + Feature Engineering\nScore: 0.118 RMSE\n\nViệc tham gia Kaggle giúp mình học được rất nhiều về xử lý dữ liệu thực tế. Recommend cho bạn nào đang học ML/AI!\n\n#DataScience #Kaggle #MachineLearning",
            ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'],
            [$an, $cuong, $mai, $binh],
            [
                [$an, 'Chúc mừng bạn! Top 10% là rất impressive.'],
                [$cuong, 'Bạn có chia sẻ notebook được không? Mình muốn học cách feature engineering.', [
                    [$duy, 'Có nha, mình sẽ share trên GitHub. Watch repo của mình nhé!'],
                ]],
            ],
            false,
            2
        );

        // ═══════════════════════════════════════════════════════════════════
        //  Bài 5 — Mai: Design portfolio (có ảnh)
        // ═══════════════════════════════════════════════════════════════════
        $this->makePost(
            $mai,
            "🎨 Vừa hoàn thành redesign app di động cho đồ án UX!\n\nThiết kế theo phong cách glassmorphism, dark mode. Sử dụng Figma + Auto Layout. Mọi người cho mình feedback nha.\n\nLink Figma prototype sẽ share trong CLB Design nhé!\n\n#UXUI #FigmaDesign #MobileApp",
            ['https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800'],
            [$an, $nga, $duy],
            [
                [$an, 'UI đẹp quá Mai ơi! Dark mode nhìn rất premium 🤩'],
                [$nga, 'Glassmorphism trendy lắm bạn ơi, nhìn rất sang!'],
            ],
            false,
            3
        );

        // ═══════════════════════════════════════════════════════════════════
        //  Bài 6 — Khoa: DevOps
        // ═══════════════════════════════════════════════════════════════════
        $this->makePost(
            $khoa,
            "☁️ Tips deploy Laravel lên AWS EC2 miễn phí!\n\n1. Tạo EC2 t2.micro (free tier)\n2. Cài LEMP stack (Nginx + PHP 8.3 + MySQL)\n3. Setup SSL với Certbot\n4. Deploy bằng Git pull + Supervisor cho queue\n\nMình đã viết bài hướng dẫn chi tiết, bạn nào cần thì comment nhé!\n\n#DevOps #AWS #Laravel",
            [],
            [$cuong, $an],
            [
                [$cuong, 'Hay quá! Bạn có dùng Docker không?', [
                    [$khoa, 'Bản production mình dùng trực tiếp, bản dev mới Docker. Free tier EC2 ram ít nên Docker hơi nặng.'],
                ]],
            ],
            false,
            2
        );

        // ═══════════════════════════════════════════════════════════════════
        //  Bài 7 — Nga: Tiếng Anh (tạo đa dạng nội dung)
        // ═══════════════════════════════════════════════════════════════════
        $this->makePost(
            $nga,
            "🌍 IELTS Speaking tip của tuần!\n\nKhi gặp câu hỏi khó, đừng im lặng. Dùng các cụm filler tự nhiên:\n• \"That's an interesting question...\"\n• \"Let me think about that for a moment...\"\n• \"I haven't really thought about it before, but...\"\n\nTự tin nói là được điểm rồi! 💪\n\n#IELTS #EnglishTips #Speaking",
            [],
            [$mai, $an],
            [
                [$mai, 'Hay quá! Mình đang luyện IELTS 6.5, rất cần tips kiểu này.'],
            ],
            false,
            4
        );

        // ═══════════════════════════════════════════════════════════════════
        //  Bài 8 — An: Streak Achievement (tự động chia sẻ)
        // ═══════════════════════════════════════════════════════════════════
        $this->makePost(
            $an,
            "🔥 Tôi và Trần Thị Bình đã đạt chuỗi 15 ngày nhắn tin liên tiếp!",
            [],
            [$binh, $cuong, $duy],
            [
                [$cuong, 'Siêu ghê, 15 ngày liên tục! 🔥🔥🔥'],
                [$binh, 'Cố lên 30 ngày nào team! 💪'],
            ],
            false,
            0
        );

        // ═══════════════════════════════════════════════════════════════════
        //  Bài 9 — Bài bị Admin ẩn (demo kiểm duyệt)
        // ═══════════════════════════════════════════════════════════════════
        $hiddenPost = $this->makePost(
            $this->user('hung@ptit.edu.vn'),
            'Bán tài khoản Netflix giá rẻ, inbox mình nhé! 🎬🎬🎬 Link: bit.ly/abc123',
            [],
            [],
            [],
            false,
            1
        );
        $hiddenPost->update([
            'status'      => 'hidden',
            'hide_reason' => 'Vi phạm quy tắc cộng đồng: quảng cáo và spam nội dung không liên quan đến học tập.',
            'hidden_by'   => $admin->id,
        ]);

        // ═══════════════════════════════════════════════════════════════════
        //  Bài 10 — Thêm bài để feed scroll dài hơn
        // ═══════════════════════════════════════════════════════════════════
        $this->makePost(
            $binh,
            "💡 Mẹo giữ tinh thần khi deadline dồn dập:\n\n1. Chia nhỏ task, làm từng cái một\n2. Pomodoro: 25 phút code, 5 phút nghỉ\n3. Đừng thức khuya quá 1h sáng\n4. Tập thể dục 30 phút/ngày\n5. Uống đủ nước!\n\nĐừng để deadline đuổi mình, hãy đuổi deadline 🏃‍♂️💨",
            [],
            [$an, $duy, $mai, $cuong, $khoa, $nga],
            [
                [$duy, 'Pomodoro thật sự rất hiệu quả, mình dùng app Forest.'],
                [$an, 'Điểm 3 là mình hay vi phạm nhất 😂'],
                [$mai, 'Cảm ơn bạn, đúng lúc mình cần motivation 🥲'],
            ],
            false,
            3
        );

        $this->makePost(
            $duy,
            "📊 Comparison Python vs R cho Data Science:\n\n🐍 Python: General-purpose, ecosystem lớn (Pandas, Scikit-learn, TensorFlow)\n📈 R: Chuyên biệt thống kê, visualisation đẹp (ggplot2)\n\nNếu bạn mới bắt đầu → chọn Python\nNếu bạn chuyên thống kê → R cũng rất đáng học!\n\nMình thì dùng cả 2 tuỳ project 😄",
            [],
            [$an, $binh],
            [
                [$binh, 'Python versatile hơn đúng rồi. Nhưng R thì ggplot đẹp thật.'],
            ],
            false,
            5
        );

        $this->makePost(
            $cuong,
            "🔧 Setup mới xong môi trường dev cho project Laravel:\n\n• PHP 8.3 + Composer\n• Node 20 LTS + pnpm\n• MySQL 8.0\n• Redis cho Queue & Cache\n• Laravel Reverb cho WebSocket\n\nAi cần hướng dẫn setup thì hỏi mình nhé!",
            [],
            [$an, $khoa],
            [
                [$khoa, 'pnpm nhanh hơn npm rất nhiều, chọn đúng rồi 👍'],
            ],
            false,
            4
        );
    }
}

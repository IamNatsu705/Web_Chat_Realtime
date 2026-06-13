<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\GroupJoinRequest;
use App\Models\GroupResource;
use App\Models\Message;
use Database\Seeders\Traits\SeederHelper;
use Illuminate\Database\Seeder;

class ConversationSeeder extends Seeder
{
    use SeederHelper;

    public function run(): void
    {
        $this->loadUsers();

        $an    = $this->user('an@ptit.edu.vn');
        $binh  = $this->user('binh@ptit.edu.vn');
        $cuong = $this->user('cuong@ptit.edu.vn');
        $duy   = $this->user('duy@ptit.edu.vn');
        $mai   = $this->user('mai@ptit.edu.vn');
        $khoa  = $this->user('khoa@ptit.edu.vn');
        $nga   = $this->user('nga@ptit.edu.vn');

        // ═══════════════════════════════════════════════════════════════════
        //  1. DM An & Bình — cuộc trò chuyện chính, nhiều tin nhắn, có file
        // ═══════════════════════════════════════════════════════════════════
        $dm1 = $this->makeDM($an, $binh, [
            [$an,   'Chào Bình, lâu rồi không nói chuyện 😊'],
            [$binh, 'Chào An! Mình vẫn khoẻ, dạo này bận project quá.'],
            [$an,   'Mình cũng vậy. Bạn đang làm đề tài gì thế?'],
            [$binh, 'Mình đang nghiên cứu bảo mật WebSocket, khá thú vị.'],
            [$an,   'Hay đấy! Mình đang làm hệ thống chat realtime bằng Laravel Reverb.'],
            [$binh, 'Ồ Laravel Reverb hả, mình nghe nói hiệu suất tốt lắm.'],
            [$an,   'Ừ, xử lý được 10k concurrent connections. Bạn có tài liệu OWASP WebSocket không?'],
            [$binh, 'Có nè, để mình gửi cho.'],
            [$an,   'Cảm ơn bạn nhiều! Tí mình gửi lại slide bài giảng Laravel cho bạn nhé.'],
            [$binh, 'Ok bạn ơi, mình đang cần xem phần middleware authentication.'],
            [$an,   'Xong rồi nha, đã gửi vào nhóm Cộng đồng IT luôn.'],
            [$binh, 'Tuyệt vời 👍'],
        ]);

        // Thêm 1 tin nhắn bị thu hồi (recalled) — demo trạng thái thu hồi
        Message::create([
            'conversation_id' => $dm1->id,
            'sender_id'       => $an->id,
            'content'         => 'Tin nhắn đã bị thu hồi',
            'type'            => 'text',
            'is_recalled'     => true,
            'created_at'      => now()->subHours(1),
            'updated_at'      => now()->subHours(1),
        ]);

        // Tin nhắn gần nhất
        Message::create([
            'conversation_id' => $dm1->id,
            'sender_id'       => $binh->id,
            'content'         => 'Nhớ ôn DSA cho kỳ thi tới nha!',
            'type'            => 'text',
            'created_at'      => now()->subMinutes(15),
            'updated_at'      => now()->subMinutes(15),
        ]);

        // ═══════════════════════════════════════════════════════════════════
        //  2. DM An & Cường — cuộc trò chuyện code
        // ═══════════════════════════════════════════════════════════════════
        $this->makeDM($an, $cuong, [
            [$cuong, 'An ơi, bạn dùng React Query hay SWR cho project?'],
            [$an,    'Mình dùng React Query, caching ngon hơn nhiều.'],
            [$cuong, 'Oke mình sẽ thử. Cảm ơn bạn!'],
            [$an,    'Không có chi. Có gì inbox mình nhé 💪'],
        ]);

        // ═══════════════════════════════════════════════════════════════════
        //  3. DM An & Mai — cuộc trò chuyện nhẹ (giúp sidebar có nhiều mục)
        // ═══════════════════════════════════════════════════════════════════
        $this->makeDM($an, $mai, [
            [$mai, 'An ơi, bạn có template Figma cho dashboard admin không?'],
            [$an,  'Mình có một bộ free trên Figma Community, để mình share link.'],
            [$mai, 'Cảm ơn bạn nhiều 🎨'],
        ]);

        // ═══════════════════════════════════════════════════════════════════
        //  4. DM Bình & Duy — để Duy có chat hiển thị
        // ═══════════════════════════════════════════════════════════════════
        $this->makeDM($binh, $duy, [
            [$duy,  'Bình ơi, bài Lab hôm nay nộp chưa?'],
            [$binh, 'Nộp rồi nha, bạn nộp chưa?'],
            [$duy,  'Đang làm, gần xong rồi 😅'],
            [$binh, 'Cố lên nha, deadline 23:59 đó!'],
        ]);

        // ═══════════════════════════════════════════════════════════════════
        //  5. DM từ người lạ — demo trạng thái pending stranger
        // ═══════════════════════════════════════════════════════════════════
        $strangerDM = Conversation::create([
            'name'         => null,
            'is_group'     => false,
            'admin_id'     => null,
            'member_count' => 2,
            'created_at'   => now()->subHours(3),
        ]);
        ConversationParticipant::create([
            'conversation_id' => $strangerDM->id,
            'user_id'         => $nga->id,
            'status'          => 'active',
        ]);
        ConversationParticipant::create([
            'conversation_id' => $strangerDM->id,
            'user_id'         => $cuong->id,
            'status'          => 'pending', // Cường chưa kết bạn Nga → pending
        ]);
        Message::create([
            'conversation_id' => $strangerDM->id,
            'sender_id'       => $nga->id,
            'content'         => 'Chào anh, em thấy anh cùng khoa CNTT, cho em hỏi về môn Mạng được không ạ?',
            'type'            => 'text',
            'created_at'      => now()->subHours(2),
            'updated_at'      => now()->subHours(2),
        ]);

        // ═══════════════════════════════════════════════════════════════════
        //  6. Private Group — Nhóm bạn thân (invite-only)
        // ═══════════════════════════════════════════════════════════════════
        $privateGroup = $this->makeGroup(
            'Nhóm Đồ Án Web',
            null,
            $an,
            [$binh, $cuong],
            [
                [$an,    'Chào team, mình lập nhóm để quản lý đồ án nha!'],
                [$binh,  'Nhận, mình phụ trách phần backend.'],
                [$cuong, 'Mình lo phần frontend React nhé.'],
                [$an,    'Tuyệt vời! Mình sẽ setup repo GitHub tối nay.'],
                [$binh,  'Ok anh, nhớ thêm file .env.example nha.'],
                [$cuong, 'Mình đã push xong phần layout, anh em review giúp 🙏'],
                [$an,    'Review xong rồi, nhìn clean lắm 👍'],
            ]
        );
        $privateGroup->update(['join_type' => 'invite']);

        // Đặt role cho participants
        ConversationParticipant::where('conversation_id', $privateGroup->id)
            ->where('user_id', $an->id)
            ->update(['role' => 'owner']);
        ConversationParticipant::where('conversation_id', $privateGroup->id)
            ->where('user_id', $binh->id)
            ->update(['role' => 'moderator']);
        ConversationParticipant::where('conversation_id', $privateGroup->id)
            ->where('user_id', $cuong->id)
            ->update(['role' => 'member']);

        // System message (thêm thành viên)
        Message::create([
            'conversation_id' => $privateGroup->id,
            'sender_id'       => null,
            'content'         => 'Nguyễn Văn An đã tạo nhóm với Trần Thị Bình, Lê Minh Cường',
            'type'            => 'system',
            'created_at'      => $privateGroup->created_at,
            'updated_at'      => $privateGroup->created_at,
        ]);

        // ═══════════════════════════════════════════════════════════════════
        //  7. Community Open — Cộng đồng IT PTIT (nhiều thành viên)
        // ═══════════════════════════════════════════════════════════════════
        $communityOpen = $this->makeGroup(
            'Cộng Đồng IT PTIT',
            null,
            $cuong,
            [$an, $binh, $duy, $mai],
            [
                [$cuong, 'Chào mừng mọi người đến với cộng đồng IT PTIT! 🎉'],
                [$an,    'Nhóm này có cho phép share tài liệu không admin?'],
                [$cuong, 'Có nhé bạn, mọi thành viên đều có thể upload tài liệu vào phần Tài nguyên.'],
                [$duy,   'Mình mới share bộ đề thi OOP năm ngoái, mọi người xem thử nha.'],
                [$mai,   'Có ai có slide môn UX/UI Design không ạ? 🙏'],
                [$binh,  'Mình có tài liệu OWASP Top 10, upload cho nhóm luôn nhé.'],
                [$an,    'Tuyệt vời! Nhóm này ngày càng hữu ích 👏'],
                [$cuong, 'Anh em nhớ ghim tài liệu quan trọng nha, để mọi người dễ tìm.'],
            ]
        );
        $communityOpen->update([
            'description' => 'Nơi chia sẻ kiến thức, tài liệu và kinh nghiệm học tập IT cho sinh viên PTIT. Tham gia tự do, cùng nhau phát triển! 🚀',
            'join_type'   => 'open',
            'category'    => 'department',
        ]);

        ConversationParticipant::where('conversation_id', $communityOpen->id)
            ->where('user_id', $cuong->id)
            ->update(['role' => 'owner']);
        ConversationParticipant::where('conversation_id', $communityOpen->id)
            ->where('user_id', $an->id)
            ->update(['role' => 'moderator']);

        // ── Tài liệu nhóm (đa dạng loại file) ────────────────────────────
        GroupResource::create([
            'conversation_id' => $communityOpen->id,
            'uploader_id'     => $an->id,
            'title'           => 'Slide Lập Trình Web - Chương 1-5',
            'description'     => 'Slide bài giảng lập trình Web từ chương 1 đến chương 5, bao gồm HTML, CSS, JavaScript cơ bản.',
            'file_url'        => 'group_resources/sample/slide-web.pdf',
            'file_type'       => 'pdf',
            'file_size'       => 4500000,
            'category'        => 'lecture',
            'download_count'  => 24,
            'is_pinned'       => true,
            'created_at'      => now()->subDays(5),
            'updated_at'      => now()->subDays(5),
        ]);

        GroupResource::create([
            'conversation_id' => $communityOpen->id,
            'uploader_id'     => $duy->id,
            'title'           => 'Đề thi OOP 2025 - Đề chính thức',
            'description'     => 'Đề thi Lập trình hướng đối tượng kỳ 2 năm 2025, có đáp án tham khảo.',
            'file_url'        => 'group_resources/sample/de-thi-oop.pdf',
            'file_type'       => 'pdf',
            'file_size'       => 2200000,
            'category'        => 'exam',
            'download_count'  => 18,
            'is_pinned'       => true,
            'created_at'      => now()->subDays(3),
            'updated_at'      => now()->subDays(3),
        ]);

        GroupResource::create([
            'conversation_id' => $communityOpen->id,
            'uploader_id'     => $binh->id,
            'title'           => 'OWASP Top 10 - 2024 (Tiếng Việt)',
            'description'     => 'Tài liệu dịch OWASP Top 10 các lỗ hổng bảo mật web phổ biến nhất.',
            'file_url'        => 'group_resources/sample/owasp-top-10.pdf',
            'file_type'       => 'pdf',
            'file_size'       => 3100000,
            'category'        => 'lecture',
            'download_count'  => 12,
            'is_pinned'       => false,
            'created_at'      => now()->subDays(2),
            'updated_at'      => now()->subDays(2),
        ]);

        GroupResource::create([
            'conversation_id' => $communityOpen->id,
            'uploader_id'     => $cuong->id,
            'title'           => 'Template Báo Cáo Đồ Án',
            'description'     => 'Mẫu báo cáo đồ án tốt nghiệp chuẩn format PTIT 2026.',
            'file_url'        => 'group_resources/sample/template-bao-cao.docx',
            'file_type'       => 'doc',
            'file_size'       => 850000,
            'category'        => 'other',
            'download_count'  => 31,
            'is_pinned'       => false,
            'created_at'      => now()->subDays(7),
            'updated_at'      => now()->subDays(7),
        ]);

        GroupResource::create([
            'conversation_id' => $communityOpen->id,
            'uploader_id'     => $mai->id,
            'title'           => 'Bảng tổng hợp điểm môn CSDL',
            'description'     => 'Bảng điểm tham khảo các kỳ, format Excel dễ tra cứu.',
            'file_url'        => 'group_resources/sample/bang-diem-csdl.xlsx',
            'file_type'       => 'excel',
            'file_size'       => 420000,
            'category'        => 'other',
            'download_count'  => 7,
            'is_pinned'       => false,
            'created_at'      => now()->subDays(1),
            'updated_at'      => now()->subDays(1),
        ]);

        GroupResource::create([
            'conversation_id' => $communityOpen->id,
            'uploader_id'     => $duy->id,
            'title'           => 'Bài thuyết trình Machine Learning',
            'description'     => 'Slide thuyết trình môn ML, chủ đề Neural Networks.',
            'file_url'        => 'group_resources/sample/ml-presentation.pptx',
            'file_type'       => 'ppt',
            'file_size'       => 6200000,
            'category'        => 'lecture',
            'download_count'  => 9,
            'is_pinned'       => false,
            'created_at'      => now()->subHours(12),
            'updated_at'      => now()->subHours(12),
        ]);

        // ═══════════════════════════════════════════════════════════════════
        //  8. Community Request — Luyện thi DSA (cần duyệt)
        // ═══════════════════════════════════════════════════════════════════
        $communityRequest = $this->makeGroup(
            'CLB Luyện Thi DSA',
            null,
            $binh,
            [$an, $duy],
            [
                [$binh, 'Chào mọi người, nhóm này chuyên luyện DSA để chuẩn bị phỏng vấn.'],
                [$an,   'Hay quá! Mình sẽ share bài tập LeetCode hàng tuần.'],
                [$duy,  'Mình cũng muốn tham gia, đang ôn cho kỳ thi cuối kỳ.'],
                [$binh, 'Anh em nhớ giải ít nhất 3 bài/tuần nha 💪'],
                [$an,   'Bài hôm nay: Two Sum, khá dễ để warm-up.'],
                [$duy,  'Xong rồi, mình AC được cả 2 approach.'],
            ]
        );
        $communityRequest->update([
            'description' => 'Nhóm kín ôn luyện Cấu trúc dữ liệu & Giải thuật. Giải bài LeetCode hàng tuần, chia sẻ kinh nghiệm phỏng vấn BigTech.',
            'join_type'   => 'request',
            'category'    => 'subject',
        ]);

        ConversationParticipant::where('conversation_id', $communityRequest->id)
            ->where('user_id', $binh->id)
            ->update(['role' => 'owner']);
        ConversationParticipant::where('conversation_id', $communityRequest->id)
            ->where('user_id', $an->id)
            ->update(['role' => 'moderator']);

        // Yêu cầu tham gia nhóm (pending) — demo UI duyệt
        GroupJoinRequest::create([
            'conversation_id' => $communityRequest->id,
            'user_id'         => $cuong->id,
            'status'          => 'pending',
            'created_at'      => now()->subHours(4),
        ]);
        GroupJoinRequest::create([
            'conversation_id' => $communityRequest->id,
            'user_id'         => $khoa->id,
            'status'          => 'pending',
            'created_at'      => now()->subHours(1),
        ]);

        // Tài liệu nhóm DSA
        GroupResource::create([
            'conversation_id' => $communityRequest->id,
            'uploader_id'     => $binh->id,
            'title'           => 'Roadmap DSA cho phỏng vấn',
            'description'     => 'Lộ trình ôn DSA 8 tuần dành cho phỏng vấn Software Engineer.',
            'file_url'        => 'group_resources/sample/dsa-roadmap.pdf',
            'file_type'       => 'pdf',
            'file_size'       => 1800000,
            'category'        => 'lecture',
            'download_count'  => 15,
            'is_pinned'       => true,
            'created_at'      => now()->subDays(4),
            'updated_at'      => now()->subDays(4),
        ]);

        // ═══════════════════════════════════════════════════════════════════
        //  9. Community Open — CLB Tiếng Anh (thêm đa dạng nhóm Khám phá)
        // ═══════════════════════════════════════════════════════════════════
        $englishClub = $this->makeGroup(
            'CLB Tiếng Anh PTIT',
            null,
            $nga,
            [$mai],
            [
                [$nga, 'Welcome to English Club! Let\'s practice together 🌍'],
                [$mai, 'Excited to join! Can we do weekly speaking sessions?'],
                [$nga, 'Sure! Every Saturday 9 AM. See you there!'],
            ]
        );
        $englishClub->update([
            'description' => 'CLB Tiếng Anh PTIT — Luyện speaking, writing, IELTS/TOEIC hàng tuần. Open for everyone!',
            'avatar'      => 'https://ui-avatars.com/api/?name=EN&background=FECDD3&color=D70038',
            'join_type'   => 'open',
            'category'    => 'club',
            'admin_id'    => 2,
        ]);
        ConversationParticipant::where('conversation_id', $englishClub->id)
            ->where('user_id', $nga->id)
            ->update(['role' => 'owner']);

        // ═══════════════════════════════════════════════════════════════════
        //  10. Community Request — CLB Design (thêm đa dạng)
        // ═══════════════════════════════════════════════════════════════════
        $designClub = $this->makeGroup(
            'Design & Creative PTIT',
            null,
            $mai,
            [],
            [
                [$mai, 'Chào mừng đến CLB Design! Chia sẻ portfolio và nhận feedback từ anh chị nhé 🎨'],
            ]
        );
        $designClub->update([
            'description' => 'CLB thiết kế sáng tạo — UI/UX, Graphic Design, Portfolio Review. Yêu cầu duyệt để đảm bảo chất lượng thành viên.',
            'join_type'   => 'request',
            'category'    => 'other',
        ]);
        ConversationParticipant::where('conversation_id', $designClub->id)
            ->where('user_id', $mai->id)
            ->update(['role' => 'owner']);
    }
}

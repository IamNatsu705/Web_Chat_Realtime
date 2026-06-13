// ─── Kiểu dữ liệu Bài viết ──────────────────────────────────────────────────

export interface PostMedia {
  id: number;
  media_url: string;
  media_type: 'image' | 'video';
  sort_order: number;
}

export interface PostUser {
  id: number;
  name: string;
  avatar: string | null;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  media_url: string | null;
  likes_count: number;
  comments_count: number;
  status: 'active' | 'hidden';
  hide_reason: string | null;
  hidden_by_admin: string | null;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
  user: PostUser;
  media: PostMedia[];
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
  updated_at: string;
  user: PostUser;
  replies_count?: number;
  replies?: Comment[];
}

export interface FeedPage {
  posts: Post[];
  next_cursor: string | null;
  has_more: boolean;
}

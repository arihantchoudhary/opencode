export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  conversation_id?: string;
  referenced_tweets?: Array<{ type: "replied_to" | "quoted" | "retweeted"; id: string }>;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count?: number;
  };
}

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  verified?: boolean;
  description?: string;
}

export interface MentionsResponse {
  data?: Tweet[];
  includes?: { users?: TwitterUser[]; tweets?: Tweet[] };
  meta?: { next_token?: string; result_count?: number };
}

export interface ThreadData {
  data: Tweet[];
  includes: { users: TwitterUser[] };
  conversation_id: string;
}

export interface ProfileData {
  name?: string;
  username?: string;
  profile_image_url?: string;
  description?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

export interface DashboardStats {
  mention_count: number;
  total_likes: number;
  total_reposts: number;
  total_replies: number;
  total_impressions: number;
}

export interface Project {
  repo_url: string;
  repo_name: string;
  full_name: string;
  tweet_id: string;
  tweet_text: string;
  tweet_author: string;
  tweet_url: string;
  created_at: string;
}

export interface UserData {
  user_id: string;
  email: string;
  name: string;
  clerk_id?: string;
  twitter_handle?: string;
  avatar_url?: string;
  dismissed_tweet_ids?: string[];
  projects?: Project[];
  refresh_timestamps?: string[];
}

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
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
}

export interface MentionsResponse {
  data?: Tweet[];
  includes?: { users?: TwitterUser[] };
  meta?: { next_token?: string; result_count?: number };
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

export interface UserData {
  user_id: string;
  email: string;
  name: string;
  clerk_id?: string;
  twitter_handle?: string;
  avatar_url?: string;
}

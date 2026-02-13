/**
 * Tweet fetching via Twitter Syndication API and FxTwitter fallback
 */

export interface TweetData {
  id: string;
  text: string;
  author: {
    name: string;
    username: string;
    profileImage?: string;
    verified?: boolean;
  };
  images: string[];
  createdAt?: string;
  engagement?: {
    likes?: number;
    retweets?: number;
    replies?: number;
  };
}

/**
 * Calculate token for Twitter Syndication API
 */
function calculateToken(tweetId: string): string {
  const id = parseInt(tweetId);
  const token = ((id / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
  return token;
}

/**
 * Fetch tweet data from Twitter Syndication API
 */
async function fetchFromSyndication(tweetId: string): Promise<TweetData | null> {
  try {
    const token = calculateToken(tweetId);
    const url = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=${token}`;

    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Extract image URLs from media entities
    const images: string[] = [];
    if (data.photos && Array.isArray(data.photos)) {
      images.push(...data.photos.map((photo: any) => photo.url));
    }

    return {
      id: data.id_str || tweetId,
      text: data.text || '',
      author: {
        name: data.user?.name || 'Unknown',
        username: data.user?.screen_name || 'unknown',
        profileImage: data.user?.profile_image_url_https,
        verified: data.user?.verified || false,
      },
      images,
      createdAt: data.created_at,
      engagement: {
        likes: data.favorite_count,
        retweets: data.retweet_count,
        replies: data.reply_count,
      },
    };
  } catch (error) {
    console.error('Syndication API error:', error);
    return null;
  }
}

/**
 * Fetch tweet data from FxTwitter API (fallback)
 */
async function fetchFromFxTwitter(tweetId: string): Promise<TweetData | null> {
  try {
    const url = `https://api.fxtwitter.com/status/${tweetId}`;

    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const tweet = data.tweet;

    if (!tweet) {
      return null;
    }

    // Extract image URLs from media
    const images: string[] = [];
    if (tweet.media?.photos && Array.isArray(tweet.media.photos)) {
      images.push(...tweet.media.photos.map((photo: any) => photo.url));
    }

    return {
      id: tweet.id || tweetId,
      text: tweet.text || '',
      author: {
        name: tweet.author?.name || 'Unknown',
        username: tweet.author?.screen_name || 'unknown',
        profileImage: tweet.author?.avatar_url,
        verified: tweet.author?.verified || false,
      },
      images,
      createdAt: tweet.created_at,
      engagement: {
        likes: tweet.likes,
        retweets: tweet.retweets,
        replies: tweet.replies,
      },
    };
  } catch (error) {
    console.error('FxTwitter API error:', error);
    return null;
  }
}

/**
 * Fetch tweet data with automatic fallback
 */
export async function fetchTweet(tweetId: string): Promise<TweetData> {
  // Try syndication API first
  let tweetData = await fetchFromSyndication(tweetId);

  // Fallback to FxTwitter if syndication fails
  if (!tweetData) {
    tweetData = await fetchFromFxTwitter(tweetId);
  }

  // If both fail, throw error
  if (!tweetData) {
    throw new Error('Failed to fetch tweet data from all sources');
  }

  return tweetData;
}

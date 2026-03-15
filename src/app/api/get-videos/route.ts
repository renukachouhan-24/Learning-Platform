import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { serverDb } from "@/lib/firebaseServer";

type SearchItem = {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    description?: string;
  };
};

function cleanErrorMessage(message: string) {
  return message.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function createCacheKey(topic: string, description: string, language: string) {
  return `${topic}-${description}-${language}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function readFirestoreVideoCache(topic: string, description: string, language: string) {
  const cacheKey = createCacheKey(topic, description, language);
  const cacheRef = doc(serverDb, "youtubeVideoCache", cacheKey);
  const cacheSnap = await getDoc(cacheRef);

  if (!cacheSnap.exists()) {
    return null;
  }

  const cacheData = cacheSnap.data();

  if (typeof cacheData.videoId !== "string" || !cacheData.videoId) {
    return null;
  }

  return {
    videoId: cacheData.videoId,
    source: "firestore-cache",
  };
}

async function writeFirestoreVideoCache(
  topic: string,
  description: string,
  language: string,
  videoId: string
) {
  const cacheKey = createCacheKey(topic, description, language);
  const cacheRef = doc(serverDb, "youtubeVideoCache", cacheKey);

  await setDoc(cacheRef, {
    topic,
    description,
    language,
    videoId,
    updatedAt: new Date().toISOString(),
  });
}

function scoreVideo(item: SearchItem, language: string, topic: string, description: string) {
  const haystack = `${item.snippet?.title ?? ""} ${item.snippet?.description ?? ""}`.toLowerCase();
  const topicWords = `${topic} ${description}`
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);

  let score = 0;

  for (const word of topicWords) {
    if (haystack.includes(word)) {
      score += 3;
    }
  }

  const positiveSignals = [
    "full course",
    "complete course",
    "full tutorial",
    "beginner to advanced",
    "for beginners",
    "in one shot",
    "masterclass",
    "crash course",
    "explained",
  ];

  for (const signal of positiveSignals) {
    if (haystack.includes(signal)) {
      score += 8;
    }
  }

  if (language === "Hindi") {
    if (haystack.includes("hindi") || haystack.includes("हिंदी") || haystack.includes("हिन्दी")) {
      score += 20;
    }
    if (haystack.includes("english")) {
      score -= 12;
    }
  } else {
    if (haystack.includes("english")) {
      score += 20;
    }
    if (haystack.includes("hindi") || haystack.includes("हिंदी") || haystack.includes("हिन्दी")) {
      score -= 12;
    }
  }

  return score;
}

async function fetchYoutubeResults(query: string, apiKey: string, language: string) {
  const youtubeUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  youtubeUrl.searchParams.set("part", "snippet");
  youtubeUrl.searchParams.set("maxResults", "8");
  youtubeUrl.searchParams.set("q", query);
  youtubeUrl.searchParams.set("type", "video");
  youtubeUrl.searchParams.set("order", "relevance");
  youtubeUrl.searchParams.set("videoEmbeddable", "true");
  youtubeUrl.searchParams.set("videoDuration", "long");
  youtubeUrl.searchParams.set("relevanceLanguage", language === "Hindi" ? "hi" : "en");
  youtubeUrl.searchParams.set("regionCode", language === "Hindi" ? "IN" : "US");
  youtubeUrl.searchParams.set("key", apiKey);

  const res = await fetch(youtubeUrl.toString(), {
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.error?.message || "Failed to fetch from YouTube API";
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return Array.isArray(data.items) ? (data.items as SearchItem[]) : [];
}

const getCachedYoutubeVideo = unstable_cache(
  async (topic: string, description: string, language: string, apiKey: string) => {
    const query = `${topic} ${description} complete full tutorial full course for beginners in ${language}`;
    const collectedResults = await fetchYoutubeResults(query, apiKey, language);

    const bestMatch = collectedResults
      .filter((item) => item.id?.videoId)
      .sort(
        (a, b) =>
          scoreVideo(b, language, topic, description) - scoreVideo(a, language, topic, description)
      )[0];

    return {
      videoId: bestMatch?.id?.videoId ?? null,
      source: "youtube-search",
    };
  },
  ["youtube-topic-video-cache"],
  { revalidate: 60 * 60 * 24 }
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const description = searchParams.get("description") || "";
  const language = searchParams.get("lang") || "English";

  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "YouTube API key is missing" }, { status: 500 });
  }

  try {
    const firestoreCachedVideo = await readFirestoreVideoCache(topic, description, language).catch(() => null);

    if (firestoreCachedVideo?.videoId) {
      return NextResponse.json(firestoreCachedVideo);
    }

    const bestMatch = await getCachedYoutubeVideo(topic, description, language, API_KEY);

    if (bestMatch.videoId) {
      await writeFirestoreVideoCache(topic, description, language, bestMatch.videoId).catch(() => null);
      return NextResponse.json(bestMatch);
    }

    return NextResponse.json({ error: "No video found" }, { status: 404 });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "YouTube API Error";
    const message = cleanErrorMessage(rawMessage);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
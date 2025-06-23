"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// Define return types to avoid circular references
type DownloadResult = {
  success: boolean;
  data?: any;
  downloadCount?: number;
  error?: string;
};

type ProfileDownloadResult = {
  success: boolean;
  data?: any;
  error?: string;
};

// Mock Instagram API - In production, you'd use a real Instagram scraping service
export const downloadInstagramPost = action({
  args: { 
    url: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<DownloadResult> => {
    try {
      // Extract post ID from URL
      const postId = extractPostId(args.url);
      if (!postId) {
        throw new Error("Invalid Instagram URL");
      }

      // Mock data - replace with real Instagram API call
      const mockData = generateMockPostData(args.url);
      
      // Add to download history
      await ctx.runMutation(api.downloads.addDownload, {
        url: args.url,
        mediaType: mockData.mediaType,
        mediaUrls: mockData.mediaUrls,
        thumbnailUrl: mockData.thumbnailUrl,
        caption: mockData.caption,
        username: mockData.username,
        fileSize: mockData.fileSize,
        duration: mockData.duration,
      });

      // Increment download count for ad tracking
      const downloadCount = await ctx.runMutation(api.downloads.incrementDownloadCount, {
        userId: args.userId,
      });

      return {
        success: true,
        data: mockData,
        downloadCount,
      };
    } catch (error) {
      console.error("Download failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Download failed",
      };
    }
  },
});

export const downloadInstagramProfile = action({
  args: {
    profileUrl: v.string(),
    downloadType: v.union(v.literal("all"), v.literal("videos"), v.literal("images")),
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<ProfileDownloadResult> => {
    try {
      const username = extractUsername(args.profileUrl);
      if (!username) {
        throw new Error("Invalid Instagram profile URL");
      }

      // Mock profile data
      const mockProfileData = generateMockProfileData(username, args.downloadType);

      // Create profile download record
      await ctx.runMutation(api.profiles.createProfileDownload, {
        profileUrl: args.profileUrl,
        username,
        downloadType: args.downloadType,
        totalMedia: mockProfileData.totalMedia,
      });

      return {
        success: true,
        data: mockProfileData,
      };
    } catch (error) {
      console.error("Profile download failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Profile download failed",
      };
    }
  },
});

function extractPostId(url: string): string | null {
  const regex = /(?:instagram\.com\/p\/|instagram\.com\/reel\/)([A-Za-z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function extractUsername(url: string): string | null {
  const regex = /instagram\.com\/([A-Za-z0-9_.]+)\/?/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function generateMockPostData(url: string) {
  const isReel = url.includes('/reel/');
  const isCarousel = Math.random() > 0.7;
  
  if (isReel) {
    return {
      mediaType: "reel" as const,
      mediaUrls: ["https://example.com/reel.mp4"],
      thumbnailUrl: "https://picsum.photos/400/600",
      caption: "Amazing reel content! 🔥",
      username: "sample_user",
      fileSize: 15000000, // 15MB
      duration: 30,
    };
  }
  
  if (isCarousel) {
    return {
      mediaType: "carousel" as const,
      mediaUrls: [
        "https://picsum.photos/400/400?random=1",
        "https://picsum.photos/400/400?random=2",
        "https://example.com/video.mp4",
      ],
      thumbnailUrl: "https://picsum.photos/400/400?random=1",
      caption: "Check out this amazing carousel post! 📸✨",
      username: "sample_user",
      fileSize: 8000000, // 8MB
    };
  }
  
  const isVideo = Math.random() > 0.6;
  return {
    mediaType: isVideo ? "video" as const : "image" as const,
    mediaUrls: [isVideo ? "https://example.com/video.mp4" : "https://picsum.photos/400/400"],
    thumbnailUrl: "https://picsum.photos/400/400",
    caption: isVideo ? "Cool video content! 🎥" : "Beautiful photo! 📷",
    username: "sample_user",
    fileSize: isVideo ? 12000000 : 2000000,
    duration: isVideo ? 45 : undefined,
  };
}

function generateMockProfileData(username: string, downloadType: string) {
  const totalCounts = {
    all: 150,
    videos: 45,
    images: 105,
  };
  
  return {
    username,
    totalMedia: totalCounts[downloadType as keyof typeof totalCounts],
    profilePicture: "https://picsum.photos/150/150",
    followerCount: 12500,
    followingCount: 890,
  };
}
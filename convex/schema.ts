import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  downloads: defineTable({
    url: v.string(),
    mediaType: v.union(v.literal("image"), v.literal("video"), v.literal("reel"), v.literal("carousel")),
    mediaUrls: v.array(v.string()),
    thumbnailUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
    username: v.optional(v.string()),
    downloadedAt: v.number(),
    fileSize: v.optional(v.number()),
    duration: v.optional(v.number()), // for videos
  }).index("by_downloadedAt", ["downloadedAt"]),

  userPreferences: defineTable({
    userId: v.string(),
    downloadFolder: v.optional(v.string()),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("amoled")),
    language: v.string(),
    adFrequency: v.number(), // ads every N downloads
    downloadCount: v.number(),
    lastAdShown: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  profileDownloads: defineTable({
    profileUrl: v.string(),
    username: v.string(),
    downloadType: v.union(v.literal("all"), v.literal("videos"), v.literal("images")),
    totalMedia: v.number(),
    downloadedMedia: v.number(),
    status: v.union(v.literal("pending"), v.literal("downloading"), v.literal("completed"), v.literal("failed")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_status", ["status"]),
});
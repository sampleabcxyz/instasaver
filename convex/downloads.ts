import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getDownloadHistory = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("downloads")
      .withIndex("by_downloadedAt")
      .order("desc")
      .collect();
  },
});

export const addDownload = mutation({
  args: {
    url: v.string(),
    mediaType: v.union(v.literal("image"), v.literal("video"), v.literal("reel"), v.literal("carousel")),
    mediaUrls: v.array(v.string()),
    thumbnailUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
    username: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("downloads", {
      ...args,
      downloadedAt: Date.now(),
    });
  },
});

export const deleteDownload = mutation({
  args: { id: v.id("downloads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getUserPreferences = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!prefs) {
      // Return default preferences
      return {
        userId: args.userId,
        theme: "light" as const,
        language: "en",
        adFrequency: 4,
        downloadCount: 0,
        downloadFolder: undefined,
        lastAdShown: undefined,
      };
    }
    
    return prefs;
  },
});

export const updateUserPreferences = mutation({
  args: {
    userId: v.string(),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("amoled"))),
    language: v.optional(v.string()),
    downloadFolder: v.optional(v.string()),
    adFrequency: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        theme: args.theme ?? existing.theme,
        language: args.language ?? existing.language,
        downloadFolder: args.downloadFolder ?? existing.downloadFolder,
        adFrequency: args.adFrequency ?? existing.adFrequency,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        theme: args.theme ?? "light",
        language: args.language ?? "en",
        downloadFolder: args.downloadFolder,
        adFrequency: args.adFrequency ?? 4,
        downloadCount: 0,
      });
    }
  },
});

export const incrementDownloadCount = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (prefs) {
      await ctx.db.patch(prefs._id, {
        downloadCount: prefs.downloadCount + 1,
      });
      return prefs.downloadCount + 1;
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        theme: "light",
        language: "en",
        adFrequency: 4,
        downloadCount: 1,
      });
      return 1;
    }
  },
});
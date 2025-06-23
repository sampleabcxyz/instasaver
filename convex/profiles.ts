import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getProfileDownloads = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("profileDownloads")
      .withIndex("by_status")
      .order("desc")
      .collect();
  },
});

export const createProfileDownload = mutation({
  args: {
    profileUrl: v.string(),
    username: v.string(),
    downloadType: v.union(v.literal("all"), v.literal("videos"), v.literal("images")),
    totalMedia: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("profileDownloads", {
      ...args,
      downloadedMedia: 0,
      status: "pending",
      startedAt: Date.now(),
    });
  },
});

export const updateProfileDownloadProgress = mutation({
  args: {
    id: v.id("profileDownloads"),
    downloadedMedia: v.number(),
    status: v.union(v.literal("pending"), v.literal("downloading"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      downloadedMedia: args.downloadedMedia,
      status: args.status,
    };

    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);
  },
});
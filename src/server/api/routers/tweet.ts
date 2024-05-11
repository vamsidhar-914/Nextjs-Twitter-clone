import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const tweetRouter = createTRPCRouter({
  infiniteFeed: publicProcedure
    .input(
      z.object({
        onlyFollowing: z.boolean().optional(),
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      }),
    )
    .query(
      async ({ input: { limit = 10, onlyFollowing = false, cursor }, ctx }) => {
        const currentUserId = ctx.session?.user.id;
        return await getInfiniteTweets({
          limit,
          ctx,
          cursor,
          whereClause:
            currentUserId == null || !onlyFollowing
              ? undefined
              : {
                  user: {
                    followers: { some: { id: currentUserId } },
                  },
                },
        });
      },
    ),
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const tweet = await ctx.db.tweet.create({
        data: { content, userId: ctx.session.user.id },
      });
      return tweet;
    }),
  toggleLike: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input: { id }, ctx }) => {
      const data = { tweetId: id, userId: ctx.session.user.id };
      const existingLike = await ctx.db.like.findUnique({
        where: { userId_tweetId: data },
      });
      if (existingLike == null) {
        await ctx.db.like.create({ data });
        return { addedLike: true };
      } else {
        await ctx.db.like.delete({
          where: { userId_tweetId: data },
        });
        return { addedLike: false };
      }
    }),
  TweetUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input: { id }, ctx }) => {
      const userId = ctx.session?.user.id;
      const tweet = await ctx.db.tweet.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          content: true,
          likes: userId == null ? false : { where: { userId } },
          _count: {
            select: { likes: true },
          },
          user: {
            select: {
              name: true,
              image: true,
              id: true,
            },
          },
          createdAt: true,
        },
      });
      const liked = tweet?.likes.some((like) => {
        return like.userId === ctx.session?.user.id;
      });
      return {
        tweet,
        LikedByMe: ctx.session?.user.id ? liked : null,
        likesCount: tweet?._count.likes,
      };
    }),
});

async function getInfiniteTweets({
  whereClause,
  ctx,
  limit,
  cursor,
}: {
  whereClause?: Prisma.TweetWhereInput;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
}) {
  const currentUserId = ctx.session?.user.id;
  const tweets = await ctx.db.tweet.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      createdAt: true,
      _count: {
        select: { likes: true },
      },
      likes:
        currentUserId == null ? false : { where: { userId: currentUserId } },
      user: {
        select: {
          name: true,
          id: true,
          image: true,
        },
      },
    },
  });
  let nextCursor: typeof cursor | undefined;
  if (tweets.length > limit) {
    const nextItem = tweets.pop();
    if (nextItem != null) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }
  return {
    tweets: tweets.map((tweet) => {
      return {
        id: tweet.id,
        content: tweet.content,
        createdAt: tweet.createdAt,
        likeCount: tweet._count.likes,
        user: tweet.user,
        likedByMe: tweet.likes?.length > 0,
      };
    }),
    nextCursor,
  };
}

import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input: { id }, ctx }) => {
      const currentUserId = ctx.session?.user.id;
      const profile = await ctx.db.user.findUnique({
        where: {
          id,
        },
        select: {
          name: true,
          image: true,
          _count: {
            select: { followers: true, follows: true, tweets: true },
          },
          followers:
            currentUserId == null
              ? undefined
              : { where: { id: currentUserId } },
        },
      });
      if (profile == null) return null;

      return {
        name: profile.name,
        image: profile.image,
        followersCount: profile._count.followers,
        followsCount: profile._count.follows,
        tweetsCount: profile._count.tweets,
        isFollowing: profile.followers.length > 0,
      };
    }),
  toggleFollow: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input: { userId }, ctx }) => {
      const currentUserId = ctx.session.user.id;
      const existingFollowers = await ctx.db.user.findFirst({
        where: {
          id: userId,
          followers: { some: { id: currentUserId } },
        },
      });
      let addedFollow;
      if (existingFollowers == null) {
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            followers: { connect: { id: currentUserId } },
          },
        });
        addedFollow = true;
      } else {
        await ctx.db.user.update({
          where: {
            id: userId,
          },
          data: {
            followers: { disconnect: { id: currentUserId } },
          },
        });
        addedFollow = false;
      }

      // revalidation
      revalidatePath(`/profiles/${userId}`);

      return { addedFollow };
    }),
});

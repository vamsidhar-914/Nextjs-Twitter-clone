"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  VscArrowLeft,
  VscBookmark,
  VscComment,
  VscHeart,
  VscHeartFilled,
} from "react-icons/vsc";
import { IconHoverEffect } from "~/components/IconHoverEffect";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { ProfileImage } from "~/components/ProfileImage";
import { api } from "~/trpc/react";
import { formatDistanceToNowStrict } from "date-fns";
import locale from "date-fns/locale/en-US";
import { formatTimeToNow } from "~/lib/utils";
import { CiBookmark } from "react-icons/ci";
import { useSession } from "next-auth/react";
import { useState } from "react";

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

export default function tweetPage({
  params: { tweetid },
}: {
  params: { tweetid: string };
}) {
  const session = useSession();
  const router = useRouter();
  const { data, isLoading, isError } = api.tweet.TweetUser.useQuery({
    id: tweetid,
  });
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <p>Error...</p>;

  if (data?.tweet == null) return;

  return (
    <>
      <div className="ml-4 flex items-center gap-4 p-4 ">
        <IconHoverEffect>
          <VscArrowLeft className="h-8 w-8" onClick={router.back} />
        </IconHoverEffect>
        <span className="text-lg font-bold">post</span>
      </div>

      <li className="flex gap-4 px-4 py-4">
        <Link href={`/profiles/${data.tweet.user.id}`}>
          <ProfileImage src={data.tweet.user.image} />
        </Link>
        <div className="flex flex-grow flex-col">
          <div className="flex flex-col">
            <Link
              href={`/profiles/${data.tweet.user.id}`}
              className="font-bold outline-none hover:underline focus-visible:underline"
            >
              {data.tweet.user.name}
            </Link>
            <span className="text-gray-500">@username</span>
          </div>
        </div>
      </li>
      <span className="ml-2 px-3 text-lg font-semibold">
        {data.tweet.content}
      </span>
      <div className="ml-2 flex gap-2 border-b px-3 pb-2">
        <span className="text-gray-500">
          {formatTimeToNow(new Date(data.tweet.createdAt))} -
        </span>
        <span className="text-gray-500">
          {dateTimeFormatter.format(data.tweet.createdAt)}
        </span>
      </div>
      <div className="ml-2 flex items-center gap-8 border-b px-4 py-3">
        <span>
          <IconHoverEffect>
            <VscComment className="h-8 w-8" />
          </IconHoverEffect>
        </span>
        <span className="flex items-center gap-2">
          <HeartButton
            likeCount={data.likesCount!}
            isLoading={isLoading}
            likedByMe={data.LikedByMe!}
            tweetid={tweetid}
          />
        </span>
        <span>
          <IconHoverEffect>
            <VscComment className="h-8 w-8" />
          </IconHoverEffect>
        </span>
      </div>
    </>
  );
}

type HeartButtonProps = {
  likedByMe: boolean;
  likeCount: number;
  isLoading: boolean;
  tweetid: string;
};

function HeartButton({
  likedByMe,
  likeCount,
  isLoading,
  tweetid,
}: HeartButtonProps) {
  const router = useRouter();
  const session = useSession();
  const trpcUtils = api.useContext();
  const toggleLike = api.tweet.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const updateData: Parameters<
        typeof trpcUtils.tweet.TweetUser.setData
      >[1] = (oldData) => {
        if (oldData?.tweet == null || oldData.LikedByMe == null) return;
        const countModifier = addedLike ? 1 : -1;
        return {
          ...oldData,
          LikedByMe: addedLike,
          likesCount: oldData.likesCount! + countModifier,
        };
      };
      trpcUtils.tweet.TweetUser.setData({ id: tweetid }, updateData);
    },
  });

  function handleToggleLike() {
    toggleLike.mutate({ id: tweetid });
  }

  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;
  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    );
  }
  return (
    <button
      disabled={isLoading}
      onClick={handleToggleLike}
      className={`group ml--2 flex items-center gap-1 self-start transition-colors duration-200 -ml-2${likedByMe ? "text-red-500" : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"}`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`h-8 w-8 transition-colors duration-200 ${likedByMe ? "fill-red-500" : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"}`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
}

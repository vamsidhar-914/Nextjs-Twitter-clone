"use client";

import { api } from "~/trpc/react";
import { InfiniteTweetList } from "./InfiniteTweetList";

export function InfiniteProfileFeed({ userid }: { userid: string }) {
  const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery(
    {
      userId: userid,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  return (
    <InfiniteTweetList
      isError={tweets.isError}
      tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  );
}

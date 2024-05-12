import Link from "next/link";
import { notFound } from "next/navigation";
import { VscArrowLeft } from "react-icons/vsc";
import { IconHoverEffect } from "~/components/IconHoverEffect";
import { InfiniteTweetList } from "~/components/InfiniteTweetList";
import { InfiniteProfileFeed } from "~/components/InfiniteProfileFeed";
import { ProfileImage } from "~/components/ProfileImage";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Button } from "~/components/Button2";
import { ToggleFollow } from "~/components/ToggleFollow";

const getProfile = unstable_cache(
  cache(async (id: string, currentUserId: string | undefined) => {
    const profile = await db.user.findUnique({
      where: { id },
      select: {
        name: true,
        image: true,
        _count: {
          select: { followers: true, follows: true, tweets: true },
        },
        followers: id == null ? undefined : { where: { id: currentUserId } },
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
  ["profiles", "id"],
);

export default async function ProfilePage({
  params: { userid },
}: {
  params: { userid: string };
}) {
  const session = await getServerAuthSession();
  const currentUserId = session?.user.id;
  const profile = await getProfile(userid, currentUserId);
  if (profile == null) return notFound();

  // const { data: profile, isPending } = api.profile.getById.useQuery({
  //   id: userid,
  // });
  // if (isPending) return <LoadingSpinner />;

  // if (profile == null || profile.name == null) return notFound();

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center border-b bg-white px-4 py-2">
        <Link href=".." className="mr-2">
          <IconHoverEffect>
            <VscArrowLeft className="h-6 w-6" />
          </IconHoverEffect>
        </Link>
        <ProfileImage src={profile.image} className="flex shrink-0 " />
        <div className="ml-2 flex-grow">
          <h1 className="text-lg font-bold">{profile.name}</h1>
          <div className="text-gray-500">
            {profile.tweetsCount}{" "}
            {getPlural(profile.tweetsCount, "Tweet", "Tweets")} -{" "}
            {profile.followersCount}{" "}
            {getPlural(profile.followersCount, "follower", "followers")} -{" "}
            {profile.followsCount} Following
          </div>
        </div>
        <ToggleFollow isFollowing={profile.isFollowing} userId={userid} />
      </header>
      {/* <main>
        <InfiniteTweetList
          tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
          isError={tweets.isError}
          isLoading={tweets.isLoading}
          hasMore={tweets.hasNextPage}
          fetchNewTweets={tweets.fetchNextPage}
        />
      </main> */}
      <main>
        <InfiniteProfileFeed userid={userid} />
      </main>
    </>
  );
}

// type FollowingButtonProps = {
//   isFollowing: boolean;
//   userId: string;
//   onClick: () => void;
// };

// async function FollowingButton({
//   isFollowing,
//   userId,
//   onClick,
// }: FollowingButtonProps) {
//   const session = await getServerAuthSession();
//   if (!session || session.user.id === userId) {
//     return null;
//   }
//   return (
//     <Button onClick={onClick} small gray={isFollowing}>
//       {isFollowing ? "Unfollow" : "Follow"}
//     </Button>
//   );
// }

const pluralRules = new Intl.PluralRules();
function getPlural(number: number, singular: string, plural: string) {
  return pluralRules.select(number) === "one" ? singular : plural;
}

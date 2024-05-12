"use client";

import { useSession } from "next-auth/react";
import { Button } from "./Button2";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export function ToggleFollow({
  isFollowing,
  userId,
}: {
  isFollowing: boolean;
  userId: string;
}) {
  const router = useRouter();
  const session = useSession();
  if (session.data?.user.id === userId || !session) return null;
  const trpcUtils = api.useContext();
  const follow = api.profile.toggleFollow.useMutation({
    onSuccess: ({ addedFollow }) => {
      router.refresh();
      // optional
      //   trpcUtils.profile.getById.setData({ id: userId }, (oldData) => {
      //     if (oldData == null) return;
      //     const countModifier = addedFollow ? 1 : -1;
      //     return {
      //       ...oldData,
      //       isFollowing: addedFollow,
      //       followersCount: oldData.followersCount + countModifier,
      //     };
      //   });
    },
  });
  return (
    <Button
      disabled={follow.isPending}
      //   onClick={() => toggleFollow.mutate({ userId })}
      onClick={() => follow.mutate({ userId })}
      small
      gray={isFollowing}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}

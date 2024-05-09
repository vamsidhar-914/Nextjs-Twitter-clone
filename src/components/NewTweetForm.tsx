"use client";

import { getServerAuthSession } from "~/server/auth";
import { Button } from "./Button2";
import { ProfileImage } from "./ProfileImage";
import { useSession } from "next-auth/react";
import {
  FormEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { api } from "~/trpc/react";

function updateTextArea(textarea?: HTMLTextAreaElement) {
  if (textarea == null) return;
  textarea.style.height = "0";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function NewTweetForm() {
  const session = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>();
  const [inputValue, setInputValue] = useState("");
  const trpcUtils = api.useContext();

  const inputRef = useCallback((textarea: HTMLTextAreaElement) => {
    updateTextArea(textarea);
    textareaRef.current = textarea;
  }, []);

  useLayoutEffect(() => {
    updateTextArea(textareaRef.current);
  }, [inputValue]);

  const createTweet = api.tweet.create.useMutation({
    onSuccess: (newTweet) => {
      setInputValue("");
      if (session.status !== "authenticated") return;
      const updateData: Parameters<
        typeof trpcUtils.tweet.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;
        const newCachedTweet = {
          ...newTweet,
          likeCount: 0,
          likedByMe: false,
          user: {
            id: session.data.user.id,
            name: session.data.user.name || null,
            image: session.data.user.image || null,
          },
        };
        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              tweets: [newCachedTweet, ...oldData.pages[0].tweets],
            },
            ...oldData.pages.slice(1),
          ],
        };
      };
      trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData);
    },
  });

  if (session.status !== "authenticated") return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createTweet.mutate({ content: inputValue });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-b px-4 py-2"
    >
      <div className="flex gap-4">
        <ProfileImage src={session.data.user.image} />
        <textarea
          ref={inputRef}
          style={{ height: 0 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
          placeholder="whats happening"
        />
      </div>
      <Button className="self-end">Tweet</Button>
    </form>
  );
}

"use client";

import { User } from "@prisma/client";
import { signIn, signOut } from "next-auth/react";
import { IconHoverEffect } from "./IconHoverEffect";
import { VscSignIn, VscSignOut } from "react-icons/vsc";

export function Button({ id }: { id?: string }) {
  if (id == null)
    return (
      <button onClick={() => void signIn()}>
        <IconHoverEffect>
          <span className="flex items-center gap-4">
            <VscSignIn className="h-8 w-8 fill-green-700" />
            <span className="hidden text-lg text-green-700 md:inline">
              Login
            </span>
          </span>
        </IconHoverEffect>
      </button>
    );
  return (
    <button onClick={() => void signOut()}>
      <IconHoverEffect>
        <span className="flex items-center gap-4">
          <VscSignOut className="h-8 w-8 fill-red-700" />
          <span className="hidden text-lg text-red-700 md:inline">Logout</span>
        </span>
      </IconHoverEffect>
    </button>
  );
}

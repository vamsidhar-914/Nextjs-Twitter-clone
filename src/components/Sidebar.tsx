import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { getServerAuthSession } from "~/server/auth";
import { Button } from "./Button";
import { IconHoverEffect } from "./IconHoverEffect";
import { VscAccount, VscHome } from "react-icons/vsc";

export async function Sidebar() {
  const session = await getServerAuthSession();
  const user = session?.user;
  return (
    <nav className="sticky top-0 px-2 py-4 ">
      <ul className="flex flex-col items-start gap-2 whitespace-nowrap">
        <li>
          <Link href="/">
            <IconHoverEffect>
              <span className="flex items-center gap-4">
                <VscHome className="h-8 w-8" />
                <span className="hidden text-lg md:inline">Home</span>
              </span>
            </IconHoverEffect>
          </Link>
        </li>
        {user == null ? null : (
          <li>
            <Link href={`/profiles/${user.id}`}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <VscAccount className="h-8 w-8" />
                  <span className="hidden text-lg md:inline">Profile</span>
                </span>
              </IconHoverEffect>
            </Link>
          </li>
        )}
        <li>
          <Button id={user?.id} />
        </li>
      </ul>
    </nav>
  );
}

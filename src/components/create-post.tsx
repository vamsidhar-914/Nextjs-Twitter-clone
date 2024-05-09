import React from "react";
import { getServerSession } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { getServerAuthSession } from "../server/auth";

export async function CreatePost() {
  const session = await getServerAuthSession();
  const user = session?.user;

  return (
    <nav className="sticky top-0 px-2 py-4">
      <ul className="flex flex-col items-start gap-2 whitespace-nowrap">
        <li>
          <Link href="/">Home</Link>
        </li>
        {user == null ? null : (
          <li>
            <Link href={`/profiles/${user.id}`}>Profile</Link>
          </li>
        )}
        {user == null ? (
          <li>
            <button onClick={() => void signIn}>login</button>
          </li>
        ) : (
          <li>
            <button onClick={() => void signOut}>logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
}

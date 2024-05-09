export default function ProfilePage({
  params: { userid },
}: {
  params: { userid: string };
}) {
  return <h1>profile id -- {userid} </h1>;
}

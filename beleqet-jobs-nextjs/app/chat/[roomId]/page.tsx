import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions";
import ChatClient from "./ChatClient";

export const metadata = {
  title: "Messages | Beleqet",
  description: "Real-time messaging with employers and freelancers on Beleqet.",
};

export default async function ChatPage({ params }: { params: { roomId: string } }) {
  const user = await getSession();
  if (!user) redirect(`/login?next=/chat/${params.roomId}`);

  return <ChatClient roomId={params.roomId} user={user} />;
}

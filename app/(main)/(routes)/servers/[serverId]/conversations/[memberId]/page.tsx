import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import getOrCreateConversations from "@/lib/conversation";
import ChatHeader from "@/components/chat/chat-header";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";

interface MemberIdPageProps {
    params: {
        memberId: string;
        serverId: string;
    }
}

export default async function MemberIdPage({
    params
}: MemberIdPageProps) {
    const profile = await currentProfile();

    if (!profile) {
        return auth().redirectToSignIn();
    }

    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id
        },
        include: {
            profile: true,
        }
    });

    if (!currentMember) {
        return redirect("/");
    }

    const conversation = await getOrCreateConversations(currentMember.id, params.memberId);

    if (!conversation) {
        return redirect(`/servers/${params.serverId}`);
    }

    const { memberOne, memberTwo } = conversation;

    const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne

    return (
        <div className="flex flex-col h-full">
            <ChatHeader
                serverId={params.serverId}
                name={otherMember.profile.name}
                type="conversation"
                imageUrl={otherMember.profile.imageUrl}
            />
            <ChatMessages
                name={otherMember.profile.name}
                member={currentMember}
                chatId={conversation.id}
                apiUrl="/api/direct-messages"
                socketUrl="/api/socket/direct-messages"
                socketQuery={{ conversationId: conversation.id }}
                paramKey="conversationId"
                paramValue={conversation.id}
                type="conversation"
            />
            <ChatInput
                apiUrl="/api/socket/direct-messages"
                query={{ conversationId: conversation.id }}
                name={otherMember.profile.name}
                type="conversation"
            />
        </div>
    );
}
import { redirect } from "next/navigation";

import { ChannelType } from "@prisma/client";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import ServerHeader from "@/components/server/server-header";

interface ServerSidebarProps {
    serverId: string;
}

export default async function ServerSidebar({
    serverId
}: ServerSidebarProps
) {
    const profile = await currentProfile();

    if (!profile)
        return redirect("/");

    const server = await db.server.findUnique({
        where: {
            id: serverId
        },
        include: {
            channels: {
                orderBy: {
                    createdAt: "asc"
                }
            },
            members: {
                include: {
                    profile: true
                },
                orderBy: {
                    role: "asc" 
                }
            }
        }
    });

    const  textChannels = server?.channels.filter(channel => channel.type === ChannelType.TEXT);
    const  audioChannels = server?.channels.filter(channel => channel.type === ChannelType.AUDIO);
    const  videoChannels = server?.channels.filter(channel => channel.type === ChannelType.VIDEO);

    const members = server?.members.filter(member => member.profileId !== profile.id);

    if (!server) {
        return redirect("/");
    }

    const role = server.members.find(member => member.profileId === profile.id)?.role;

    return (
        <div className="w-full h-full flex flex-col text-primary bg-primary/25 dark:bg-secondary/80">
            <ServerHeader 
                server={server}
                role={role} 
            />
        </div>
    );
}
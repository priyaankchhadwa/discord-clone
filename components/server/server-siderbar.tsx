import { redirect } from "next/navigation";
import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import ServerHeader from "@/components/server/server-header";
import ServerSearch from "@/components/server//server-search";
import ServerSection from "@/components/server/server-section";
import ServerChannel from "@/components/server/server-channel";
import ServerMember from "@/components/server/server-member";

interface ServerSidebarProps {
    serverId: string;
}

const iconMap = {
    [ChannelType.TEXT]: <Hash className="mr-2 w-4 h-4"/>,
    [ChannelType.AUDIO]: <Mic className="mr-2 w-4 h-4"/>,
    [ChannelType.VIDEO]: <Video className="mr-2 w-4 h-4"/>,
}

const roleIconMap = {
    [MemberRole.ADMIN]: <ShieldAlert className="mr-2 w-4 h-4 text-rose-500"/>,
    [MemberRole.MODERATOR]: <ShieldCheck className="mr-2 w-4 h-4 text-purple-500"/>,
    [MemberRole.GUEST]: null,
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
        <div className="w-full h-full flex flex-col text-primary bg-primary/15 dark:bg-secondary/80">
            <ServerHeader 
                server={server}
                role={role} 
            />
            <ScrollArea className="flex-1 px-3">
                <div className="mt-2">
                    <ServerSearch
                        data={[
                            {
                                label: "Text Channels",
                                type: "channel",
                                data: textChannels?.map(channel => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },{
                                label: "Audio Channels",
                                type: "channel",
                                data: audioChannels?.map(channel => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },{
                                label: "Video Channels",
                                type: "channel",
                                data: videoChannels?.map(channel => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },{
                                label: "Members",
                                type: "member",
                                data: members?.map(member => ({
                                    id: member.id,
                                    name: member.profile.name,
                                    icon: roleIconMap[member.role]
                                }))
                            },
                        ]}
                    />
                </div>
                <Separator className="my-2 rounded-md bg-accent-foreground/15" />
                {!!textChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType={ChannelType.TEXT}
                            label="Text Channels"
                            role={role}
                        />
                        <div className="space-y-2">
                            {textChannels.map(channel => (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    server={server}
                                    role={role}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!audioChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType={ChannelType.AUDIO}
                            label="Audio Channels"
                            role={role}
                        />
                        <div className="space-y-2">
                            {audioChannels.map(channel => (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    server={server}
                                    role={role}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!videoChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType={ChannelType.VIDEO}
                            label="Video Channels"
                            role={role}
                        />
                        <div className="space-y-2">
                            {videoChannels.map(channel => (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    server={server}
                                    role={role}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!members?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="members"
                            label="Members"
                            role={role}
                            server={server}
                        />
                        <div className="space-y-2">
                            {members.map(member => (
                                <ServerMember
                                    key={member.id}
                                    member={member}
                                    server={server}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
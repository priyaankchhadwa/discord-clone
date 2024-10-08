"use client"

import qs from "query-string";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";


export default function DeleteChannelModal() {
    const {isOpen, onOpen, onClose, type, data} = useModal();
    const router = useRouter();

    const isModalOpen = isOpen && type === "deleteChannel";
    const { server, channel } = data;

    const [isLoading, setIsLoading ] = useState(false);

    const onConfirm = async () => {
        try {
            setIsLoading(true);

            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id
                }
            })

            await axios.delete(url);
            onClose();
            // router.refresh();
            router.push(`/servers/${server?.id}`);
            router.refresh();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="p-0 overflow-hidden">
                <DialogHeader className="flex items-center text-center justify-center pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Delete Channel
                    </DialogTitle>
                    <DialogDescription className="text-center text-primary">
                        Are you sure you want to do this? <br />
                        <span className="font-semibold text-purple-500">#{channel?.name}</span> will be permanently deleted.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="px-6 py-4">
                    <div className="w-full flex justify-between items-center">
                        <Button
                            disabled={isLoading}
                            onClick={onClose}
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isLoading}
                            onClick={onConfirm}
                            variant="destructive"
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
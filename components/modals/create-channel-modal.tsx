"use client";

import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { 
    Select,
    SelectContent,
    SelectTrigger,
    SelectItem,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useModal } from "@/hooks/use-modal-store";
import { ChannelType } from "@prisma/client";
import { useEffect } from "react";

const formSchema = z.object({
    name: z.string().min(1, 
        { message: "Channel name is required" 
        }).refine(
            name => name !== "general",
            { message: "Channel name cannot be 'general'" }
        ),
    type: z.nativeEnum(ChannelType)
});

export default function CreateChannelModal() {
    const {isOpen, onClose, type, data} = useModal();
    const router = useRouter();
    const params = useParams();

    const isModalOpen = isOpen && type === "createChannel";
    const { channelType } = data;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: channelType || ChannelType.TEXT
        },
    });

    const isLoading = form.formState.isSubmitting;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const url = qs.stringifyUrl({
                url: "/api/channels",
                query: {
                    serverId: params?.serverId
                }
            });
            await axios.post(url, values);

            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (channelType) {
            form.setValue("type", channelType);
        }
    }, [form, channelType]);

    const handleClose = () => {
        form.reset();
        onClose();
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader className="flex items-center text-center justify-center">
                    <DialogTitle>
                        Create Channel
                    </DialogTitle>
                    <DialogDescription>
                        Customize your server with a name and an image
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-8">
                        <div className="space-y-8">
                            <FormField 
                                control={form.control} 
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Channel Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Some Channel"
                                                className="input-bordered input"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Channel Type</FormLabel>
                                        <Select
                                            disabled={isLoading}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className="text-primary capitalize"
                                                >
                                                    <SelectValue placeholder="Select a channel type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(ChannelType).map((type) => (
                                                    <SelectItem
                                                        key={type}
                                                        value={type}
                                                        className="capitalize"
                                                    >
                                                        {type.toLowerCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button disabled={isLoading}>Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
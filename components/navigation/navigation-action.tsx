"use client"

import { Plus } from "lucide-react";

import { ActionTooltip } from "@/components/action-tooltip";

export default function NavigationAction() {
    return (
        <div>
            <ActionTooltip
                label="Create Server"
                side="right"
                align="center"
            >
                <button className="group flex items-center">
                    <div className="flex mx-2 h-12 w-12 rounded-3xl group-hover:rounded-2xl transition-all overflow-hidden items-center justify-center bg-background group-hover:bg-emerald-500">
                        <Plus className="group-hover:text-white transition text-emerald-500"
                            size={25}
                        />
                    </div>
                </button>
            </ActionTooltip>
        </div>
    );
}
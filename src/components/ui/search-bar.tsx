"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar({
    value,
    onChange,
    placeholder = "Search events..."
}: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}) {
    return (
        <div className="relative mb-8 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-acid h-12 rounded-full"
                placeholder={placeholder}
            />
        </div>
    );
}

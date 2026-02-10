"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function CustomSelect({
    options,
    value,
    onChange,
    placeholder = "Select option",
    className,
    disabled = false,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-acid disabled:cursor-not-allowed disabled:opacity-50",
                    !selectedOption && "text-zinc-500"
                )}
                disabled={disabled}
            >
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <span className="material-symbols-outlined text-zinc-400 text-lg">
                    unfold_more
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-white/10 bg-zinc-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={cn(
                                "relative cursor-default select-none py-2 pl-3 pr-9 text-white hover:bg-white/10 cursor-pointer",
                                value === option.value && "bg-acid/20 text-acid"
                            )}
                            onClick={() => handleSelect(option.value)}
                        >
                            <span className={cn("block truncate", value === option.value && "font-semibold")}>
                                {option.label}
                            </span>
                            {value === option.value && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-acid">
                                    <span className="material-symbols-outlined text-lg">check</span>
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

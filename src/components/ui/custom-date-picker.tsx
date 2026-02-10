"use client";

import React, { useState, useRef, useEffect } from "react";

interface CustomDatePickerProps {
    value: string;
    onChange: (date: string) => void;
    className?: string;
}

export function CustomDatePicker({ value, onChange, className = "" }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return "dd-mm-yyyy";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const handleDateClick = (day: number) => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const selectedDate = new Date(year, month, day);
        const formattedDate = selectedDate.toISOString().split("T")[0];
        onChange(formattedDate);
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleToday = () => {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        onChange(formattedDate);
        setCurrentMonth(today);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange("");
        setIsOpen(false);
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const selectedDate = value ? new Date(value) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Input Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-3 text-sm rounded-full bg-[#1a1d1f] border ${value ? "border-acid/50" : "border-[#2a2d2f]"
                    } text-white font-bold focus:outline-none focus:ring-2 focus:ring-acid/50 focus:border-acid transition-all hover:border-acid/30 flex items-center justify-between group`}
            >
                <span className={value ? "text-white" : "text-gray-500"}>
                    {formatDisplayDate(value)}
                </span>
                <span className="material-symbols-outlined text-lg text-acid">
                    calendar_today
                </span>
            </button>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d1f] border border-[#2a2d2f] rounded-xl overflow-hidden shadow-2xl shadow-black/50 z-50 p-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-acid/20 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-acid">chevron_left</span>
                        </button>
                        <h3 className="text-sm font-bold text-white">{monthName}</h3>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-acid/20 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-acid">chevron_right</span>
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                            <div key={day} className="text-center text-xs font-bold text-gray-400 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for days before month starts */}
                        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                            <div key={`empty-${index}`} className="aspect-square" />
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: daysInMonth }).map((_, index) => {
                            const day = index + 1;
                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                            date.setHours(0, 0, 0, 0);

                            const isSelected =
                                selectedDate &&
                                date.getTime() === selectedDate.getTime();
                            const isToday = date.getTime() === today.getTime();

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDateClick(day)}
                                    className={`aspect-square flex items-center justify-center text-sm font-semibold rounded-lg transition-all ${isSelected
                                            ? "bg-acid text-black"
                                            : isToday
                                                ? "bg-acid/20 text-acid border border-acid/50"
                                                : "text-white hover:bg-acid/20 hover:text-acid"
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#2a2d2f]">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="flex-1 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleToday}
                            className="flex-1 py-2 text-xs font-semibold text-acid hover:bg-acid/20 rounded-lg transition-all"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

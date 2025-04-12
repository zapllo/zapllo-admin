import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';

type Props = {
    onDateFilterChange: (filter: string, dateRange?: { from: Date; to: Date }) => void;
};

export default function DateFilters({ onDateFilterChange }: Props) {
    const [selectedFilter, setSelectedFilter] = useState("All Time");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const timeFilters = [
        "Today", "Yesterday", "This Week", "Last Week", "This Month", "Last Month", "This Year", "All Time"
    ];

    const handleFilterChange = (filter: string) => {
        // Clear custom date range if selecting a predefined filter
        if (filter !== "Custom") {
            setDateRange(undefined);
        }

        setSelectedFilter(filter);
        onDateFilterChange(filter);
    };

    const handleCustomDateSelect = (range: DateRange | undefined) => {
        setDateRange(range);
    };

    const applyCustomDateRange = () => {
        if (dateRange?.from) {
            setSelectedFilter("Custom");

            // Ensure we have both from and to dates (if to is not selected, use from as to)
            const fromDate = new Date(dateRange.from);
            const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);

            // Set time to start of day for from and end of day for to
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 999);

            onDateFilterChange("Custom", { from: fromDate, to: toDate });
            setIsCalendarOpen(false);
        }
    };

    const clearCustomDateRange = () => {
        setDateRange(undefined);
        handleFilterChange("All Time");
    };

    return (
        <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2 mt-8">
                {timeFilters.map((filter) => (
                    <Button
                        key={filter}
                        variant={selectedFilter === filter ? "default" : "ghost"}
                        onClick={() => handleFilterChange(filter)}
                        className={selectedFilter === filter
                            ? "text-xs h-7 text-white bg-[#5b46d9] hover:bg-[#4a3bb8]"
                            : "text-gray-600 h-7 border text-xs border-gray-300 hover:text-gray-700 hover:bg-gray-50"}
                    >
                        {filter}
                    </Button>
                ))}

                {/* Custom Date Range Picker */}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={selectedFilter === "Custom" ? "default" : "ghost"}
                            className={cn(
                                "text-xs h-7 border border-gray-300",
                                selectedFilter === "Custom"
                                    ? "text-white bg-[#5b46d9] hover:bg-[#4a3bb8]"
                                    : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            {selectedFilter === "Custom" && dateRange?.from ? (
                                <span>
                                    {format(dateRange.from, "MMM dd")} - {dateRange.to ? format(dateRange.to, "MMM dd") : format(dateRange.from, "MMM dd")}
                                </span>
                            ) : (
                                <>
                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                    Custom
                                </>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={handleCustomDateSelect}
                            numberOfMonths={2}
                            className="border-0"
                        />
                        <div className="flex items-center justify-between p-3 border-t border-gray-100">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(undefined);
                                    setIsCalendarOpen(false);
                                }}
                                className="text-gray-500"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={applyCustomDateRange}
                                disabled={!dateRange?.from}
                                className="bg-[#5b46d9] hover:bg-[#4a3bb8]"
                            >
                                Apply Range
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Clear custom filter button */}
                {selectedFilter === "Custom" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCustomDateRange}
                        className="text-xs h-7 text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}

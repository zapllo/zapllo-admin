import React, { useState } from 'react';
import { Button } from '../ui/button';

type Props = {
    onDateFilterChange: (filter: string) => void;
};

export default function DateFilters({ onDateFilterChange }: Props) {
    const [selectedFilter, setSelectedFilter] = useState("All Time");
    
    const timeFilters = [
        "Today", "Yesterday", "This Week", "Last Week", "This Month", "Last Month", "This Year", "All Time", "Custom",
    ];

    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
        onDateFilterChange(filter); // Only sends filter key, no date calculations
    };

    return (
        <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2 mt-12">
                {timeFilters.map((filter) => (
                    <Button
                        key={filter}
                        variant={selectedFilter === filter ? "default" : "ghost"}
                        onClick={() => handleFilterChange(filter)}
                        className={selectedFilter === filter ? "bg-transparent border text-white" : "text-gray-400 hover:text-gray-400 hover:bg-transparent"}
                    >
                        {filter}
                    </Button>
                ))}
            </div>
        </div>
    );
}

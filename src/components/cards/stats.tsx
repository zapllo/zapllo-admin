import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { ArrowUp, ArrowDown, ClipboardList, CircleCheck, Building2, Users, UserPlus, Briefcase, Group, LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type StatsProps = {
  statsData: {
    totalTasks: number;
    completedTasks: number;
    totalOrganizations: number;
    totalUsers: number;
    subscribedUsers?: number;
    taskUsers?: number;
    addedUsers?: number;
  };
};

// Animated counter component
const CounterAnimation = ({ value, duration = 1500 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    const increment = value / totalFrames;

    let currentFrame = 0;
    const counter = setInterval(() => {
      currentFrame++;
      setCount(Math.min(Math.floor(increment * currentFrame), value));
      if (currentFrame === totalFrames) {
        clearInterval(counter);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
};

// Sparkline component (simulated)
const Sparkline = ({ trend = "up", color }: { trend?: "up" | "down" | "flat"; color: string }) => {
  // Generate random points for the sparkline
  const generatePoints = () => {
    const points = [];
    const height = 20;
    const width = 50;
    const segments = 10;

    for (let i = 0; i <= segments; i++) {
      const x = (i * width) / segments;
      let y;

      if (trend === "up") {
        y = height - (i / segments) * height * (0.8 + Math.random() * 0.4);
      } else if (trend === "down") {
        y = (i / segments) * height * (0.8 + Math.random() * 0.4);
      } else {
        y = height / 2 + (Math.random() * height * 0.4 - height * 0.2);
      }

      points.push(`${x},${y}`);
    }

    return points.join(" ");
  };

  return (
    <svg width="50" height="20" className="ml-2">
      <polyline
        points={generatePoints()}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function Stats({ statsData }: StatsProps) {
  // Add simulated data for new metrics
  const enhancedStatsData = {
    ...statsData,
    subscribedUsers: statsData.subscribedUsers || Math.floor(statsData.totalUsers * 0.75),
    taskUsers: statsData.taskUsers || Math.floor(statsData.totalUsers * 0.68),
    addedUsers: statsData.addedUsers || Math.floor(statsData.totalUsers * 0.12)
  };

  // Calculate percentages and trends
  const completionRate = Math.round((enhancedStatsData.completedTasks / enhancedStatsData.totalTasks) * 100);
  const subscriptionRate = Math.round((enhancedStatsData.subscribedUsers / enhancedStatsData.totalUsers) * 100);
  const taskUserRate = Math.round((enhancedStatsData.taskUsers / enhancedStatsData.totalUsers) * 100);

  const cards = [
    {
      title: "Total Tasks",
      value: enhancedStatsData.totalTasks,
      icon: <ClipboardList className="h-5 w-5 text-indigo-600" />,
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50",
      borderColor: "border-indigo-100",
      textColor: "text-indigo-700",
      trend: "up" as const,
      trendColor: "text-emerald-500",
      trendValue: "+14.5%",
      sparklineColor: "#6366f1"
    },
    {
      title: "Tasks Completed",
      value: enhancedStatsData.completedTasks,
      percent: completionRate,
      icon: <CircleCheck className="h-5 w-5 text-emerald-600" />,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      borderColor: "border-emerald-100",
      textColor: "text-emerald-700",
      trend: "up" as const,
      trendColor: "text-emerald-500",
      trendValue: "+7.2%",
      sparklineColor: "#10b981"
    },
    {
      title: "Companies",
      value: enhancedStatsData.totalOrganizations,
      icon: <Building2 className="h-5 w-5 text-violet-600" />,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-violet-50 to-purple-50",
      borderColor: "border-violet-100",
      textColor: "text-violet-700",
      trend: "up" as const,
      trendColor: "text-emerald-500",
      trendValue: "+3.8%",
      sparklineColor: "#8b5cf6"
    },
    {
      title: "Total Users",
      value: enhancedStatsData.totalUsers,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      color: "from-blue-500 to-sky-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-sky-50",
      borderColor: "border-blue-100",
      textColor: "text-blue-700",
      trend: "up" as const,
      trendColor: "text-emerald-500",
      trendValue: "+5.1%",
      sparklineColor: "#3b82f6"
    },
    {
      title: "Subscribed Users",
      value: enhancedStatsData.subscribedUsers,
      percent: subscriptionRate,
      icon: <Group className="h-5 w-5 text-amber-600" />,
      color: "from-amber-500 to-yellow-500",
      bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
      borderColor: "border-amber-100",
      textColor: "text-amber-700",
      trend: "up" as const,
      trendColor: "text-emerald-500",
      trendValue: "+6.3%",
      sparklineColor: "#f59e0b"
    },
    {
      title: "Task Users",
      value: enhancedStatsData.taskUsers,
      percent: taskUserRate,
      icon: <Briefcase className="h-5 w-5 text-fuchsia-600" />,
      color: "from-fuchsia-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-fuchsia-50 to-pink-50",
      borderColor: "border-fuchsia-100",
      textColor: "text-fuchsia-700",
      trend: "up" as const,
      trendColor: "text-emerald-500",
      trendValue: "+2.7%",
      sparklineColor: "#d946ef"
    },
    {
      title: "Added Users",
      value: enhancedStatsData.addedUsers,
      icon: <UserPlus className="h-5 w-5 text-cyan-600" />,
      color: "from-cyan-500 to-teal-500",
      bgColor: "bg-gradient-to-br from-cyan-50 to-teal-50",
      borderColor: "border-cyan-100",
      textColor: "text-cyan-700",
      trend: "down" as const,
      trendColor: "text-red-500",
      trendValue: "-1.2%",
      sparklineColor: "#06b6d4"
    },
    {
      title: "Completion Rate",
      value: completionRate,
      isPercent: true,
      icon: <LineChart className="h-5 w-5 text-rose-600" />,
      color: "from-rose-500 to-red-500",
      bgColor: "bg-gradient-to-br from-rose-50 to-red-50",
      borderColor: "border-rose-100",
      textColor: "text-rose-700",
      trend: "up" as const,
      trendColor: "text-emerald-500",
      trendValue: "+0.5%",
      sparklineColor: "#f43f5e"
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="col-span-1"
          >
            <Card className={`${card.bgColor} border ${card.borderColor} shadow-sm overflow-hidden h-full`}>
              <div className={`h-1 w-full bg-gradient-to-r ${card.color}`} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`rounded-md bg-white bg-opacity-60 p-1.5 ${card.textColor}`}>
                    {card.icon}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <span className={`text-xs font-medium ${card.trendColor}`}>
                          {card.trend === "up" ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                          {card.trendValue}
                        </span>
                        <Sparkline trend={card.trend} color={card.sparklineColor} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Change in last 30 days</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">{card.title.toUpperCase()}</p>
                  <div className="flex items-baseline">
                    <p className={`text-xl lg:text-2xl font-bold ${card.textColor}`}>
                      <CounterAnimation value={card.value} duration={1200 + index * 100} />
                      {card.isPercent && '%'}
                    </p>
                    {card.percent && (
                      <span className="ml-2 text-xs text-gray-500">({card.percent}%)</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </TooltipProvider>
  );
}

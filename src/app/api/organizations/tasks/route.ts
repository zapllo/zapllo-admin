// /src/app/api/organizations/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Organization from "@/models/organizationModel";
import Task from "@/models/taskModal";
import User from "@/models/userModel";
import Order from "@/models/orderModel";

connectDB();

export async function GET(request: NextRequest) {
    try {
        // Fetch all organizations
        const organizations = await Organization.find({});

        const totalOrganizations = organizations.length;

        let totalTasksAcrossOrgs = 0;
        let completedTasksAcrossOrgs = 0;
        let totalUsersAcrossOrgs = 0;

        const organizationData = await Promise.all(
            organizations.map(async (org, index) => {
                // Fetch tasks related to the organization
                const tasks = await Task.find({ organization: org._id });

                const totalTasks = tasks.length;
                const completedTasks = tasks.filter((task) => task.status === "Completed").length;
                const incompleteTasks = totalTasks - completedTasks;
                const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;


                // Increment aggregate counters
                totalTasksAcrossOrgs += totalTasks;
                completedTasksAcrossOrgs += completedTasks;


                // Fetch users and identify the orgAdmin
                const users = await User.find({ organization: org._id });
                totalUsersAcrossOrgs += users.length;
                const orgAdmin = users.find((user) => user.role === "orgAdmin");

                // Fetch orders associated with this organization
                const orders = await Order.find({ userId: { $in: users.map((user) => user._id) } });

                // Count users with `isTaskAccess` enabled in the organization
                const taskAccessCount = users.filter((user) => user.isTaskAccess).length;

                // Calculate subscribers and format output for each order
                const ordersData = orders.map((order) => ({
                    subscribedUserCount: order.subscribedUserCount,
                    taskAccessCount: `${taskAccessCount}/${order.subscribedUserCount}`,
                }));

                return {
                    rank: index + 1,
                    organizationId: org._id,
                    companyName: org.companyName,
                    orgAdmin: orgAdmin ? `${orgAdmin.firstName} ${orgAdmin.lastName}` : "N/A",
                    totalTasks: `${completedTasks}/${totalTasks}`,
                    createdAt: org.createdAt,
                    completionPercentage: Math.round(completionPercentage),
                    renewalDate: org.subscriptionExpires ? org.subscriptionExpires.toLocaleDateString() : "N/A",
                    orders: ordersData,
                    isPro: org.isPro,
                    subscriptionExpires: org.subscriptionExpires,
                    trialExpires: org.trialExpires,
                    tasks: tasks.map(task => ({ createdAt: task.createdAt, status: task.status })),
                    users: users.map(user => ({ createdAt: user.createdAt })),
                };
            })
        );



        return NextResponse.json({
            message: "Organization task and user data fetched successfully",
            data: organizationData,
            summary: {
                totalOrganizations,
                totalTasksAcrossOrgs,
                completedTasksAcrossOrgs,
                totalUsersAcrossOrgs,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

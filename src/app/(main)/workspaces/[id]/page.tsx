'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/sidebar/adminSidebar';
import InfoBar from '@/components/infobar/infobar';
import {
  Building, Calendar, Clock, CreditCard, Info, PlusCircle,
  Shield, Trash2, Users, Wallet, Eye, EyeOff, Pencil, MoreVertical
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function OrganizationDetailsPage() {
    const { id } = useParams();
    const [organization, setOrganization] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        whatsappNo: '',
        role: 'member',
    });
    const [revokeOpen, setRevokeOpen] = useState(false);
    const [orgCredits, setOrgCredits] = useState<number | undefined>(0);
    const [extendOpen, setExtendOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [extensionDays, setExtensionDays] = useState<number | undefined>();
    const [updateCreditsOpen, setUpdateCreditsOpen] = useState(false);
    const [newCredits, setNewCredits] = useState<number | undefined>();
    const [users, setUsers] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [viewUserDetails, setViewUserDetails] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const usersPerPage = 10;
    const router = useRouter();

    // Fetch organization data
    useEffect(() => {
        if (!id) return;

        const fetchOrganization = async () => {
            try {
                const res = await fetch(`/api/organizations/${id}`);

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch organization');
                }

                const { organization, stats } = await res.json();

                if (!organization) {
                    throw new Error('Organization not found');
                }

                setOrganization(organization);
                setOrgCredits(organization.credits || 0);
                setStats(stats || {
                    totalUsers: 0,
                    totalTasks: 0,
                    completedTasksPercentage: 0,
                    pendingTickets: 0,
                    resolvedTickets: 0
                });

                // Fetch additional data
                await fetchUsers();
                await fetchTasks();
                await fetchTickets();
            } catch (err: any) {
                setError(err.message);
                console.error('Error fetching organization:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganization();
    }, [id]);

    // Fetch users for this organization
    const fetchUsers = async (page = 1) => {
        if (!id) return;

        setLoadingUsers(true);
        try {
            const res = await fetch(`/api/organizations/${id}/users?page=${page}&limit=${usersPerPage}`);
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data.users || []);
            setTotalPages(Math.ceil(data.total / usersPerPage) || 1);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    // Fetch tasks for this organization
    const fetchTasks = async () => {
        if (!id) return;

        setLoadingTasks(true);
        try {
            const res = await fetch(`/api/organizations/${id}/tasks`);
            if (!res.ok) throw new Error('Failed to fetch tasks');
            const data = await res.json();
            setTasks(data.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // Don't show toast for this to reduce notification clutter
        } finally {
            setLoadingTasks(false);
        }
    };

    // Fetch tickets for this organization
    const fetchTickets = async () => {
        if (!id) return;

        setLoadingTickets(true);
        try {
            const res = await fetch(`/api/organizations/${id}/tickets`);
            if (!res.ok) throw new Error('Failed to fetch tickets');
            const data = await res.json();
            setTickets(data.tickets || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            // Don't show toast for this to reduce notification clutter
        } finally {
            setLoadingTickets(false);
        }
    };

    // Calculate days remaining for trial
    const calculateDaysRemaining = () => {
        if (!organization || !organization.trialExpires) return 0;

        const daysRemaining = Math.max(
            0,
            Math.ceil(
                (new Date(organization.trialExpires).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
        );
        return daysRemaining;
    };

    const handleExtendTrial = async () => {
        try {
            if (!extensionDays || extensionDays <= 0) {
                toast.error("Please enter a valid number of days to extend");
                return;
            }

            const res = await fetch('/api/organizations/admin', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizationId: id, extensionDays }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to extend trial period.");
            }

            const data = await res.json();
            toast.success("Trial period extended successfully!");
            setExtendOpen(false);
            setExtensionDays(undefined);

            // Refresh organization data
            const resOrg = await fetch(`/api/organizations/${id}`);
            if (!resOrg.ok) {
                throw new Error("Failed to refresh organization data");
            }
            const { organization } = await resOrg.json();
            setOrganization(organization);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const updateWalletBalance = async () => {
        try {
            if (newCredits === undefined) {
                toast.error("Please enter a valid amount");
                return;
            }

            const res = await fetch('/api/organizations/admin', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizationId: id, credits: newCredits }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update wallet balance.");
            }

            const data = await res.json();
            toast.success("Wallet balance updated successfully!");
            setUpdateCreditsOpen(false);
            setOrgCredits(newCredits);

            // Refresh organization data
            const resOrg = await fetch(`/api/organizations/${id}`);
            if (!resOrg.ok) {
                throw new Error("Failed to refresh organization data");
            }
            const { organization } = await resOrg.json();
            setOrganization(organization);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const revokeTrialPeriod = async () => {
        try {
            const res = await fetch('/api/organizations/admin', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizationId: id, revoke: true }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to revoke trial period.");
            }

            const data = await res.json();
            toast.success('Trial period revoked successfully');
            setRevokeOpen(false);

            // Refresh organization data
            const resOrg = await fetch(`/api/organizations/${id}`);
            if (!resOrg.ok) {
                throw new Error("Failed to refresh organization data");
            }
            const { organization } = await resOrg.json();
            setOrganization(organization);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleAddUser = async () => {
        try {
            // Simple validation
            if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.whatsappNo) {
                toast.error("Please fill in all fields");
                return;
            }

            const res = await fetch(`/api/organizations/${id}/add-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            const data = await res.json();

            if (!res.ok && !data.partialSuccess) {
                throw new Error(data.error || 'Failed to add user');
            }

            // Handle partial success (user created but notification failed)
            if (data.partialSuccess) {
                toast.success('User added successfully, but notification delivery failed');
            } else {
                toast.success('User added successfully');
            }

            setDialogOpen(false);

            // Reset form
            setNewUser({
                firstName: '',
                lastName: '',
                email: '',
                whatsappNo: '',
                role: 'member',
            });

            // Refetch users
            fetchUsers();

            // Refetch organization details
            const resOrg = await fetch(`/api/organizations/${id}`);
            if (!resOrg.ok) {
                throw new Error("Failed to refresh organization data");
            }
            const { organization, stats } = await resOrg.json();
            setOrganization(organization);
            setStats(stats);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteOrganization = async () => {
        try {
            const res = await fetch(`/api/organizations/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizationId: id }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete organization.");
            }
            toast.success("Organization and associated users deleted successfully.");
            router.replace('/workspaces');
            setDeleteOpen(false);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setEditUserOpen(true);
    };

    const handleUpdateUser = async () => {
        try {
            if (!selectedUser) return;

            // Simple validation
            if (!selectedUser.firstName || !selectedUser.lastName || !selectedUser.email || !selectedUser.whatsappNo) {
                toast.error("Please fill in all required fields");
                return;
            }

            const res = await fetch(`/api/organizations/${id}/users/${selectedUser._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: selectedUser.firstName,
                    lastName: selectedUser.lastName,
                    email: selectedUser.email,
                    whatsappNo: selectedUser.whatsappNo,
                    role: selectedUser.role,
                    status: selectedUser.status
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update user');
            }

            toast.success('User updated successfully');
            setEditUserOpen(false);
            fetchUsers(); // Refresh the user list
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const confirmDeleteUser = (userId: string) => {
        setUserToDelete(userId);
        setDeleteUserDialog(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const res = await fetch(`/api/organizations/${id}/users/${userToDelete}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete user');
            }

            toast.success('User deleted successfully');
            setDeleteUserDialog(false);
            setUserToDelete(null);
            // Refresh user list
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const toggleUserStatus = async (userId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Deactivated' : 'Active';

            const res = await fetch(`/api/organizations/${id}/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update user status');
            }

            toast.success(`User ${newStatus.toLowerCase()} successfully`);
            fetchUsers(); // Refresh the user list
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-screen">
            <Alert variant="destructive" className="max-w-md">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    );

    if (!organization) return (
        <div className="flex items-center justify-center h-screen">
            <Alert variant="destructive" className="max-w-md">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Organization not found</AlertDescription>
            </Alert>
        </div>
    );

    const daysRemaining = calculateDaysRemaining();
    const trialStatus = daysRemaining > 0 ? 'active' : 'expired';

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className={`flex h-full w-full`}>
                <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                <div className="w-full overflow-y-auto">
                    <InfoBar />

                    <div className="flex mt-12 w-full max-w-9xl">
                        <div
                            className={`${isCollapsed ? 'ml-16' : 'ml-64'} p-6 w-full`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800">Organization Overview</h1>
                                    <p className="text-gray-500">Manage organization, users, and subscriptions</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setUpdateCreditsOpen(true)}
                                        className="bg-white hover:bg-gray-100 text-primary border border-gray-200"
                                    >
                                        <Wallet className="h-4 w-4 mr-2" />
                                        Update Balance
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        onClick={() => setDeleteOpen(true)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                {/* Organization Info Card */}
                                <Card className="col-span-2 shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-2xl">{organization.companyName}</CardTitle>
                                                    <Badge variant={trialStatus === 'active' ? 'outline' : 'destructive'}>
                                                        {trialStatus === 'active'
                                                            ? `Trial: ${daysRemaining} days left`
                                                            : 'Trial expired'}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="mt-1">{organization.industry} • {organization.teamSize} employees</CardDescription>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => setExtendOpen(true)}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    Extend Trial
                                                </Button>

                                                <Button
                                                    onClick={() => setRevokeOpen(true)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="bord hover:bg-destructive/10"
                                                >
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    Revoke Trial
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                                            <p className="text-gray-700">{organization.description || "No description available"}</p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mt-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Registered</h3>
                                                <p className="text-gray-700">{organization.createdAt ? format(new Date(organization.createdAt), "MMM d, yyyy") : "Unknown"}</p>
                                                <p className="text-xs text-gray-500">{organization.createdAt ? formatDistanceToNow(new Date(organization.createdAt), { addSuffix: true }) : "Unknown"}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Subscription</h3>
                                                <p className="text-gray-700">{organization.subscribedPlan || "No Plan"}</p>
                                                <p className="text-xs text-gray-500">{organization.subscriptionExpires ? formatDistanceToNow(new Date(organization.subscriptionExpires), { addSuffix: true }) : "Not subscribed"}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                                                <p className="text-gray-700">{organization.country || "Not specified"}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Wallet Card */}
                                <Card className="shadow-sm bg-gradient-to-br from-white to-gray-50">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Organization Wallet</CardTitle>
                                        <CardDescription>Balance and subscription details</CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Current Balance</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl font-bold">₹{orgCredits}</span>
                                                <Button
                                                    onClick={() => setUpdateCreditsOpen(true)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2"
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Subscription</h3>
                                            <p className="text-xl font-medium">{organization.subscribedPlan || "No active plan"}</p>
                                            {organization.subscriptionExpires && (
                                                <p className="text-sm text-gray-500">
                                                    Expires: {format(new Date(organization.subscriptionExpires), "MMM d, yyyy")}
                                                </p>
                                            )}
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Subscribed Users</h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-medium">{organization.subscribedUserCount || 0}</span>
                                                <span className="text-sm text-gray-500">out of {stats?.totalUsers || 0}</span>
                                            </div>
                                            <Progress
                                                value={stats?.totalUsers ? (organization.subscribedUserCount ? (organization.subscribedUserCount / stats.totalUsers) * 100 : 0) : 0}
                                                className="h-2 mt-2"
                                            />
                                        </div>
                                    </CardContent>

                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                        >
                                            Renew Subscription
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>

                            {/* Organization Stats */}
                            <Tabs defaultValue="overview" className="mb-6">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="users">Users</TabsTrigger>
                                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                                    <TabsTrigger value="tickets">Tickets</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview">
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center">
                                                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                                                    <span className="text-2xl font-bold">{stats?.totalUsers || 0}</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center">
                                                    <Calendar className="h-5 w-5 text-green-500 mr-2" />
                                                    <span className="text-2xl font-bold">{stats?.totalTasks || 0}</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-gray-500">Completed Tasks</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center">
                                                    <Calendar className="h-5 w-5 text-green-500 mr-2" />
                                                    <span className="text-2xl font-bold">{stats?.completedTasksPercentage || 0}%</span>
                                                </div>
                                                <Progress
                                                    value={stats?.completedTasksPercentage || 0}
                                                    className="h-1 mt-2"
                                                />
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-gray-500">Subscribed Users</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center">
                                                    <Users className="h-5 w-5 text-purple-500 mr-2" />
                                                    <span className="text-2xl font-bold">{organization.subscribedUserCount || 0}</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-gray-500">Pending Tickets</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center">
                                                    <Info className="h-5 w-5 text-amber-500 mr-2" />
                                                    <span className="text-2xl font-bold">{stats?.pendingTickets || 0}</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-gray-500">Resolved Tickets</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center">
                                                    <Info className="h-5 w-5 text-blue-500 mr-2" />
                                                    <span className="text-2xl font-bold">{stats?.resolvedTickets || 0}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="users">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>Users</CardTitle>
                                                <CardDescription>Manage organization users</CardDescription>
                                            </div>
                                            <Button onClick={() => setDialogOpen(true)}>
                                                <PlusCircle className="h-4 w-4 mr-2" />
                                                Add User
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {loadingUsers ? (
                                                <div className="flex justify-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                </div>
                                            ) : users.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                    <p>No users found in this organization</p>
                                                    <Button
                                                        variant="link"
                                                        onClick={() => setDialogOpen(true)}
                                                        className="mt-2"
                                                    >
                                                        Add your first user
                                                    </Button>
                                                </div>
                                      ) : (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>User</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>WhatsApp</TableHead>
                                                        <TableHead>Role</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {users.map((user) => (
                                                        <TableRow key={user._id}>
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-8 w-8">
                                                                        {user.profilePic ? (
                                                                            <AvatarImage src={user.profilePic} alt={`${user.firstName} ${user.lastName}`} />
                                                                        ) : (
                                                                            <AvatarFallback>
                                                                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                                            </AvatarFallback>
                                                                        )}
                                                                    </Avatar>
                                                                    <span>{user.firstName} {user.lastName}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{user.email}</TableCell>
                                                            <TableCell>{user.whatsappNo}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={user.role === 'orgAdmin' ? 'default' : 'outline'}>
                                                                    {user.role === 'orgAdmin' ? 'Admin' : user.role === 'manager' ? 'Manager' : 'Member'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge >
                                                                    {user.status || 'Active'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                                            <span className="sr-only">Open menu</span>
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => {
                                                                            setSelectedUser(user);
                                                                            setViewUserDetails(true);
                                                                        }}>
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            View Details
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                                            <Pencil className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => toggleUserStatus(user._id, user.status || 'Active')}
                                                                        >
                                                                            {user.status === 'Deactivated' ? (
                                                                                <>
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    Activate
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <EyeOff className="mr-2 h-4 w-4" />
                                                                                    Deactivate
                                                                                </>
                                                                            )}
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => confirmDeleteUser(user._id)}
                                                                            className="text-red-600 focus:text-red-600"
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>

                                            {users.length > 0 && totalPages > 1 && (
                                                <div className="flex items-center justify-between px-4 py-4 border-t">
                                                    <p className="text-sm text-gray-500">
                                                        Page {currentPage} of {totalPages}
                                                    </p>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={currentPage === 1}
                                                            onClick={() => fetchUsers(currentPage - 1)}
                                                        >
                                                            Previous
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={currentPage === totalPages}
                                                            onClick={() => fetchUsers(currentPage + 1)}
                                                        >
                                                            Next
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="tasks">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tasks</CardTitle>
                                    <CardDescription>Organization task statistics</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium">Task Completion</span>
                                                <span className="text-sm font-medium">{stats?.completedTasksPercentage || 0}%</span>
                                            </div>
                                            <Progress value={stats?.completedTasksPercentage || 0} className="h-2" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500">Total Tasks</p>
                                                <p className="text-2xl font-bold">{stats?.totalTasks || 0}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500">Completed</p>
                                                <p className="text-2xl font-bold">{Math.round((stats?.totalTasks || 0) * ((stats?.completedTasksPercentage || 0) / 100))}</p>
                                            </div>
                                        </div>

                                        {loadingTasks ? (
                                            <div className="flex justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            </div>
                                        ) : tasks.length > 0 ? (
                                            <div className="rounded-md border mt-4">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Title</TableHead>
                                                            <TableHead>Assigned To</TableHead>
                                                            <TableHead>Due Date</TableHead>
                                                            <TableHead>Priority</TableHead>
                                                            <TableHead>Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {tasks.slice(0, 5).map((task) => (
                                                            <TableRow key={task._id}>
                                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                                <TableCell>
                                                                    {task.assignedUser?.firstName} {task.assignedUser?.lastName}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {format(new Date(task.dueDate), "MMM d, yyyy")}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={
                                                                        task.priority === 'High' ? 'destructive' :
                                                                        task.priority === 'Medium' ? 'default' :
                                                                        'outline'
                                                                    }>
                                                                        {task.priority}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge >
                                                                        {task.status}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                                {tasks.length > 5 && (
                                                    <div className="p-4 text-center">
                                                        <Button variant="outline" size="sm">
                                                            View All Tasks
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 mt-4">
                                                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p>No tasks found in this organization</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="tickets">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Support Tickets</CardTitle>
                                    <CardDescription>Organization support ticket statistics</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-500">Pending Tickets</p>
                                            <p className="text-2xl font-bold">{stats?.pendingTickets || 0}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-500">Resolved Tickets</p>
                                            <p className="text-2xl font-bold">{stats?.resolvedTickets || 0}</p>
                                        </div>
                                    </div>

                                    {loadingTickets ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : tickets.length > 0 ? (
                                        <div className="rounded-md border mt-4">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Subject</TableHead>
                                                        <TableHead>User</TableHead>
                                                        <TableHead>Category</TableHead>
                                                        <TableHead>Created</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {tickets.slice(0, 5).map((ticket) => (
                                                        <TableRow key={ticket._id}>
                                                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                                                            <TableCell>
                                                                {ticket.user?.firstName} {ticket.user?.lastName}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">
                                                                    {ticket.category}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge >
                                                                    {ticket.status}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            {tickets.length > 5 && (
                                                <div className="p-4 text-center">
                                                    <Button variant="outline" size="sm">
                                                        View All Tickets
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 mt-4">
                                            <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>No tickets found in this organization</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Quick Actions Card */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Manage organization settings and permissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button
                                    onClick={() => setDialogOpen(true)}
                                    variant="outline"
                                    className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                                >
                              <Users className="h-6 w-6" />
                                        <span>Add User</span>
                                    </Button>

                                    <Button
                                        onClick={() => setUpdateCreditsOpen(true)}
                                        variant="outline"
                                        className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                                    >
                                        <Wallet className="h-6 w-6" />
                                        <span>Update Balance</span>
                                    </Button>

                                    <Button
                                        onClick={() => setExtendOpen(true)}
                                        variant="outline"
                                        className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                                    >
                                        <Clock className="h-6 w-6" />
                                        <span>Extend Trial</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                                    >
                                        <CreditCard className="h-6 w-6" />
                                        <span>Renew Subscription</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dialogs */}
                        <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
                            <DialogContent className='z-[100]'>
                                <DialogHeader>
                                    <DialogTitle>Extend Trial Period</DialogTitle>
                                    <DialogDescription>
                                        Enter the number of days to extend the trial period for {organization.companyName}.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <Clock className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium">Current Expiry Date</h4>
                                            <p className="text-sm text-gray-500">
                                                {organization.trialExpires ?
                                                    format(new Date(organization.trialExpires), "PPP") :
                                                    "No trial date set"}
                                            </p>
                                        </div>
                                    </div>

                                    <Input
                                        type="number"
                                        value={extensionDays}
                                        onChange={(e) => setExtensionDays(Number(e.target.value))}
                                        placeholder="Enter number of days"
                                        className="w-full"
                                        min="1"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setExtendOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleExtendTrial}>
                                        Extend Trial
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
                            <DialogContent className='z-[100]'>
                                <DialogHeader>
                                    <DialogTitle>Revoke Trial Period</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to revoke the trial period for {organization.companyName}? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="py-4">
                                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                                        <Shield className="h-6 w-6 text-red-500" />
                                        <div>
                                            <h4 className="font-medium text-red-700">Warning</h4>
                                            <p className="text-sm text-red-600">
                                                Revoking the trial will immediately end access to premium features for this organization.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setRevokeOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={revokeTrialPeriod}>
                                        Revoke Trial
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={updateCreditsOpen} onOpenChange={setUpdateCreditsOpen}>
                            <DialogContent className='z-[100]'>
                                <DialogHeader>
                                    <DialogTitle>Update Wallet Balance</DialogTitle>
                                    <DialogDescription>
                                        Enter the new wallet balance for {organization.companyName}.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <Wallet className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium">Current Balance</h4>
                                            <p className="text-sm text-gray-500">₹{orgCredits}</p>
                                        </div>
                                    </div>

                                    <Input
                                        type="number"
                                        value={newCredits}
                                        onChange={(e) => setNewCredits(Number(e.target.value))}
                                        placeholder="Enter new balance"
                                        className="w-full"
                                        min="0"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setUpdateCreditsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={updateWalletBalance}>
                                        Update Balance
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogContent className='z-[100]'>
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                    <DialogDescription>
                                        Add a new user to {organization.companyName}. The user will receive an email invitation.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="firstName" className="text-sm font-medium">
                                                First Name
                                            </label>
                                            <Input
                                                id="firstName"
                                                placeholder="John"
                                                value={newUser.firstName}
                                                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="lastName" className="text-sm font-medium">
                                                Last Name
                                            </label>
                                            <Input
                                                id="lastName"
                                                placeholder="Doe"
                                                value={newUser.lastName}
                                                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john.doe@example.com"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="whatsappNo" className="text-sm font-medium">
                                            WhatsApp Number
                                        </label>
                                        <Input
                                            id="whatsappNo"
                                            placeholder="+1234567890"
                                            value={newUser.whatsappNo}
                                            onChange={(e) => setNewUser({ ...newUser, whatsappNo: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="role" className="text-sm font-medium">
                                            Role
                                        </label>
                                        <select
                                            id="role"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        >
                                            <option value="member">Member</option>
                                            <option value="manager">Manager</option>
                                            <option value="orgAdmin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddUser}>
                                        Add User
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                            <DialogContent className='z-[100]'>
                                <DialogHeader>
                                    <DialogTitle>Delete Organization</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete {organization.companyName}? This action cannot be undone and will delete all associated users and data.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="py-4">
                                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                                        <Trash2 className="h-6 w-6 text-red-500" />
                                        <div>
                                            <h4 className="font-medium text-red-700">Warning</h4>
                                            <p className="text-sm text-red-600">
                                                All users, tasks, tickets, and organization data will be permanently deleted.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500">
                                            Please type <strong>{organization.companyName}</strong> to confirm deletion.
                                        </p>
                                        <Input
                                            className="mt-2"
                                            placeholder={organization.companyName}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleDeleteOrganization}>
                                        Delete Organization
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Edit User Dialog */}
                        <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
                            <DialogContent className='z-[100]'>
                                <DialogHeader>
                                    <DialogTitle>Edit User</DialogTitle>
                                    <DialogDescription>
                                        Update details for {selectedUser?.firstName} {selectedUser?.lastName}.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="editFirstName" className="text-sm font-medium">
                                                First Name
                                            </label>
                                            <Input
                                                id="editFirstName"
                                                placeholder="John"
                                                value={selectedUser?.firstName || ''}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="editLastName" className="text-sm font-medium">
                                                Last Name
                                            </label>
                                            <Input
                                                id="editLastName"
                                                placeholder="Doe"
                                                value={selectedUser?.lastName || ''}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="editEmail" className="text-sm font-medium">
                                            Email
                                        </label>
                                        <Input
                                            id="editEmail"
                                            type="email"
                                            placeholder="john.doe@example.com"
                                            value={selectedUser?.email || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="editWhatsappNo" className="text-sm font-medium">
                                            WhatsApp Number
                                        </label>
                                        <Input
                                            id="editWhatsappNo"
                                            placeholder="+1234567890"
                                            value={selectedUser?.whatsappNo || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, whatsappNo: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="editRole" className="text-sm font-medium">
                                            Role
                                        </label>
                                        <select
                                            id="editRole"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={selectedUser?.role || 'member'}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                        >
                                            <option value="member">Member</option>
                                            <option value="manager">Manager</option>
                                            <option value="orgAdmin">Admin</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="editStatus" className="text-sm font-medium">
                                            Status
                                        </label>
                                        <select
                                            id="editStatus"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={selectedUser?.status || 'Active'}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Deactivated">Deactivated</option>
                                        </select>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setEditUserOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleUpdateUser}>
                                        Update User
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Delete User Dialog */}
                        <Dialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
                            <DialogContent className='z-[100]'>
                                <DialogHeader>
                                    <DialogTitle>Delete User</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this user? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                                        <Trash2 className="h-6 w-6 text-red-500" />
                                        <div>
                                            <h4 className="font-medium text-red-700">Warning</h4>
                                            <p className="text-sm text-red-600">
                                                This will permanently remove the user from this organization.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteUserDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleDeleteUser}>
                                        Delete User
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* View User Details Dialog */}
                        <Dialog open={viewUserDetails} onOpenChange={setViewUserDetails}>
                            <DialogContent className="max-w-md z-[100]">
                                <DialogHeader>
                                    <DialogTitle>User Details</DialogTitle>
                                    <DialogDescription>
                                        Complete information for this user
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div className="flex justify-center mb-4">
                                        <Avatar className="h-20 w-20">
                                            {selectedUser?.profilePic ? (
                                                <AvatarImage src={selectedUser.profilePic} alt={`${selectedUser.firstName} ${selectedUser.lastName}`} />
                                            ) : (
                                                <AvatarFallback className="text-xl">
                                                    {selectedUser?.firstName?.charAt(0)}{selectedUser?.lastName?.charAt(0)}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Name</h4>
                                            <p>{selectedUser?.firstName} {selectedUser?.lastName}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                            <Badge >
                                                {selectedUser?.status || 'Active'}
                                            </Badge>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                            <p className="truncate">{selectedUser?.email}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">WhatsApp</h4>
                                            <p>{selectedUser?.whatsappNo}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Role</h4>
                                            <Badge variant={selectedUser?.role === 'orgAdmin' ? 'default' : 'outline'}>
                                                {selectedUser?.role === 'orgAdmin' ? 'Admin' :
                                                selectedUser?.role === 'manager' ? 'Manager' : 'Member'}
                                            </Badge>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Joined</h4>
                                            <p>{selectedUser?.createdAt ?
                                                format(new Date(selectedUser.createdAt), "MMM d, yyyy") :
                                                "Unknown"}</p>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="flex justify-between space-x-2">
                                    <Button variant="outline" onClick={() => setViewUserDetails(false)}>
                                        Close
                                    </Button>
                                    <div className="space-x-2">
                                        <Button variant="outline" onClick={() => {
                                            setViewUserDetails(false);
                                            setSelectedUser(selectedUser);
                                            setEditUserOpen(true);
                                        }}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button variant="destructive" onClick={() => {
                                            setViewUserDetails(false);
                                            confirmDeleteUser(selectedUser?._id);
                                        }}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}

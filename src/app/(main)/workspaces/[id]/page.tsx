'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/sidebar/adminSidebar';
import InfoBar from '@/components/infobar/infobar';
import { Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogClose, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    const [orgCredits, setOrgCredits] = useState<number | undefined>(0)
    const [extendOpen, setExtendOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [extensionDays, setExtensionDays] = useState<number | undefined>();
    const router = useRouter();

    // Dialog open handler
    const openRevokeDialog = () => {
        setRevokeOpen(true);
    };

    // Dialog open handler
    const openExtendDialog = () => {
        setExtendOpen(true);
    };

    useEffect(() => {
        if (!id) return;

        const fetchOrganization = async () => {
            try {
                const res = await fetch(`/api/organizations/${id}`);
                const { organization, stats } = await res.json();

                if (!res.ok) {
                    throw new Error(organization.error || 'Failed to fetch organization');
                }

                setOrganization(organization);
                setOrgCredits(organization.credits);
                setStats(stats);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganization();
    }, [id]);


    const handleExtendTrial = async () => {
        try {
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
            const data = await res.json();

            if (data.error) {
                // alert(data.error);
            } else {
                toast.success('Trial period revoked successfully');

                setRevokeOpen(false);
            }
        } catch (error: any) {
            // alert(error.message);
        }
    };


    const handleAddUser = async () => {
        try {
            const res = await fetch(`/api/organizations/${id}/add-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to add user');
            }

            toast.success('User added successfully');
            setDialogOpen(false);

            // Optionally refetch organization details
            const fetchOrganization = async () => {
                const res = await fetch(`/api/organizations/${id}`);
                const { organization, stats } = await res.json();
                setOrganization(organization);
                setStats(stats);
            };
            fetchOrganization();
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

            // Optionally redirect to another page after deletion
            // router.push("/admin/dashboard");
        } catch (error: any) {
            toast.error(error.message);
        }
    };



    if (loading) return <div>Loading organization details...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <div className={`flex dark:bg-[#05017e] scrollbar-hide h-full w-full`}>
                <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                <div className="w-full overflow-y-scroll scrollbar-hide h-screen">
                    <div className="-ml-6">
                        <InfoBar />
                    </div>
                    <div className="flex mt-12 w-full max-w-9xl">
                        <div
                            className={`${isCollapsed ? 'ml-20' : 'ml-64'
                                } p-6 bg-[#0A0D28] text-white overflow-y-scroll h-screen w-screen scrollbar-hide space-y-6`}
                        >
                            <div className='rounded-xl bg-[#0A0D28]  border-gray-800 border'>
                                {/* Header Section */}
                                <div className="p-6  ">
                                    <div className="flex justify-between items-center">
                                        <div>

                                            <h1 className="text-2xl font-bold">

                                                {organization.companyName}{' '}
                                                <span
                                                    className={`ml-2 px-3 py-1 text-sm font-medium rounded-lg ${new Date(organization.trialExpires) > new Date()
                                                        ? 'bg-gradient-to-r text-sm from-[#815BF5] to-[#FC8929] text-white'
                                                        : 'bg-red-500 text-white'
                                                        }`}
                                                >
                                                    Trial Expire in{' '}
                                                    {Math.max(
                                                        0,
                                                        Math.ceil(
                                                            (new Date(organization.trialExpires).getTime() -
                                                                new Date().getTime()) /
                                                            (1000 * 60 * 60 * 24)
                                                        )
                                                    )}{' '}
                                                    Days
                                                </span>
                                            </h1>
                                            <div>
                                                <p className="text-gray-400 text-sm  mt-2">
                                                    Company Description
                                                </p>
                                                <p className='text'> {organization.description}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-r text-xl items-center flex gap-2 from-[#815BF5] to-[#FC8929]  font-bold bg-[#292A3E] px-4 py-2 rounded-lg">
                                            <Wallet />     ₹ {orgCredits}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <p className="text-gray-500">Register Date</p>
                                            <p className="text-white">{format(organization.createdAt, "Pp")}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Subscribed Plan</p>
                                            <p className="text-white">{organization.subscribedPlan ? organization.subscribedPlan:"N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Expiration Date</p>
                                            <p className="text-white">{organization.subscriptionExpires ? format(organization.subscriptionExpires, "Pp") : "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full flex justify-center'>
                                    <Separator />

                                </div>
                                {/* Stats Section */}
                                <div className="p-6 bg-[#] rounded-lg shadow-lg">
                                    <h2 className="text-lg text-gray-400 foreground font- mb-4">Task Details</h2>
                                    <div className="grid grid-cols-6 w-full gap-4 text-center">
                                        <div className='flex items-center gap-2'>
                                            <img src='/pointer.png' className='h-12' />
                                            <div>
                                                <p className="text-gray-400 text-sm">Total Task</p>

                                                <p className="text-xl font-bold text-white">{stats.totalTasks}</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <img src='/pointer.png' className='h-12' />
                                            <div>
                                                <p className="text-gray-400 text-sm">Completion Task</p>

                                                <p className="text-xl font-bold text-white">
                                                    {stats.completedTasksPercentage}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <img src='/pointer.png' className='h-12' />
                                            <div>
                                                <p className="text-gray-400 text-sm">Total User</p>

                                                <p className="text-xl font-bold text-white">{stats.totalUsers}</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <img src='/pointer.png' className='h-12' />
                                            <div>
                                                <p className="text-gray-400 text-sm">Subscribed User</p>

                                                <p className="text-xl font-bold text-white">{organization.subscribedUserCount}</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <img src='/pointer.png' className='h-12' />
                                            <div>
                                                <p className="text-gray-400 text-sm">Pending Tickets</p>
                                                <p className="text-xl font-bold text-white">{stats.pendingTickets}</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <img src='/pointer.png' className='h-12' />
                                            <div>
                                                <p className="text-gray-400 text-sm">Resolved Tickets</p>

                                                <p className="text-xl font-bold text-white">{stats.resolvedTickets}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex justify-start gap-4 px-6 bg-[#] rounded-lg shadow-lg">
                                <button onClick={() => setDialogOpen(true)} className="hover:bg-[#FC8929] flex items-center gap-1 hover:text-white px-6 py-2 rounded-lg text-sm text-[#FC8929]  border-[#FC8929] border">
                                    <Wallet className='h-5' />Add User
                                </button>
                                <button onClick={() => openRevokeDialog()} className="hover:bg-[#815BF5] flex items-center gap-1 hover:text-white px-6 py-2 rounded-lg text-sm text-[#815BF5]  border-[#815BF5] border">
                                    <Wallet className='h-5' />  Revoke Account
                                </button>
                                <button onClick={() => openExtendDialog()} className="hover:bg-[#FC8929] flex items-center gap-1 hover:text-white px-6 py-2 rounded-lg text-sm text-[#FC8929]  border-[#FC8929] border">
                                    <Wallet className='h-5' />  Extend Days
                                </button>

                                <button className="hover:bg-[#FC8929] flex items-center gap-1 hover:text-white px-6 py-2 rounded-lg text-sm text-[#FC8929]  border-[#FC8929] border">
                                    <Wallet className='h-5' />  Renew Subscription
                                </button>

                                <button onClick={() => setDeleteOpen(true)} className="hover:bg-[#FF4136] flex items-center gap-1 hover:text-white px-6 py-2 rounded-lg text-sm text-[#ff5b51]  border-[#ff5b51] border">
                                    <Wallet className='h-5' />    Delete Account
                                </button>
                            </div>

                            <Dialog open={extendOpen} onOpenChange={() => setExtendOpen(false)}>
                                <DialogContent className="p-6">
                                    <div className="flex justify-center">
                                        <img src="/extend.png" alt="Extend Trial" />
                                    </div>
                                    <h1 className="text-white text-center">
                                        Extend trial period for {extensionDays} days?
                                    </h1>
                                    <input
                                        type="number"
                                        value={extensionDays}
                                        onChange={(e) => setExtensionDays(Number(e.target.value))}
                                        className="bg-transparent text-white border outline-none p-2 rounded border-gray-800 w-full"
                                        placeholder="Enter the number of days"
                                    />
                                    <div className="mt-4 flex justify-center">

                                        <Button
                                            onClick={handleExtendTrial}
                                            className="bg-transparent w-full justify-center h-7 text-xs hover:bg-[#5f31e9] bg-[#815bf5]"
                                        >
                                            Confirm
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={revokeOpen} onOpenChange={() => setRevokeOpen(false)}>
                                <DialogContent className="p-6">
                                    <div className="flex justify-center">
                                        <img src="/revoke.png" alt="Extend Trial" />
                                    </div>
                                    <h1 className="text-white text-center">
                                        Revoke trial period for the organization?
                                    </h1>

                                    <div className="mt-4 flex justify-center">
                                        <Button
                                            onClick={revokeTrialPeriod}
                                            className="bg-transparent w-full justify-center h-7 text-xs hover:bg-[#5f31e9] bg-[#815bf5]"
                                        >
                                            Yes, Revoke
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Add User Dialog */}
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogContent className='p-6 text-white'>
                                    <DialogHeader >
                                        <div className='flex w-full justify-between items-center'>
                                            <DialogTitle>Add New User</DialogTitle>
                                            <DialogClose>X</DialogClose>
                                        </div>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <input
                                            className='p-2 bg-transparent border-gray-700 border outline-none w-full rounded'
                                            placeholder="First Name"
                                            value={newUser.firstName}
                                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                        />
                                        <input
                                            placeholder="Last Name"
                                            className='p-2 bg-transparent border-gray-700 border outline-none w-full rounded'
                                            value={newUser.lastName}
                                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                        />
                                        <input
                                            placeholder="Email"
                                            className='p-2 bg-transparent border-gray-700 border outline-none w-full rounded'
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                        <input
                                            className='p-2 bg-transparent border-gray-700 border outline-none w-full rounded'
                                            placeholder="WhatsApp Number"
                                            value={newUser.whatsappNo}
                                            onChange={(e) => setNewUser({ ...newUser, whatsappNo: e.target.value })}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button className='bg-[#815bf5] hover:bg-[#5f31e9] w-full' onClick={handleAddUser}>Add User</Button>

                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                                <DialogContent className="p-6">
                                    <div className="flex justify-center">
                                        <img src="/revoke.png" alt="Delete Organization" />
                                    </div>
                                    <h1 className="text-white text-center">
                                        Are you sure you want to delete this organization? This will also delete all associated users!
                                    </h1>
                                    <div className="mt-4 flex justify-center">
                                        <Button
                                            onClick={handleDeleteOrganization}
                                            className="bg-transparent w-full justify-center h-7 text-xs hover:bg-[#ff3b30] bg-[#FF4136]"
                                        >
                                            Yes, Delete
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

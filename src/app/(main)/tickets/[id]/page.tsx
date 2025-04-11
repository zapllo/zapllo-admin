'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { ArrowLeft, CheckCheck, Paperclip, MessageCircle, Clock, Tag, User } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { X } from 'lucide-react'
import Loader from '@/components/ui/loader'
import AdminSidebar from '@/components/sidebar/adminSidebar'
import InfoBar from '@/components/infobar/infobar'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Type definitions remain the same
type Ticket = {
    _id: string;
    category: string;
    subcategory: string;
    subject: string;
    description: string;
    fileUrl?: string[];
    status: string;
    user: { name: string };
    createdAt: string;
    comments: Array<{
        userId: { firstName: string; lastName: string };
        content: string;
        createdAt: string;
        fileUrls?: string[];
    }>;
};

export default function TicketDetails() {
    // State variables remain the same
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const { id } = useParams();
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [comment, setComment] = useState<string>('')
    const [statusToUpdate, setStatusToUpdate] = useState<string>('')
    const [files, setFiles] = useState<File[]>([])
    const [comments, setComments] = useState<Array<{
        userId: { firstName: string; lastName: string };
        content: string;
        createdAt: string;
        fileUrls?: string[];
    }>>([])
    const [loading, setLoading] = useState<boolean>(true);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

    // Existing useEffect and handler functions remain the same
    useEffect(() => {
        const fetchTicket = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/tickets/${id}`)
                const sortedComments = response.data.comments.sort(
                    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                setTicket(response.data)
                setComments(sortedComments)
                setLoading(false);
            } catch (error) {
                console.error('Error fetching ticket details:', error)
                setLoading(false);
            }
        }
        fetchTicket()
    }, [id])

    // All other handler functions remain unchanged
    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files))
        }
    }

    const handleFileRemove = (file: File) => {
        setFiles(files.filter(f => f !== file))
    }

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (comment.trim() || files.length > 0) {
            try {
                const fileUrls: string[] = []
                if (files.length > 0) {
                    const formData = new FormData()
                    files.forEach(file => formData.append('files', file))
                    const uploadResponse = await axios.post('/api/upload', formData)
                    fileUrls.push(...uploadResponse.data.fileUrls)
                }

                await axios.post(`/api/tickets/${id}/comments`, { comment, fileUrls })

                setComment('')
                setFiles([])
                const updatedTicketResponse = await axios.get(`/api/tickets/${id}`)
                const sortedComments = updatedTicketResponse.data.comments.sort(
                    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                setComments(sortedComments)
            } catch (error) {
                console.error('Error submitting comment:', error)
            }
        }
    }

    const handleStatusButtonClick = (status: string) => {
        setStatusToUpdate(status)
        setIsDialogOpen(true)
    }

    const handleStatusUpdate = async () => {
        if (comment.trim() || files.length > 0) {
            try {
                const fileUrls: string[] = []
                if (files.length > 0) {
                    const formData = new FormData()
                    files.forEach(file => formData.append('files', file))
                    const uploadResponse = await axios.post('/api/upload', formData)
                    fileUrls.push(...uploadResponse.data.fileUrls)
                }

                await axios.patch(`/api/tickets/${id}/status`, {
                    status: statusToUpdate,
                    comment,
                    fileUrls
                })

                setIsDialogOpen(false)
                setComment('')
                setFiles([])

                const updatedTicketResponse = await axios.get(`/api/tickets/${id}`)
                setTicket(updatedTicketResponse.data)
                const sortedComments = updatedTicketResponse.data.comments.sort(
                    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                setComments(sortedComments)
            } catch (error) {
                console.error('Error updating status:', error)
            }
        }
    }

    // Function to get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-500 text-white';
            case 'In Resolution': return 'bg-blue-500 text-white';
            case 'Closed': return 'bg-green-500 text-white';
            case 'Cancelled': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    }

    // Format date for better readability
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return (
        <div className="flex dark:bg-[#04061E] bg-gray-50 min-h-screen">
            <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className="w-full overflow-y-auto h-screen">
                <InfoBar />

                <div className="flex mt-16 w-full">
                    {loading ? (
                        <div className="w-full flex justify-center items-center h-[calc(100vh-4rem)]">
                            <Loader />
                        </div>
                    ) : (
                        <div className={`${isCollapsed ? "ml-20" : "ml-64"} transition-all duration-300
                            p-6 dark:bg-[#04061E] bg-gray-50 text-gray-900 dark:text-white w-full max-w-7xl mx-auto`}>

                            <Link href='/tickets' className="inline-flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400 hover:underline">
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to tickets</span>
                            </Link>

                            {ticket && (
                                <>
                                    <Card className="mb-8 shadow-sm border dark:border-gray-700 dark:bg-gray-900">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-xl font-bold">{ticket.subject}</CardTitle>
                                                    <CardDescription className="text-sm">
                                                        <span className="flex items-center gap-1 mt-1">
                                                            <Clock className="h-4 w-4" />
                                                            {formatDate(ticket.createdAt)}
                                                        </span>
                                                    </CardDescription>
                                                </div>
                                                <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-4">
                                            <Tabs defaultValue="details">
                                                <TabsList className="mb-4">
                                                    <TabsTrigger value="details">Details</TabsTrigger>
                                                    <TabsTrigger value="attachments">Attachments</TabsTrigger>
                                                    <TabsTrigger value="actions">Actions</TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="details">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-3">
                                                            <div className="flex items-start gap-2">
                                                                <Tag className="h-4 w-4 mt-1 text-gray-500" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                                                                    <p>{ticket.category}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2">
                                                                <Tag className="h-4 w-4 mt-1 text-gray-500" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subcategory</p>
                                                                    <p>{ticket.subcategory}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2">
                                                                <User className="h-4 w-4 mt-1 text-gray-500" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reported By</p>
                                                                    <p>{ticket.user.name}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</p>
                                                            <p className="whitespace-pre-wrap">{ticket.description}</p>
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="attachments">
                                                    {ticket.fileUrl && ticket.fileUrl.length > 0 ? (
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                            {ticket.fileUrl.map((url, index) => (
                                                                <a
                                                                    key={index}
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block group"
                                                                >
                                                                    <div className="relative aspect-square rounded-md overflow-hidden border dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                                                                        <img
                                                                            src={url}
                                                                            alt={`Attachment ${index}`}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <span className="text-white text-sm font-medium">View</span>
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 dark:text-gray-400">No attachments available</p>
                                                    )}
                                                </TabsContent>

                                                <TabsContent value="actions" className="space-y-4">
                                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Update Status</h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        <Button
                                                            onClick={() => handleStatusButtonClick('In Resolution')}
                                                            variant="outline"
                                                            className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                                                        >
                                                            In Resolution
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleStatusButtonClick('Closed')}
                                                            variant="outline"
                                                            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                                        >
                                                            Closed
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleStatusButtonClick('Pending')}
                                                            variant="outline"
                                                            className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                                                        >
                                                            Pending
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleStatusButtonClick('Cancelled')}
                                                            variant="outline"
                                                            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                                        >
                                                            Cancelled
                                                        </Button>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                            </CardContent>
                                    </Card>

                                    {/* Status Update Dialog */}
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogContent className="dark:text-white rounded-lg z-[100] sm:max-w-md">
                                            <div className="space-y-4">
                                                <h2 className="text-lg font-semibold">
                                                    Update Status: <Badge className={getStatusColor(statusToUpdate)}>{statusToUpdate}</Badge>
                                                </h2>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Add a comment (required)
                                                    </label>
                                                    <textarea
                                                        value={comment}
                                                        onChange={handleCommentChange}
                                                        placeholder="Explain why you're changing the status..."
                                                        rows={4}
                                                        className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                        <Paperclip className="h-4 w-4" />
                                                        Attachments (optional)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                                                        file:rounded-md file:border-0 file:text-sm file:font-semibold
                                                        file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                                                        dark:file:bg-blue-900 dark:file:text-blue-200"
                                                        multiple
                                                    />
                                                </div>

                                                {files.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {files.map((file, index) => (
                                                            <div key={index} className="relative group">
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt={`File ${index}`}
                                                                    className="w-full h-20 object-cover rounded-md"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleFileRemove(file)}
                                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1
                                                                    shadow-md hover:bg-red-600 transition-colors"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex justify-end gap-3 pt-2">
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                    </DialogClose>
                                                    <Button onClick={handleStatusUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">
                                                        Update Status
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Comments Section */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <h2 className="text-lg font-semibold">Communication History</h2>
                                        </div>

                                        {comments.length > 0 ? (
                                            <div className="space-y-4">
                                                {comments.map((comment, index) => (
                                                    <Card key={index} className="border dark:border-gray-700 dark:bg-gray-900 shadow-sm">
                                                        <CardHeader className="pb-2">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="bg-blue-600  rounded-full h-10 w-10 flex items-center justify-items-center">
                                                                    <AvatarImage src="/placeholder-user.jpg" />
                                                                    <AvatarFallback className="justify-center  m-auto text-white text-  rounded-full">
                                                                        {comment.userId?.firstName?.charAt(0)}{comment.userId?.lastName?.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium">
                                                                        {comment.userId?.firstName} {comment.userId?.lastName}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {formatDate(comment.createdAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="pt-2">
                                                            <div className="prose-sm dark:prose-invert max-w-none">
                                                                <p>{comment.content}</p>
                                                            </div>

                                                            {comment.fileUrls && comment.fileUrls.length > 0 && (
                                                                <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                                        Attachments ({comment.fileUrls.length})
                                                                    </p>
                                                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                                        {comment.fileUrls.map((url, idx) => (
                                                                            <a
                                                                                key={idx}
                                                                                href={url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="block group"
                                                                            >
                                                                                <div className="relative rounded border dark:border-gray-700 overflow-hidden aspect-square">
                                                                                    <img
                                                                                        src={url}
                                                                                        alt={`Attachment ${idx}`}
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                        <span className="text-white text-xs">View</span>
                                                                                    </div>
                                                                                </div>
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <Card className="border dark:border-gray-700 dark:bg-gray-900">
                                                <CardContent className="flex flex-col items-center justify-center py-6">
                                                    <MessageCircle className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                                                    <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Reply Form */}
                                    <Card className="border dark:border-gray-700 dark:bg-gray-900 shadow-sm mb-10">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-md font-medium">Add Reply</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleCommentSubmit} className="space-y-4">
                                                <div>
                                                    <textarea
                                                        value={comment}
                                                        onChange={handleCommentChange}
                                                        placeholder="Type your reply here..."
                                                        rows={4}
                                                        className="w-full border rounded-md p-3 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        <Paperclip className="h-4 w-4" />
                                                        Attach files (optional)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                                                        file:rounded-md file:border-0 file:text-sm file:font-semibold
                                                        file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                                                        dark:file:bg-blue-900 dark:file:text-blue-200"
                                                        multiple
                                                    />
                                                </div>

                                                {files.length > 0 && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {files.map((file, index) => (
                                                            <div key={index} className="relative">
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt={`File ${index}`}
                                                                    className="aspect-square object-cover rounded-md"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleFileRemove(file)}
                                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex justify-end">
                                                    <Button
                                                        type="submit"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        Send Reply
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

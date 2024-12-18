'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { ArrowLeft, CheckCheck } from 'lucide-react'
// import ChecklistSidebar from '@/components/sidebar/checklistSidebar'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
// import { IconChecklist } from '@tabler/icons-react'
import { X } from 'lucide-react' // Import X icon for removing files
import Loader from '@/components/ui/loader'
import AdminSidebar from '@/components/sidebar/adminSidebar'
import InfoBar from '@/components/infobar/infobar'
import { useParams } from 'next/navigation'

type Ticket = {
    _id: string;
    category: string;
    subcategory: string;
    subject: string;
    description: string;
    fileUrl?: string[]; // Updated to handle array of URLs
    status: string;
    user: { name: string };
    createdAt: string;
    comments: Array<{
        userId: { firstName: string; lastName: string };
        content: string;
        createdAt: string;
        fileUrls?: string[]; // Array of file URLs for comments
    }>;
};

export default function TicketDetails() {
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const { id } = useParams(); // Accessing dynamic `id` from the URL
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [comment, setComment] = useState<string>('')
    const [statusToUpdate, setStatusToUpdate] = useState<string>('') // Store the status to update
    const [files, setFiles] = useState<File[]>([]) // Updated to handle array of files
    const [comments, setComments] = useState<Array<{
        userId: { firstName: string; lastName: string };
        content: string;
        createdAt: string;
        fileUrls?: string[]; // Array of file URLs for comments
    }>>([])
    const [loading, setLoading] = useState<boolean>(true); // Add loading state
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                setLoading(true); // Set loading to true before fetching
                const response = await axios.get(`/api/tickets/${id}`)
                const sortedComments = response.data.comments.sort(
                    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                setTicket(response.data)
                setComments(sortedComments)
                setLoading(false);
            } catch (error) {
                console.error('Error fetching ticket details:', error)
            }
        }
        fetchTicket()
    }, [id])

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

                const response = await axios.post(`/api/tickets/${id}/comments`, { comment, fileUrls })
                console.log('Comment response:', response.data) // Add this line

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
        setStatusToUpdate(status) // Set the status to update
        setIsDialogOpen(true) // Open the modal
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

                // Post the comment with the status update
                await axios.patch(`/api/tickets/${id}/status`, {
                    status: statusToUpdate,
                    comment,
                    fileUrls
                })

                setIsDialogOpen(false) // Close the modal
                setComment('') // Reset comment field
                setFiles([]) // Reset files

                // Fetch the updated ticket
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

    return (
        <div>
            <div
                className={`flex  dark:bg-[#04061E] scrollbar-hide h-full w-full`}
            >
                {/* <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /> */}
                <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                <div className="w-full overflow-y-scroll scrollbar-hide  h-screen">
                    <div className='-ml-6'>
                        <InfoBar />
                    </div>
                    <div className="flex mt-24  w-full  max-w-9xl">
                        {loading ? (
                            <Loader />
                        ) : (
                            <div className={`${isCollapsed ? "ml-20" : "ml-64"
                                } p-6 bg-[#04061E] text-white  overflow-y-scroll h-screen w-screen scrollbar-hide   -mt-12 space-y-4`}>
                                <Link href='/tickets'>
                                    <div className='flex gap-2 mb-8 bord font-medium text-xl cursor-pointer'>
                                        <ArrowLeft className='h-7 rounded-full  border w-7 hover:bg-[#815BF5]' />
                                        <h1>Back To My Tickets</h1>
                                    </div>
                                </Link>
                                {ticket && (
                                    <>

                                        <div className='  p-4 border border-gray-700  rounded'>
                                            <div className="relative max-w-full w-full h-full max-h-32">
                                                <div
                                                    className={`flex ' x-[#E0E0E066] px-2 py-1 rounded absolute right-0 ${ticket.status === 'Pending'
                                                        ? 'bg-red-500'
                                                        : ticket.status === 'In Resolution'
                                                            ? 'bg-yellow-500'
                                                            : ticket.status === 'Closed'
                                                                ? 'bg-gray-700'
                                                                : ticket.status === 'Cancelled'
                                                                    ? 'bg-red-800'
                                                                    : ''
                                                        }`}
                                                >
                                                    <h1 className='text-white text-xs'>{ticket.status}</h1>
                                                </div>
                                            </div>
                                            <div>
                                                <h2 className="text-lg">Status: {ticket.status}</h2>
                                                <div className="flex space-x-4 my-4">
                                                    <Button onClick={() => handleStatusButtonClick('In Resolution')} className="bg-blue-500 hover:bg-blue-600 text-white">
                                                        Mark as In Resolution
                                                    </Button>
                                                    <Button onClick={() => handleStatusButtonClick('Closed')} className="bg-green-500 hover:bg-green-600 text-white">
                                                        Mark as Closed
                                                    </Button>
                                                    <Button onClick={() => handleStatusButtonClick('Pending')} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                                        Mark as Pending
                                                    </Button>
                                                    <Button onClick={() => handleStatusButtonClick('Cancelled')} className="bg-red-500 hover:bg-red-600 text-white">
                                                        Mark as Cancelled
                                                    </Button>
                                                </div>
                                            </div>
                                            <>
                                                {/* Modal for updating status and comment */}
                                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                                    <DialogContent className="text-white rounded-lg p-6">
                                                        <h2 className="text-lg font-bold mb-4">Update Status: {statusToUpdate}</h2>
                                                        <textarea
                                                            value={comment}
                                                            onChange={handleCommentChange}
                                                            placeholder="Add a comment"
                                                            rows={4}
                                                            className="w-full border border-gray-800 p-2 x bg-[#0B0D29] outline-none rounded mb-4"
                                                        />
                                                        <input
                                                            type="file"
                                                            onChange={handleFileChange}
                                                            className="my-2"
                                                        />
                                                        <div className="flex gap-2 flex-wrap mb-4">
                                                            {files.map((file, index) => (
                                                                <div key={index} className="relative w-32 h-32 mb-2">
                                                                    <img
                                                                        src={URL.createObjectURL(file)}
                                                                        alt={`File ${index}`}
                                                                        className="object-cover w-full h-full rounded-lg"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleFileRemove(file)}
                                                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-end space-x-4">
                                                            <Button onClick={handleStatusUpdate} className="bg-[#007A5A] hover:bg-[#007A5A]">Submit</Button>
                                                            <DialogClose asChild>
                                                                <Button variant="ghost">Cancel</Button>
                                                            </DialogClose>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </>
                                            <div className='grid grid-cols-2'>
                                                <div className='space-y-4'>
                                                    <p className='text-sm'><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                                    <p className='text-sm'><strong>Category:</strong> {ticket.category}</p>
                                                    <p className='text-sm'><strong>Subcategory:</strong> {ticket.subcategory}</p>
                                                    <h1 className='text-sm'><strong>Subject:</strong> {ticket.subject}</h1>
                                                    <p className='text-sm'><strong>Description:</strong> {ticket.description}</p>
                                                </div>
                                                {ticket.fileUrl && ticket.fileUrl.length > 0 && (
                                                    <div className='-ml-20'>
                                                        <p className="text-sm font-semibold"><strong>Attachments:</strong></p>
                                                        <div className="grid  grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 ">
                                                            {ticket.fileUrl.map((url, index) => (
                                                                <div key={index} className="relative group">
                                                                    <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg">
                                                                        <img
                                                                            src={url}
                                                                            alt={`Attachment ${index}`}
                                                                            className="w-full h-full object-cover transition-opacity duration-300 ease-in-out group-hover:opacity-70"
                                                                        />
                                                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
                                                                            <h1 className="text-white text-xs font-bold">Click to open</h1>
                                                                        </div>
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                        <div className='flex text-lg    gap-2'>
                                            <CheckCheck className='h-7' />
                                            <h1>Ticket Updates</h1>
                                        </div>
                                        <div className='mt-6'>
                                            {comments.length > 0 ? (
                                                <ul className='space-y-2'>
                                                    {comments.map((c, index) => (
                                                        <div key={index} className='p-4  border border-gray-700  scrollbar-hide  gap-2 rounded text-sm'>
                                                            <div className='flex gap-2'>
                                                                <Avatar className='mt-1'>
                                                                    <AvatarImage src="/placeholder-user.jpg" />
                                                                    <AvatarFallback className='bg-[#815BF5] rounded-full p-1 text-white'>
                                                                        {c.userId?.firstName?.charAt(0)}{c.userId?.lastName?.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className='flex flex-col'>
                                                                    <p><strong>{c?.userId?.firstName}</strong></p>
                                                                    <p><strong>{c.userId?.lastName}</strong></p>
                                                                </div>
                                                            </div>
                                                            <div className='px-2 ml-6'>
                                                                <p className='text-xs text-gray-200'>{new Date(c.createdAt).toLocaleString()}</p>
                                                            </div>
                                                            <div className='ml-6 max-w-2xl break-words'>
                                                                <h1 className='p-2 text-xs w-full'>{c.content}</h1>
                                                            </div>
                                                            <div className='flex justify-end'>
                                                                {c.fileUrls && c.fileUrls.length > 0 && (
                                                                    <div className='relative'>
                                                                        <div className='flex gap-2  -mt-20 right-0'>
                                                                            {c.fileUrls.map((url, index) => (
                                                                                <div key={index} className='mb-2'>
                                                                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                                                                        <img
                                                                                            src={url}
                                                                                            alt={`Comment Attachment ${index}`}
                                                                                            className="object-cover w-36 h-full max-w-4xl max-h-32 rounded-lg"
                                                                                        />
                                                                                        <h1 className="text-xs text-center mt-1 hover:underline">Click to open</h1>
                                                                                    </a>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className='text-sm'>No comments yet.</p>
                                            )}
                                        </div>

                                        <div className=' border border-gray-700 rounded p-4'>
                                            <h1 className='uppercase font-bold'>Reply</h1>
                                            <form onSubmit={handleCommentSubmit} className='mt-4'>
                                                <textarea
                                                    value={comment}
                                                    onChange={handleCommentChange}
                                                    placeholder='Type your comment here'
                                                    rows={4}
                                                    className='w-full p-2 x bg-[#0B0D29] outline-none  rounded'
                                                />

                                                <input
                                                    type='file'
                                                    onChange={handleFileChange}
                                                    className='my-2'
                                                />
                                                <div className='flex justify-end'>
                                                    <Button type='submit' className='bg-[#007A5A] hover:bg-[#007A5A]'>Submit</Button>

                                                </div>

                                                <div className='flex gap-2 flex-wrap mt-2'>
                                                    {files.map((file, index) => (
                                                        <div key={index} className='relative  w-32 h-32 mb-2'>
                                                            <img
                                                                src={URL.createObjectURL(file)}
                                                                alt={`File ${index}`}
                                                                className='object-cover w-full h-full rounded-lg'
                                                            />
                                                            <button
                                                                type='button'
                                                                onClick={() => handleFileRemove(file)}
                                                                className='absolute top-1 right-1 bg-red-600 text-white rounded-full p-1'
                                                            >
                                                                <X className='h-4 w-4' />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </form>
                                        </div>
                                    </>
                                )}

                            </div>
                        )
                        }
                    </div >
                </div>
            </div>
        </div >
    )
}

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Paperclip, X } from "lucide-react";
import Link from "next/link";

interface ICRMUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ICRMOrganization {
  _id: string;
  companyName: string;
}

interface ICRMAttachment {
  name: string;
  url: string;
}

interface ICRMMessage {
  sender: "user" | "agent";
  content: string;
  timestamp: string;
  agent?: string;
  attachments?: ICRMAttachment[];
}

interface ICRMTicket {
  _id: string;
  ticketId: string;
  subject: string;
  status: "open" | "pending" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  createdAt: string;
  updatedAt: string;
  userId: ICRMUser;
  organizationId: ICRMOrganization;
  assignedTo?: ICRMUser;
  messages: ICRMMessage[];
}

export default function CRMTicketDetails() {
  const { ticketId } = useParams(); // param name must match [ticketId].tsx
  const router = useRouter();

  const [ticket, setTicket] = useState<ICRMTicket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // For agent reply
  const [replyContent, setReplyContent] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [agentName, setAgentName] = useState(""); // your new "agentName" field

  // 1) Fetch the CRM ticket by ticketId
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/crm-proxy/tickets/${ticketId}`);
        // shape is { ticket } in your code
        setTicket(res.data.ticket);
      } catch (err) {
        console.error("Failed to fetch CRM ticket details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  // 2) Submit a new agent message (also can update status, assignedTo, etc.)
  // ... existing code ...

  // 2) Submit a new agent message (also can update status, assignedTo, etc.)
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      alert("Please enter some reply content");
      return;
    }
    if (!agentName.trim()) {
      alert("Please provide the agentName");
      return;
    }

    try {
      // Upload files to S3 using the existing upload API
      let attachmentsPayload: { name: string; url: string }[] = [];

      if (attachmentFiles.length > 0) {
        const formData = new FormData();
        attachmentFiles.forEach(file => {
          formData.append('files', file);
        });

        // Upload files to S3
        const uploadResponse = await axios.post('/api/upload', formData);

        // Create the attachments payload with real URLs
        attachmentsPayload = uploadResponse.data.fileUrls.map((url: string, index: number) => ({
          name: attachmentFiles[index].name,
          url: url
        }));
      }

      const payload = {
        content: replyContent,
        attachments: attachmentsPayload,
        status: statusUpdate, // e.g. "pending" or "closed", etc.
        assignedTo: "",       // if you want to reassign an agent
        agentName: agentName, // required field in your endpoint
      };

      await axios.post(`/api/crm-proxy/tickets/${ticketId}`, payload);

      // refresh the ticket
      const updatedRes = await axios.get(`/api/crm-proxy/tickets/${ticketId}`);
      setTicket(updatedRes.data.ticket);

      // Clear out the form
      setReplyContent("");
      setAttachmentFiles([]);
      setStatusUpdate("");
    } catch (err) {
      console.error("Error adding admin reply:", err);
      alert("Failed to add reply");
    }
  };

  // ... existing code ...
  // Just a helper for removing selected files from our local state
  const handleRemoveFile = (file: File) => {
    setAttachmentFiles((prev) => prev.filter((f) => f !== file));
  };

  if (loading) {
    return <div className="p-4">Loading CRM ticket...</div>;
  }

  if (!ticket) {
    return (
      <div className="p-4 text-red-600">
        No CRM ticket found or an error occurred.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mt-12 mx-auto p-4">
      {/* Back link */}
      <Link
        href="/crm-tickets"
        className="inline-flex items-center gap-1 text-blue-600 hover:underline mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to CRM tickets
      </Link>

      <div className="bg-white shadow rounded p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold">{ticket.subject}</h1>
          <Badge variant="outline">{ticket.status}</Badge>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          Ticket ID: <span className="font-medium">{ticket.ticketId}</span>
        </div>
        <div className="text-sm text-gray-600 mb-2">
          Category: <span className="font-medium">{ticket.category}</span> | Priority:{" "}
          <span className="font-medium">{ticket.priority}</span>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          Created at: <span className="font-medium">{new Date(ticket.createdAt).toLocaleString()}</span>
        </div>

        <div className="text-sm text-gray-600">
          Requester:{" "}
          <span className="font-medium">
            {ticket?.userId
              ? (
                <>
                  {ticket.userId.firstName} {ticket.userId.lastName} – {ticket.userId.email}
                </>
              )
              : "No user information available"
            }
          </span>
        </div>

      </div>

      {/* Display existing messages */}
      <div className="space-y-4 mb-8">
        {ticket.messages && ticket.messages.length > 0 ? (
          ticket.messages.map((msg, idx) => (
            <div key={idx} className="bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-semibold">
                  {msg.sender === "agent" ? `Agent: ${msg.agent || "Unknown"}` : "User"}
                </span>
                <span className="text-gray-500">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{msg.content}</p>

              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      className="underline text-blue-600 text-xs"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {att.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-4 rounded shadow text-sm text-gray-500">
            No messages yet.
          </div>
        )}
      </div>

      {/* Agent reply form */}
      <form onSubmit={handleReplySubmit} className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-lg font-semibold">Add a reply (Agent)</h2>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Agent Name</label>
          <Input
            placeholder="e.g. John Smith"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Reply Content</label>
          <Textarea
            rows={4}
            placeholder="Type your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Attachments <Paperclip className="inline-block h-4 w-4 ml-1 text-gray-500" />
          </label>
          <Input
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setAttachmentFiles(Array.from(e.target.files));
              }
            }}
          />
        </div>

        {/* Show selected attachments */}
        {attachmentFiles.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {attachmentFiles.map((file, i) => (
              <div key={i} className="relative w-24 h-24 border rounded flex items-center justify-center p-1">
                <span className="text-xs text-center">{file.name}</span>
                <button
                  type="button"
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                  onClick={() => handleRemoveFile(file)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* If you want to allow status changes at the same time */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Update Status (optional)</label>
          <select
            value={statusUpdate}
            onChange={(e) => setStatusUpdate(e.target.value)}
            className="border rounded p-2 text-sm"
          >
            <option value="">-- None --</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <Button type="submit">Submit Reply</Button>
      </form>
    </div>
  );
}

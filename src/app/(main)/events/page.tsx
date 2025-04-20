'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Plus, Edit, Trash2, Calendar, MapPin, Users, Clock, X, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent,  TabsList,  TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { toast } from 'sonner'; // Optional: for notifications

interface Event {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  capacity: number;
  registrations: {
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  }[];
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    coverImage: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    isVirtual: false,
    meetingLink: '',
    capacity: 20
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);

  // Add new state for file upload
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/events');
      setEvents(res.data.data);
    } catch (err: any) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      // Format dates
      const startDateTime = new Date(`${newEvent.startDate}T${newEvent.startTime}`);
      const endDateTime = new Date(`${newEvent.endDate}T${newEvent.endTime}`);

      // First upload the image if there's a file
      if (coverImageFile) {
        await uploadCoverImage();
      }

      const eventData = {
        ...newEvent,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString()
      };

      await axios.post('/api/events', eventData);
      toast?.success('Event created successfully');
      setIsModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      console.error('Error creating event:', err);
      toast?.error('Failed to create event');
    }
  };

  const handleUpdateEvent = async () => {
    try {
      // Format dates
      const startDateTime = new Date(`${newEvent.startDate}T${newEvent.startTime}`);
      const endDateTime = new Date(`${newEvent.endDate}T${newEvent.endTime}`);

      // First upload the image if there's a file
      if (coverImageFile) {
        await uploadCoverImage();
      }

      const eventData = {
        ...newEvent,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString()
      };

      await axios.put(`/api/events/${currentEvent}`, eventData);

      toast?.success('Event updated successfully');
      closeModal();
      fetchEvents();
    } catch (err: any) {
      console.error('Error updating event:', err);
      toast?.error('Failed to update event');
    }
  };

  // Add new function to handle file upload
  const uploadCoverImage = async () => {
    if (!coverImageFile) return;

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('files', coverImageFile);

      const response = await axios.post('/api/upload', formData);

      if (response.data.fileUrls && response.data.fileUrls.length > 0) {
        // Update the event with the uploaded image URL
        setNewEvent(prev => ({
          ...prev,
          coverImage: response.data.fileUrls[0]
        }));
        return response.data.fileUrls[0]; // Return the URL for any future needs
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast?.error('Failed to upload image');
      throw error;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);

      // Create and set preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      coverImage: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      isVirtual: false,
      meetingLink: '',
      capacity: 20
    });
    setCoverImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    setIsEditing(false);
    setCurrentEvent(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewEvent(prev => ({
      ...prev,
      isVirtual: checked
    }));
  };

  const handleEditClick = (event: Event) => {
    // Convert dates to expected format for the form
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    setNewEvent({
      title: event.title,
      description: event.description,
      coverImage: event.coverImage,
      startDate: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: endDate.toTimeString().slice(0, 5),
      location: event.location,
      isVirtual: event.isVirtual,
      meetingLink: event.meetingLink || '',
      capacity: event.capacity
    });

    // Set preview for existing image
    setPreviewUrl(event.coverImage);
    setCurrentEvent(event._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DotLottieReact
          src="/lottie/loading.lottie"
          autoplay
          loop
          className="h-40"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto ml-24 mt-12 max-w-6xl p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Events</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Create New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] z-[100] p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the event details' : 'Fill in the details to create a new event'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter event title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your event"
                  rows={4}
                  value={newEvent.description}
                  onChange={handleInputChange}
                />
              </div>

              {/* Replace the cover image input with file upload */}
              <div className="grid gap-2">
                <Label htmlFor="coverImage">Cover Image</Label>
                <div className="flex flex-col gap-3">
                  {previewUrl && (
                    <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          if (previewUrl && previewUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(previewUrl);
                          }
                          setPreviewUrl(null);
                          setCoverImageFile(null);
                          setNewEvent(prev => ({...prev, coverImage: ''}));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {(!previewUrl || !previewUrl.length) && (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="coverImageFile"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                        <input
                          id="coverImageFile"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}

                  {/* Hidden input to store the URL after upload */}
                  <input
                    type="hidden"
                    name="coverImage"
                    value={newEvent.coverImage}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={newEvent.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={newEvent.startTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={newEvent.endDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={newEvent.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="isVirtual">Virtual Event</Label>
                <Switch
                  id="isVirtual"
                  checked={newEvent.isVirtual}
                  onCheckedChange={handleSwitchChange}
                />
              </div>

              {newEvent.isVirtual ? (
                <div className="grid gap-2">
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    name="meetingLink"
                    placeholder="Enter meeting URL"
                    value={newEvent.meetingLink}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter event location"
                    value={newEvent.location}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  placeholder="Maximum number of attendees"
                  value={newEvent.capacity}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={isEditing ? handleUpdateEvent : handleCreateEvent}
                disabled={uploadLoading}
              >
                {uploadLoading ? 'Uploading...' : isEditing ? 'Update Event' : 'Create Event'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderEventCards(events)}
        </TabsContent>

        <TabsContent value="upcoming">
          {renderEventCards(events.filter(e => new Date(e.startDate) > new Date()))}
        </TabsContent>

        <TabsContent value="past">
          {renderEventCards(events.filter(e => new Date(e.endDate) < new Date()))}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderEventCards(eventsToRender: Event[]) {
    if (eventsToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12">
          <DotLottieReact
            src="/lottie/empty.lottie"
            autoplay
            loop
            className="h-40 mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">Create your first event to get started</p>
          <Button onClick={() => setIsModalOpen(true)}>Create Event</Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventsToRender.map(event => (
          <Card key={event._id} className="overflow-hidden">
            <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${event.coverImage})` }} />
            <CardHeader className="pb-2">
              <CardTitle>{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={14} />
                  <span>{format(new Date(event.startDate), 'PPP')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>{format(new Date(event.startDate), 'p')} - {format(new Date(event.endDate), 'p')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} />
                  <span>{event.isVirtual ? 'Virtual Event' : event.location}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users size={14} />
                  <span>{event.registrations.length} / {event.capacity} registered</span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => handleEditClick(event)}
                >
                  <Edit size={14} /> Edit
                </Button>

                <Button size="sm" variant="destructive" className="flex items-center gap-1">
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}

'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs"; // Import dayjs for formatting
import CreateAnnouncement from "./modals/createAnnouncement";

const Announcements = ({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchAttachments = async () => {
      const response = await axios.get("/api/announcements");
      setAnnouncements(response.data.attachments);
    };

    fetchAttachments();
  }, []);

  const handleAnnouncementCreated = (newAttachment: any) => {
    setAnnouncements((prev) => [...prev, newAttachment]);
  };

  return (
    <div className="p-6 mt-12">
      <CreateAnnouncement onAnnouncemnetCreated={handleAnnouncementCreated} />
      <table className="w-full mt-6 text-white">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2 px-4">Announcement Name</th>
            <th className="py-2 px-4">Start Date</th>
            <th className="py-2 px-4">End Date</th>
            <th className="py-2 px-4">Button Name</th>
            <th className="py-2 px-4">Button Link</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((attachment) => (
            <tr key={attachment._id} className="border-b border-gray-700">
              <td className="py-2 px-4">{attachment.announcementName}</td>
              <td className="py-2 px-4">
                {dayjs(attachment.startDate).format("MMM DD, YYYY HH:mm A")}
              </td>
              <td className="py-2 px-4">
                {dayjs(attachment.endDate).format("MMM DD, YYYY HH:mm A")}
              </td>
              <td className="py-2 px-4">{attachment.buttonName}</td>
              <td className="py-2 px-4">
                <a href={attachment.buttonLink} className="text-blue-500 underline">
                  {attachment.buttonLink}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Announcements;

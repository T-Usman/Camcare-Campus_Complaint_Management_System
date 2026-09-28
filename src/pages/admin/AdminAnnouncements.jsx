import React from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { AnnouncementGrid } from '../../components/announcements/AnnouncementGrid';

export function AdminAnnouncements() {
  return (
    <div>
      <Topbar
        title="Announcements"
        subtitle="Campus updates from the administration office."
      />

      <main className="page-body">
        <AnnouncementGrid isAdmin={true} />
      </main>
    </div>
  );
}

export default AdminAnnouncements;

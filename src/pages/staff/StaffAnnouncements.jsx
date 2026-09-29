import React from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { AnnouncementGrid } from '../../components/announcements/AnnouncementGrid';

export function StaffAnnouncements() {
  return (
    <div>
      <Topbar
        title="Announcements"
        subtitle="Campus updates from the administration office."
      />

      <main className="page-body">
        <AnnouncementGrid isAdmin={false} />
      </main>
    </div>
  );
}

export default StaffAnnouncements;

import React from 'react';
import { useApp } from '../../context/AppContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationControl } from '../common/NotificationControl';

export function Topbar({ title, subtitle }) {
  const { userRole, studentUser, adminUser, staffUser } = useApp();

  const defaultTitle = userRole === 'admin'
    ? `Good morning, ${adminUser.name}`
    : `Good morning, ${(userRole === 'staff' ? staffUser : studentUser).name.split(' ')[0]}`;
  const defaultSubtitle = 'Campus complaint overview for today.';

  const formattedDate = 'Tue, Jul 29, 2026';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="heading-serif">{title || defaultTitle}</h1>
        <p>{subtitle || defaultSubtitle}</p>
      </div>

      <div className="topbar-right">
        <ThemeToggle />
        <NotificationControl />
        <div className="date-text">{formattedDate}</div>
      </div>
    </header>
  );
}

export default Topbar;

export const ANNOUNCEMENT_CATEGORIES = ['IT', 'Facilities', 'Policy', 'Welfare', 'Academic', 'General'];

export const ANNOUNCEMENT_IMAGES = [
  { value: '/images/wifi.jpg', label: 'Wi-Fi Equipment' },
  { value: '/images/policy.jpg', label: 'Policy Documents' },
  { value: '/images/cafeteria.jpg', label: 'Campus Cafeteria' },
  { value: '/images/students.jpg', label: 'Students Group' },
  { value: '/images/campus-hero.jpg', label: 'Campus Building' }
];

export const DEFAULT_ANNOUNCEMENT_IMAGE = '/images/campus-hero.jpg';

// Announcement dates are stored as `YYYY-MM-DD` strings. Parse them as local
// dates (not UTC) so the day never shifts, and show them as "Jul 28, 2026".
export function formatAnnouncementDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  if (!match) return value || '';
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

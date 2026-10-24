import type { RoomType } from '@/types';

export const ROOM_OPTIONS: readonly { id: RoomType; label: string }[] = [
  { id: 'living-room', label: 'Living room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'office', label: 'Office' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'kids-room', label: 'Kids room' },
  { id: 'other', label: 'Other' },
];

export const roomLabel = (room: RoomType): string =>
  ROOM_OPTIONS.find((option) => option.id === room)?.label ?? 'Room';

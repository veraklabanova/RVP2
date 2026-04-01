'use client';

interface NotificationBadgeProps {
  count: number;
}

export default function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className="absolute flex items-center justify-center w-[18px] h-[18px] rounded-full bg-compliance-miss text-white text-[10px] font-bold leading-none min-h-0 min-w-0"
      style={{ top: '-4px', right: '-4px' }}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}

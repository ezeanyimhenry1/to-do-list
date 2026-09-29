interface IconProps {
  className?: string
}

function base(className?: string) {
  return {
    className: className ?? 'h-4 w-4',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  }
}

export const InboxIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M3 12h4l2 3h6l2-3h4" />
    <path d="M5 5h14l2 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2-7z" />
  </svg>
)

export const TodayIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
    <circle cx="12" cy="15" r="2.2" fill="currentColor" stroke="none" />
  </svg>
)

export const UpcomingIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
    <path d="M9.5 13.5l2.5 2.5 4-4.5" />
  </svg>
)

export const OverdueIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9.5V13l2.5 2.5M9 2.5h6" />
  </svg>
)

export const AnytimeIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 6h16M4 12h16M4 18h10" />
  </svg>
)

export const CompletedIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 12.5l4.5 4.5L20 6.5" />
  </svg>
)

export const StatsIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

export const SearchIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const SunIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const MoonIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </svg>
)

export const TrashIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" />
  </svg>
)

export const FlagIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </svg>
)

export const RepeatIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="m17 2 4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)

export const PlusIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const XIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const PencilIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
)

export const KeyboardIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6" />
  </svg>
)

export const DownloadIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
)

export const UploadIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 15V3m0 0 4 4m-4-4L8 7M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
)

export const TagIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z" />
    <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
  </svg>
)

export const MenuIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const CheckIcon = ({ className }: IconProps) => (
  <svg {...base(className)} strokeWidth={2.6}>
    <path d="M4.5 12.5l5 5L20 6.5" />
  </svg>
)

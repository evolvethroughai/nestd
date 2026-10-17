export function PencilIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g transform="rotate(40 12 12)">
        <path d="M9 5h6v12H9z" fill="#E9B949" />
        <path d="M9 5h2v12H9z" fill="#F6D77A" />
        <path d="M13 5h2v12h-2z" fill="#C9902D" />
        <path d="M9 17h6l-3 5-3-5Z" fill="#DFC5A1" />
        <path d="m10.8 20 1.2 2 1.2-2h-2.4Z" fill="#374151" />
        <path d="M9 4h6v2H9z" fill="#ADB5BD" />
        <path d="M9 4V3a3 3 0 0 1 6 0v1H9Z" fill="#D99B9B" />
      </g>
    </svg>
  );
}

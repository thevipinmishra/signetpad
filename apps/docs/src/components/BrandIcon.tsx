import type { BrandIcon as BrandIconData } from '../lib/brand-icons.js';
import { iconFill } from '../lib/brand-icons.js';

export function BrandIcon({
  icon,
  label,
  size = 14,
  decorative = false,
}: {
  icon: BrandIconData;
  label?: string;
  size?: number;
  decorative?: boolean;
}) {
  return (
    <span className="code-language-icon" title={decorative ? undefined : label}>
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
        <path fill={iconFill(icon.hex)} d={icon.path} />
      </svg>
      {decorative || !label ? null : <span className="visually-hidden">{label}</span>}
    </span>
  );
}

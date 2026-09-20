import type { BrandIcon as BrandIconData } from '../lib/brand-icons.js';
import { iconFill } from '../lib/brand-icons.js';

export function BrandIcon({
  icon,
  label,
  size = 16,
}: {
  icon: BrandIconData;
  label: string;
  size?: number;
}) {
  return (
    <span className="code-language-icon" title={label}>
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
        <path fill={iconFill(icon.hex)} d={icon.path} />
      </svg>
      <span className="visually-hidden">{label}</span>
    </span>
  );
}

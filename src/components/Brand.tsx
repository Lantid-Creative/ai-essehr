import logo from '@/assets/integra-logo.png';
import { cn } from '@/lib/utils';

interface BrandProps {
  className?: string;
  imgClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Integra+ brand mark — image-only logo.
 */
export function Brand({ className, imgClassName, size = 'md' }: BrandProps) {
  const heights = { sm: 'h-20', md: 'h-28', lg: 'h-36', xl: 'h-48' };
  return (
    <img
      src={logo}
      alt="Integra+"
      className={cn(heights[size], 'w-auto object-contain', className, imgClassName)}
    />
  );
}

export default Brand;

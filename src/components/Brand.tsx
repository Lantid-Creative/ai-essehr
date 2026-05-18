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
  const heights = { sm: 'h-12', md: 'h-16', lg: 'h-20', xl: 'h-28' };
  return (
    <img
      src={logo}
      alt="Integra+"
      className={cn(heights[size], 'w-auto object-contain', className, imgClassName)}
    />
  );
}

export default Brand;

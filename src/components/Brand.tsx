import logo from '@/assets/integra-logo.png';
import { cn } from '@/lib/utils';

interface BrandProps {
  className?: string;
  imgClassName?: string;
  textClassName?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Integra+ wordmark with logo image. The "+" is rendered as a true subscript.
 */
export function Brand({ className, imgClassName, textClassName, showText = true, size = 'md' }: BrandProps) {
  const heights = { sm: 'h-6', md: 'h-8', lg: 'h-10' };
  const textSize = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' };
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img src={logo} alt="Integra+" className={cn(heights[size], 'w-auto object-contain', imgClassName)} />
      {showText && (
        <span className={cn('font-heading font-bold text-ink tracking-tight leading-none', textSize[size], textClassName)}>
          Integra<sub className="text-[0.55em] font-bold align-sub ml-[1px]">+</sub>
        </span>
      )}
    </span>
  );
}

export default Brand;

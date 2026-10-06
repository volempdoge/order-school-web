import { getImageProps, type StaticImageData } from "next/image";

interface ArtDirectedImageProps {
  mobile: StaticImageData;
  desktop: StaticImageData;
  alt: string;
  className?: string;
  /** `sizes` for the mobile source; also used for desktop unless `desktopSizes` is set */
  sizes?: string;
  desktopSizes?: string;
  fill?: boolean;
  priority?: boolean;
  /** Min width (px) from which the desktop source is used */
  breakpoint?: number;
}

// One <img> inside <picture> instead of two images toggled with CSS:
// the browser downloads only the source that matches the viewport.
export default function ArtDirectedImage({
  mobile,
  desktop,
  alt,
  className,
  sizes,
  desktopSizes,
  fill,
  priority,
  breakpoint = 768,
}: ArtDirectedImageProps) {
  const common = { alt, fill, priority };
  const { props: desktopProps } = getImageProps({ ...common, src: desktop, sizes: desktopSizes ?? sizes });
  const { props: mobileProps } = getImageProps({ ...common, src: mobile, sizes });

  return (
    <picture>
      <source
        media={`(min-width: ${breakpoint}px)`}
        srcSet={desktopProps.srcSet}
        sizes={desktopProps.sizes}
        width={fill ? undefined : desktopProps.width}
        height={fill ? undefined : desktopProps.height}
      />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...mobileProps} className={className} />
    </picture>
  );
}

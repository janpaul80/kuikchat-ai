import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface FloatingIcon {
  id: number;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  className: string;
  iconClassName?: string;
  label: string;
}

export interface FloatingIconsHeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  icons: FloatingIcon[];
}

const FloatingIconItem = ({ mouseX, mouseY, iconData, index }: {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
  iconData: FloatingIcon;
  index: number;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  React.useEffect(() => {
    if (reduceMotion) return;

    const handleMouseMove = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(mouseX.current - centerX, mouseY.current - centerY);

      if (distance < 150) {
        const angle = Math.atan2(mouseY.current - centerY, mouseX.current - centerX);
        const force = (1 - distance / 150) * 50;
        x.set(-Math.cos(angle) * force);
        y.set(-Math.sin(angle) * force);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, reduceMotion, x, y]);

  const IconComponent = iconData.icon;

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn("absolute", iconData.className)}
      aria-hidden="true"
    >
      <motion.div
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:h-16 sm:w-16 md:h-20 md:w-20 md:rounded-3xl"
        animate={reduceMotion ? undefined : {
          y: [0, -8, 0, 8, 0],
          x: [0, 6, 0, -6, 0],
          rotate: [0, 4, 0, -4, 0],
        }}
        transition={{
          duration: 5 + (index % 5) * 0.8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <IconComponent className={cn(
          "h-7 w-7 text-white/90 sm:h-8 sm:w-8 md:h-10 md:w-10",
          iconData.iconClassName,
        )} />
        <span className="sr-only">{iconData.label}</span>
      </motion.div>
    </motion.div>
  );
};

const FloatingIconsHero = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FloatingIconsHeroProps
>(({ className, eyebrow, title, subtitle, ctaText, ctaHref, icons, ...props }, ref) => {
  const mouseX = React.useRef(0);
  const mouseY = React.useRef(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    mouseX.current = event.clientX;
    mouseY.current = event.clientY;
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative flex min-h-[720px] w-full items-center justify-center overflow-hidden bg-black py-24 text-white md:min-h-[820px]",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(217_91%_60%_/_0.16),transparent_38%),radial-gradient(circle_at_72%_62%,hsl(142_71%_45%_/_0.12),transparent_30%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {icons.map((iconData, index) => (
          <FloatingIconItem
            key={iconData.id}
            mouseX={mouseX}
            mouseY={mouseY}
            iconData={iconData}
            index={index}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.65 }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        {eyebrow && (
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-blue-400">
            {eyebrow}
          </p>
        )}
        <h2 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-7xl">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
          {subtitle}
        </p>
        <div className="mt-10">
          <Button asChild size="xl" variant="hero" className="px-8 text-base font-semibold">
            <a href={ctaHref}>{ctaText}</a>
          </Button>
        </div>
      </motion.div>
    </section>
  );
});

FloatingIconsHero.displayName = "FloatingIconsHero";

export { FloatingIconsHero };

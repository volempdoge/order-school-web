import SectionHeading from "@/components/SectionHeading";
import SocialLinks from "@/components/SocialLinks";

export default function Contacts({ id }: { id?: string }) {
  return (
    <section id={id} className="relative w-full">
      <div className="bg-primary px-6 py-12 text-center md:py-16">
        <div className="text-white">
          <SectionHeading tone="inverse">Наші соцмережі</SectionHeading>
          {/* Large bold text: required for AA contrast of white on the brand red */}
          <p className="mt-6 text-xl leading-snug font-bold">
            Більше про гурток дізнавайтеся, написавши нам у Telegram або на пошту
          </p>
          <SocialLinks className="mx-auto mt-12 flex max-w-xs justify-between" />
        </div>
      </div>
    </section>
  );
}

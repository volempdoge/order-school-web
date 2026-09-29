import SectionHeading from "@/components/SectionHeading";
import { Disclosure } from "@/components/ui/disclosure";
import { faq } from "@/content/site";

export default function Faq({ id }: { id?: string }) {
  return (
    <section id={id} className="relative w-full py-12 md:py-20">
      <div data-reveal="up" className="mx-auto max-w-6xl px-6">
        <SectionHeading>Відповіді на поширені запитання</SectionHeading>
      </div>

      <div className="mx-auto my-12 max-w-7xl px-6 md:my-16 md:px-8">
        {faq.map((item, i) => (
          <Disclosure
            key={item.q}
            name="faq"
            data-reveal="up"
            style={{ "--reveal-delay": `${Math.min(i, 5) * 0.05}s` } as React.CSSProperties}
            summary={<h3>{item.q}</h3>}
          >
            <p>{item.a}</p>
          </Disclosure>
        ))}
      </div>
    </section>
  );
}

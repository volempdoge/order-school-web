export default function Map() {
  return (
    <section className="relative w-full" aria-label="Як нас знайти">
      <iframe
        title="Київська школа економіки на Google Maps"
        className="pointer-events-auto h-[50vh] w-full"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3020.6466551217677!2d30.42773540751654!3d50.45877602475506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce632498e36d%3A0x2254c30854d16308!2sKyiv%20School%20of%20Economics!5e0!3m2!1sen!2sua!4v1759863871447!5m2!1sen!2sua"
      />
    </section>
  );
}

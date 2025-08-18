export default function ContactSection() {
  return (
    <section id="contacto" className="py-10 text-center">
      <h2 className="text-3xl font-bold mb-4">📞 Contáctanos</h2>
      <p className="text-gray-400 mb-4">¿Tienes dudas? ¡Estamos para ayudarte!</p>
      <a
        href="https://wa.me/573025636290?text=Hola, quiero más información sobre sus productos."
        target="_blank"
        className="bg-green-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-green-700 transition"
      >
        Escríbenos por WhatsApp
      </a>
    </section>
  )
}

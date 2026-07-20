/** Fundo com brilho azul sutil + grade discreta, usado nos cartões escuros
 * do sistema (login, hero do Dashboard, card de perfil em Configurações) pra
 * dar uma identidade visual consistente. O elemento pai precisa ser
 * `relative overflow-hidden`. */
export default function DarkPatternBg({ glowPosition = "0% 0%" }: { glowPosition?: string }) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at ${glowPosition}, rgba(37,99,235,0.28), transparent 55%), radial-gradient(circle at 100% 100%, rgba(37,99,235,0.14), transparent 45%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
    </>
  );
}

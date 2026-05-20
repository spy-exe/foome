export function Footer() {
  return (
    <footer className="bg-ink py-10 text-center dark:bg-black">
      <div className="container-page">
        <div className="mb-2 font-heading text-2xl font-extrabold text-brand">Foome</div>
        <p className="text-sm text-ink-3 dark:text-[#9494B2]">
          &copy; {new Date().getFullYear()} Foome. Todos os direitos reservados.
        </p>
        <p className="mt-1 text-xs text-ink-4 dark:text-[#6A6A82]">
          Feito com ❤️ em Vassouras, RJ
        </p>
      </div>
    </footer>
  );
}

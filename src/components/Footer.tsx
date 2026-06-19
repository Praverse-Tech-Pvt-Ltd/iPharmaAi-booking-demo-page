import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t mt-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between">

        {/* Logo + tagline */}
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Image
            src="/ipharmaAi Logo (Blue).png"
            alt="Audit Mind"
            width={140}
            height={36}
            className="h-8 w-auto object-contain dark:hidden"
          />
          <Image
            src="/ipharmaAi Logo (White).png"
            alt="Audit Mind"
            width={140}
            height={36}
            className="hidden h-[26px] w-auto object-contain dark:block"
          />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Transforming pharmacy with AI</p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: 'var(--muted)' }}>
          <a href="#" className="transition-colors hover:text-[var(--accent)]">Privacy Policy</a>
          <a href="#" className="transition-colors hover:text-[var(--accent)]">Terms of Service</a>
          <a href="mailto:hello@auditmind.com" className="transition-colors hover:text-[var(--accent)]">Contact</a>
        </nav>

        {/* Copyright */}
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          &copy; {new Date().getFullYear()} Audit Mind. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

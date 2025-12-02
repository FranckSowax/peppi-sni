'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src="/LOGO SNI copie.png"
              alt="Logo SNI"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">PEPPI-SNI</span>
            <span className="text-xs text-muted-foreground leading-tight">
              Société Nationale Immobilière
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="#modules" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Modules
          </Link>
          <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            À propos
          </Link>
          <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <Link href="/login">
          <Button>
            Connexion
          </Button>
        </Link>
      </div>
    </header>
  );
}

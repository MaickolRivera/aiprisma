import { Workflow, Layers, Newspaper } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
      <path d="M16 6 27 25H5Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}


const links = [
  { href: "#how-it-works", label: "Cómo funciona", icon: Workflow },
  { href: "#categories", label: "Categorías", icon: Layers },
  { href: "#news", label: "Noticias", icon: Newspaper },
];


export function Header() {
  return (
    <header className="
    w-screen flex justify-center items-center
    fixed top-0 left-0 z-100 py-2 pointer-events-none">

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[calc(100%+1.5rem)] -z-10
        bg-linear-to-b from-background via-background/80 to-transparent
        backdrop-blur-[2px]
        mask-[linear-gradient(to_bottom,black_10%,transparent)]"
      />

      <div className="
      mx-auto max-w-6xl px-3 py-0.5
      flex items-center justify-between gap-1 
      pointer-events-auto border rounded-full backdrop-blur-md">

        <a href="#" className="px-1.5">
          <Logo />
        </a>
        
        <span className="w-px h-5 mx-1 bg-ring" aria-hidden="true" /> 

        <nav className="items-center gap-2 md:flex" aria-label="Principal">
          {links.map(({ href, label, icon: Icon }) => (
            <a key={href} href={href} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground hover:text-foreground")}>
              <Icon/>
              <p className="hidden md:block">{label}</p>
            </a>
          ))}

        </nav>
        <span className="w-px h-5 mx-1 bg-ring" aria-hidden="true" />
          <ThemeToggle />
      </div>
    </header>
  );
}

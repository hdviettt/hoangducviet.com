import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import Container from "@/components/Container";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto border-t-2 border-border/20 bg-secondary/30 backdrop-blur-sm">
      <Container>
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">VIET</h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Creative developer & designer crafting digital experiences with modern technologies.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/posts" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200">
                    About
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Connect</h4>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/colbyfayock/test-directus-blog"
                  className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="mailto:contact@example.com"
                  className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-border/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-xs text-muted-foreground font-mono">
                © {currentYear} VIET. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 font-mono">
                  Privacy
                </Link>
                <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 font-mono">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

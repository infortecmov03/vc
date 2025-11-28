import { Header } from '@/components/header';
import { ProductShowcase } from '@/components/product-showcase';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <ProductShowcase />
        </div>
      </main>
      <footer className="border-t py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Construído por Bazar Moçambique. Todos os direitos reservados.
            </p>
        </div>
      </footer>
    </div>
  );
}

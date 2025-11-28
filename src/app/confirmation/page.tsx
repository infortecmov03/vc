import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <main>
        <Card className="w-full max-w-md text-center shadow-2xl">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="mt-4 text-2xl">Pedido Confirmado!</CardTitle>
            <CardDescription>
              Obrigado pela sua compra. Seu pedido foi recebido e está sendo processado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Você receberá uma confirmação por e-mail em breve.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href="/">Voltar para a Loja</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

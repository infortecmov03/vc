import { firestore } from '@/firebase/server';
import type { Product } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { placeholderProducts } from '@/lib/placeholder-products';
import placeholderImages from '@/lib/placeholder-images.json';

async function getProduct(id: string): Promise<Product | null> {
  try {
    const docRef = doc(firestore, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
  } catch (error) {
    console.error("Error fetching product from Firestore:", error);
  }

  // Fallback to placeholder data if not found in Firestore or if there's an error
  const placeholderProduct = placeholderProducts.find(p => p.id === id);
  return placeholderProduct || null;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const allImages = [
    ...(product.images || []),
    ...(product.previewImages || []),
  ];
  
  if (allImages.length === 0) {
    allImages.push(placeholderImages.productFallback.src.replace('{id}', product.id));
  }

  return (
    <div className="container mx-auto max-w-5xl py-12">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
              {allImages.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-square relative">
                    <Image
                      src={img}
                      alt={`${product.name} - imagem ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {allImages.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
              </>
            )}
          </Carousel>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold font-headline">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                 {product.isOnSale && <Badge>Promoção</Badge>}
                 {product.isFeatured && <Badge variant="secondary">Destaque</Badge>}
                 {product.stock <= 0 && <Badge variant="destructive">Esgotado</Badge>}
              </div>
              <p className="text-4xl font-bold mb-6">
                {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(product.price)}
              </p>
              
              <div className="flex items-center gap-4">
                <AddToCartButton product={product} />
                 <p className="text-sm text-muted-foreground">{product.stock} em stock</p>
              </div>

               <Separator className="my-6" />

               {product.socialProof && product.socialProof.length > 0 && (
                 <div>
                    <h3 className="text-lg font-semibold mb-4">O que os clientes dizem</h3>
                    <div className="space-y-4">
                      {product.socialProof.slice(0, 2).map((proof, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                           <Image 
                              src={proof.image.replace('{seed}', `avatar${index+1}`)} 
                              alt={proof.author} 
                              width={40} height={40} 
                              className="rounded-full object-cover" 
                              data-ai-hint={placeholderImages.avatar.hint}
                            />
                           <div>
                              <p className="text-sm italic">\"{proof.text}\"</p>
                              <p className="text-xs text-muted-foreground mt-1">- {proof.author}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

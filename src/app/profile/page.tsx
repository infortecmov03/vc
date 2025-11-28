'use client';

import { useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, Timestamp, collection, query, where, getDoc, updateDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderHistory } from '@/components/order-history';
import { Order } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Copy, Gift, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { Label } from '@/components/ui/label';


interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Timestamp;
  referralCode?: string;
  referralCount?: number;
  availableDiscount?: number;
  locationLatitude?: number;
  locationLongitude?: number;
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [accountAge, setAccountAge] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSavingLocation, setIsSavingLocation] = useState(false);


  // Redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'orders'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  useEffect(() => {
    async function fetchUserProfile() {
        if (userRef) {
            setIsProfileLoading(true);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const profileData = docSnap.data() as UserProfile;
                setUserProfile(profileData);
                setLatitude(String(profileData.locationLatitude || ''));
                setLongitude(String(profileData.locationLongitude || ''));
            }
            setIsProfileLoading(false);
        }
    }
    fetchUserProfile();
  }, [userRef]);

  useEffect(() => {
    if (userProfile?.createdAt) {
      const date = userProfile.createdAt.toDate();
      setAccountAge(formatDistanceToNow(date, { addSuffix: true, locale: ptBR }));
    }
  }, [userProfile]);
  
  const referralLink = useMemo(() => {
    if (typeof window !== 'undefined' && userProfile?.referralCode) {
      return `${window.location.origin}/signup?ref=${userProfile.referralCode}`;
    }
    return '';
  }, [userProfile?.referralCode]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Link copiado!',
      description: 'Seu link de convite foi copiado para a área de transferência.',
    });
  };

  const handleSaveLocation = async () => {
    if (!userRef) return;
    setIsSavingLocation(true);
    try {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lon)) {
            toast({
                variant: 'destructive',
                title: 'Localização Inválida',
                description: 'Por favor, insira valores numéricos para latitude e longitude.',
            });
            return;
        }

        await updateDoc(userRef, {
            locationLatitude: lat,
            locationLongitude: lon,
        });

        toast({
            title: 'Localização salva!',
            description: 'Seu endereço foi atualizado com sucesso.',
        });
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Erro ao salvar',
            description: 'Não foi possível salvar sua localização. Tente novamente.',
        });
    } finally {
        setIsSavingLocation(false);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/');
  };

  const isLoading = isUserLoading || isProfileLoading || areOrdersLoading;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-muted/40">
        <div className="container grid gap-8 py-8 md:grid-cols-3 md:py-12">
          <div className="flex flex-col gap-8 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>Gerencie as informações da sua conta e localização.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">Nome</h3>
                  {isLoading ? <Skeleton className="h-5 w-48" /> : <p>{userProfile?.name}</p>}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Email</h3>
                  {isLoading ? <Skeleton className="h-5 w-64" /> : <p>{userProfile?.email}</p>}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Membro desde</h3>
                  {isLoading ? <Skeleton className="h-5 w-32" /> : <p>{accountAge}</p>}
                </div>
                 <div className="space-y-2">
                  <h3 className="font-semibold">Total de Compras</h3>
                  {isLoading ? <Skeleton className="h-5 w-12" /> : <p>{orders?.length ?? 0}</p>}
                </div>
                
                <div className="space-y-4 rounded-lg border bg-background p-4">
                    <h3 className='font-semibold'>Minha Localização para Entrega</h3>
                    <div className="grid gap-2">
                        <Label htmlFor='latitude'>Latitude</Label>
                        <Input id='latitude' placeholder='Ex: -25.9653' value={latitude} onChange={(e) => setLatitude(e.target.value)} disabled={isLoading || isSavingLocation}/>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor='longitude'>Longitude</Label>
                        <Input id='longitude' placeholder='Ex: 32.5892' value={longitude} onChange={(e) => setLongitude(e.target.value)} disabled={isLoading || isSavingLocation}/>
                    </div>
                    <Button onClick={handleSaveLocation} disabled={isLoading || isSavingLocation} className='w-full'>
                        {isSavingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSavingLocation ? 'Salvando...' : 'Salvar Localização'}
                    </Button>
                </div>


                <Button variant="destructive" onClick={handleLogout}>
                  Sair
                </Button>
              </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Convide e Ganhe</CardTitle>
                    <CardDescription>
                    Compartilhe seu link e ganhe **MT100 de desconto** para cada amigo que se cadastrar!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {isLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <div className="flex items-center gap-2">
                          <Input value={referralLink} readOnly />
                          <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyToClipboard}
                          disabled={!referralLink}
                          >
                          <Copy className="h-4 w-4" />
                          </Button>
                      </div>
                    )}
                    <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                        <div className="flex items-center gap-3">
                            <Gift className="h-6 w-6 text-primary" />
                            <div>
                                <p className="text-sm font-medium">Seu Saldo</p>
                                <p className="text-xs text-muted-foreground">{userProfile?.referralCount ?? 0} convites bem-sucedidos</p>
                            </div>
                        </div>
                        {isLoading ? <Skeleton className="h-6 w-24" /> : 
                        <p className="text-xl font-bold text-primary">MT{(userProfile?.availableDiscount ?? 0).toFixed(2)}</p>}
                    </div>
                </CardContent>
             </Card>

          </div>
          <div className="md:col-span-2">
            <OrderHistory orders={orders} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}

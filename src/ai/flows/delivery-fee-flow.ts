'use server';

/**
 * @fileOverview A flow for calculating delivery fees based on distance.
 *
 * - calculateDeliveryFee - Calculates the delivery fee.
 * - DeliveryFeeInput - The input type for the calculateDeliveryFee function.
 * - DeliveryFeeOutput - The return type for the calculateDeliveryFee function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeliveryFeeInputSchema = z.object({
  userLatitude: z.number().describe('The latitude of the user\'s location.'),
  userLongitude: z.number().describe('The longitude of the user\'s location.'),
  sellerId: z.string().describe('The ID of the seller.'),
});
export type DeliveryFeeInput = z.infer<typeof DeliveryFeeInputSchema>;

const DeliveryFeeOutputSchema = z.object({
  distanceKm: z.number().describe('The calculated distance in kilometers.'),
  deliveryFee: z.number().describe('The calculated delivery fee.'),
  sellerLocation: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
});
export type DeliveryFeeOutput = z.infer<typeof DeliveryFeeOutputSchema>;

// Helper function to calculate distance between two lat/lon points (Haversine formula)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// In a real app, this would fetch from Firestore: /sellers/{sellerId}
const getSellerLocation = async (sellerId: string) => {
    // For now, hardcode the location of the Bazar Moçambique store in Maputo
    return {
        latitude: -25.9653, // Maputo latitude
        longitude: 32.5892, // Maputo longitude
    };
};

const getDeliveryRate = async (sellerId: string) => {
    // In a real app, this would fetch from: /sellers/{sellerId}/deliveryRates/{rateId}
    return 15; // 15 MT per Km
}


const calculateDeliveryFeeFlow = ai.defineFlow(
  {
    name: 'calculateDeliveryFeeFlow',
    inputSchema: DeliveryFeeInputSchema,
    outputSchema: DeliveryFeeOutputSchema,
  },
  async (input) => {
    const sellerLocation = await getSellerLocation(input.sellerId);
    const ratePerKm = await getDeliveryRate(input.sellerId);

    const distanceKm = getDistanceFromLatLonInKm(
        input.userLatitude,
        input.userLongitude,
        sellerLocation.latitude,
        sellerLocation.longitude
    );

    const deliveryFee = distanceKm * ratePerKm;

    return {
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        sellerLocation: {
            lat: sellerLocation.latitude,
            lon: sellerLocation.longitude
        }
    };
  }
);


export async function calculateDeliveryFee(input: DeliveryFeeInput): Promise<DeliveryFeeOutput> {
    if (input.userLatitude === 0 && input.userLongitude === 0) {
        return {
            distanceKm: 0,
            deliveryFee: 0,
            sellerLocation: { lat: 0, lon: 0}
        }
    }
  return calculateDeliveryFeeFlow(input);
}

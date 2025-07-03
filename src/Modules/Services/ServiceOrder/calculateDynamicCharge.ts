import db from "../../../config/db";
import { ServiceOrder, ServiceProviders, } from "../models/associations"; 

interface ServiceOrderWithTotalEarnings {
    totalEarnings: number;
}

// Interfaces for PriceTier and EarningsTier
interface PriceTier {
    minPrice: number;
    maxPrice: number;
    charge: number;
}

interface EarningsTier {
    minEarnings: number;
    maxEarnings: number;
    priceTiers: PriceTier[];
}

// Earnings Tiers Configuration
const earningsTiers: EarningsTier[] = [
    {
        minEarnings: 0,
        maxEarnings: 999,
        priceTiers: [
            { minPrice: 50, maxPrice: 99, charge: 1 },
            { minPrice: 100, maxPrice: 199, charge: 2 },
            { minPrice: 200, maxPrice: 299, charge: 3 },
            { minPrice: 300, maxPrice: 499, charge: 5 },
            { minPrice: 500, maxPrice: 999, charge: 10 },
        ],
    },
    {
        minEarnings: 1000,
        maxEarnings: 4999,
        priceTiers: [
            { minPrice: 50, maxPrice: 99, charge: 2 },
            { minPrice: 100, maxPrice: 199, charge: 4 },
            { minPrice: 200, maxPrice: 299, charge: 6 },
            { minPrice: 300, maxPrice: 499, charge: 8 },
            { minPrice: 500, maxPrice: 999, charge: 12 },
        ],
    },
    {
        minEarnings: 5000,
        maxEarnings: 9999,
        priceTiers: [
            { minPrice: 50, maxPrice: 99, charge: 3 },
            { minPrice: 100, maxPrice: 199, charge: 5 },
            { minPrice: 200, maxPrice: 299, charge: 8 },
            { minPrice: 300, maxPrice: 499, charge: 10 },
            { minPrice: 500, maxPrice: 999, charge: 15 },
        ],
    },
    {
        minEarnings: 10000,
        maxEarnings: Infinity,
        priceTiers: [
            { minPrice: 50, maxPrice: 99, charge: 5 },
            { minPrice: 100, maxPrice: 199, charge: 8 },
            { minPrice: 200, maxPrice: 299, charge: 10 },
            { minPrice: 300, maxPrice: 499, charge: 15 },
            { minPrice: 500, maxPrice: 999, charge: 20 },
        ],
    },
];

// Function to calculate dynamic charge based on service price and total earnings
export function calculateDynamicCharge(servicePrice: number, totalEarnings: number): number {
    for (const tier of earningsTiers) {
        if (totalEarnings >= tier.minEarnings && totalEarnings <= tier.maxEarnings) {
            for (const priceTier of tier.priceTiers) {
                if (servicePrice >= priceTier.minPrice && servicePrice <= priceTier.maxPrice) {
                    return priceTier.charge;
                }
            }
        }
    }
    return 100; // Default charge for high-priced services
}

// Function to calculate total earnings for a provider
// Function to calculate total earnings for a provider
export async function calculateTotalEarnings(providerUserId: string, transaction: any): Promise<number> {
   console.log(providerUserId);
   
    const provider = await ServiceProviders.findOne({
        where: {
            user_id: providerUserId, 
        },
        attributes: ['totalEarnings'], 
        transaction,
    });

    // If the provider is found, return their total earnings; otherwise, return 0
    return provider?.totalEarnings || 0;
}

// Function to check if the provider can afford the deduction
export function canAffordDeduction(points: number, pointsToDeduct: number): boolean {
    return points >= pointsToDeduct;
}
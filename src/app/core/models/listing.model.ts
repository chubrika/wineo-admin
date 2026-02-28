/**
 * Listing data model for winemaking equipment marketplace.
 * Used for both SELL and RENT listings.
 */

export type ListingType = 'sell' | 'rent';

export type RentPeriod = 'hour' | 'day' | 'week' | 'month';

export type ListingCurrency = 'GEL' | 'USD';

export type PriceType = 'fixed' | 'negotiable';

export type ListingCondition = 'new' | 'used';

export type ListingStatus = 'active' | 'sold' | 'rented' | 'expired';

export type PromotionType = 'none' | 'highlighted' | 'featured' | 'homepageTop';

export interface ListingCategory {
  name: string;
  slug: string;
}

/** Filter attribute value for a listing (stored when category has filters). */
export interface ListingAttribute {
  filterId: string;
  value: string | number | boolean | string[];
}

export interface ListingLocation {
  region: string;
  city: string;
}

export interface ListingSpecifications {
  condition?: ListingCondition;
  brand?: string;
  model?: string;
  year?: number;
  capacity?: string;
  power?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Listing {
  _id: string;
  id?: string; // API may return id instead of _id
  title: string;
  slug: string;
  description: string;
  type: ListingType;

  category: ListingCategory;
  categoryId?: string;
  attributes?: ListingAttribute[];

  price: number;
  currency: ListingCurrency;
  priceType: PriceType;
  rentPeriod?: RentPeriod; // only when type === 'rent'

  images: string[];
  thumbnail?: string;

  specifications: ListingSpecifications;

  location: ListingLocation;

  ownerId: string;

  status: ListingStatus;

  promotionType: PromotionType;
  promotionExpiresAt?: string | null;

  views: number;
  saves: number;

  seoTitle?: string;
  seoDescription?: string;

  createdAt: string;
  updatedAt: string;
}

/** For create/update forms and API payloads */
export interface ListingCreatePayload {
  title: string;
  slug?: string;
  description: string;
  type: ListingType;

  category: ListingCategory;
  categoryId?: string;
  attributes?: ListingAttribute[];

  price: number;
  currency: ListingCurrency;
  priceType: PriceType;
  rentPeriod?: RentPeriod;

  images?: string[];
  thumbnail?: string;

  specifications?: ListingSpecifications;

  location: ListingLocation;

  status?: ListingStatus;

  promotionType?: PromotionType;
  promotionExpiresAt?: string | null;

  seoTitle?: string;
  seoDescription?: string;
}

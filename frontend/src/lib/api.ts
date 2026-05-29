export interface Salon {
  id: number;
  placeId: string;
  name: string;
  address: string;
  district: string;
  phone: string | null;
  website: string | null;
  rating: string | null; // stored as numeric/string in backend
  reviewCount: number | null;
  priceLevel: number | null;
  priceRange: string | null;
  services: string[] | null;
  lat: string;
  lng: string;
  updatedAt: string;
}

export interface SalonListResponse {
  data: Salon[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SalonUpdateInput {
  name?: string;
  phone?: string;
  website?: string;
  services?: string[];
  priceLevel?: number;
  district?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Fetch paginated salons list with optional filtering and search params.
 */
export async function getSalons(params: {
  district?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<SalonListResponse> {
  const query = new URLSearchParams();
  if (params.district) query.set('district', params.district);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/salons?${query.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch salons: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch distinct districts list for filter dropdown.
 */
export async function getDistricts(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/salons/districts`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch districts: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch detail information for a single salon.
 */
export async function getSalonDetails(id: number): Promise<Salon> {
  const response = await fetch(`${API_BASE_URL}/salons/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch salon details for ID ${id}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update editable salon attributes.
 */
export async function updateSalon(id: number, data: SalonUpdateInput): Promise<Salon> {
  const response = await fetch(`${API_BASE_URL}/salons/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorDetails.message || `Failed to update salon ID ${id}`);
  }

  return response.json();
}

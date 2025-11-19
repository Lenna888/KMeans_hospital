import { KMeansResult } from "@/types/kmeans";

// URL del backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface KMeansRequest {
 num_neighborhoods: number;
 num_hospitals: number | null;
 plane_size: number;
 seed?: number;
}


export interface APIKMeansResponse {
 neighborhoods: Array<{
  id: number;
  x: number;
  y: number;
  weight: number; 
  cluster: number;
 }>;
 hospitals: Array<{
  id: number;
  x: number;
  y: number;
 }>;
 optimal_clusters: number;
 sse: number;
 silhouette_score: number;
 iterations: number;
 metrics: {
  avg_distance: number;
  max_distance: number;
  min_distance: number;
  std_distance: number;
  neighborhoods_per_hospital: Record<string, number>;
 };
}

export const runKMeansAPI = async (
 numNeighborhoods: number,
 numHospitals: number,
 planeSize: number
): Promise<KMeansResult> => {
 const request: KMeansRequest = {
  num_neighborhoods: numNeighborhoods,
  num_hospitals: numHospitals,
  plane_size: planeSize,
  seed: 42,
 };

 const response = await fetch(`${API_BASE_URL}/kmeans`, {
  method: "POST",
  headers: {
   "Content-Type": "application/json",
  },
  body: JSON.stringify(request),
 });

 if (!response.ok) {
  const error = await response.json().catch(() => ({ detail: "Error desconocido" }));
  throw new Error(error.detail || `Error ${response.status}: ${response.statusText}`);
 }

 const data: APIKMeansResponse = await response.json();


 // Transformar la respuesta al formato del frontend
 return {
  neighborhoods: data.neighborhoods.map((n) => ({
   id: n.id,
   x: n.x,
   y: n.y,
   weight: n.weight, 
   cluster: n.cluster,
  })),
  hospitals: data.hospitals.map((h) => ({
   id: h.id,
   x: h.x,
   y: h.y,
  })),
  optimalClusters: data.optimal_clusters,
 };
};

export const checkAPIHealth = async (): Promise<boolean> => {
 try {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.ok;
 } catch {
  return false;
 }
};
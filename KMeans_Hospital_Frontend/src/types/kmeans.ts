export interface Point {
  x: number;
  y: number;
  id: number;
  weight: number;
  cluster?: number;
}

export interface Hospital {
  x: number;
  y: number;
  id: number;
}

export interface KMeansResult {
  neighborhoods: Point[];
  hospitals: Hospital[];
  optimalClusters: number;
}

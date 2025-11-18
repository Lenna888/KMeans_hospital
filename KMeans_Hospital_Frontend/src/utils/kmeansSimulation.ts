import { Point, Hospital, KMeansResult } from "@/types/kmeans";

// Genera vecindarios con distribución asimétrica
export const generateNeighborhoods = (count: number, planeSize: number): Point[] => {
  const neighborhoods: Point[] = [];
  const margin = planeSize * 0.005; // 0.5% margen
  
  for (let i = 0; i < count; i++) {
    // Distribución asimétrica usando clusters aleatorios
    const clusterX = Math.random() * planeSize;
    const clusterY = Math.random() * planeSize;
    
    // Añadir variación alrededor del cluster (30% del espacio)
    const offsetX = (Math.random() - 0.5) * (planeSize * 0.3);
    const offsetY = (Math.random() - 0.5) * (planeSize * 0.3);
    
    neighborhoods.push({
      x: Math.max(margin, Math.min(planeSize - margin, clusterX + offsetX)),
      y: Math.max(margin, Math.min(planeSize - margin, clusterY + offsetY)),
      id: i + 1,
    });
  }
  
  return neighborhoods;
};

// Calcula la distancia euclidiana entre dos puntos
const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// Algoritmo K-means simplificado
export const runKMeans = (
  neighborhoods: Point[],
  k: number,
  maxIterations: number = 100
): { neighborhoods: Point[]; centroids: Hospital[] } => {
  // Inicializar centroides aleatoriamente
  let centroids: Hospital[] = [];
  const usedIndices = new Set<number>();
  
  for (let i = 0; i < k; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * neighborhoods.length);
    } while (usedIndices.has(randomIndex));
    
    usedIndices.add(randomIndex);
    centroids.push({
      x: neighborhoods[randomIndex].x,
      y: neighborhoods[randomIndex].y,
      id: i + 1,
    });
  }
  
  let assignedNeighborhoods = [...neighborhoods];
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Asignar cada vecindario al centroide más cercano
    assignedNeighborhoods = assignedNeighborhoods.map((neighborhood) => {
      let minDistance = Infinity;
      let closestCluster = 0;
      
      centroids.forEach((centroid, index) => {
        const dist = distance(neighborhood, centroid);
        if (dist < minDistance) {
          minDistance = dist;
          closestCluster = index;
        }
      });
      
      return { ...neighborhood, cluster: closestCluster };
    });
    
    // Recalcular centroides
    const newCentroids: Hospital[] = [];
    for (let i = 0; i < k; i++) {
      const clusterPoints = assignedNeighborhoods.filter((n) => n.cluster === i);
      
      if (clusterPoints.length > 0) {
        const sumX = clusterPoints.reduce((sum, p) => sum + p.x, 0);
        const sumY = clusterPoints.reduce((sum, p) => sum + p.y, 0);
        
        newCentroids.push({
          x: sumX / clusterPoints.length,
          y: sumY / clusterPoints.length,
          id: i + 1,
        });
      } else {
        newCentroids.push(centroids[i]);
      }
    }
    
    // Verificar convergencia
    const converged = centroids.every((centroid, i) => 
      Math.abs(centroid.x - newCentroids[i].x) < 0.1 &&
      Math.abs(centroid.y - newCentroids[i].y) < 0.1
    );
    
    centroids = newCentroids;
    
    if (converged) break;
  }
  
  return { neighborhoods: assignedNeighborhoods, centroids };
};

// Método del codo para determinar el número óptimo de clusters
export const calculateOptimalClusters = (neighborhoods: Point[]): number => {
  const maxK = Math.min(10, Math.floor(neighborhoods.length / 3));
  const wcss: number[] = [];
  
  for (let k = 1; k <= maxK; k++) {
    const { neighborhoods: clustered } = runKMeans(neighborhoods, k, 50);
    
    // Calcular WCSS (Within-Cluster Sum of Squares)
    let sum = 0;
    for (let i = 0; i < k; i++) {
      const clusterPoints = clustered.filter((n) => n.cluster === i);
      if (clusterPoints.length > 0) {
        const centroidX = clusterPoints.reduce((s, p) => s + p.x, 0) / clusterPoints.length;
        const centroidY = clusterPoints.reduce((s, p) => s + p.y, 0) / clusterPoints.length;
        
        clusterPoints.forEach((point) => {
          sum += Math.pow(distance(point, { x: centroidX, y: centroidY }), 2);
        });
      }
    }
    wcss.push(sum);
  }
  
  // Encontrar el "codo" usando la segunda derivada
  let optimalK = 3; // valor por defecto
  let maxSecondDerivative = 0;
  
  for (let i = 1; i < wcss.length - 1; i++) {
    const secondDerivative = wcss[i - 1] - 2 * wcss[i] + wcss[i + 1];
    if (secondDerivative > maxSecondDerivative) {
      maxSecondDerivative = secondDerivative;
      optimalK = i + 1;
    }
  }
  
  return optimalK;
};

export const simulateKMeans = (
  numNeighborhoods: number,
  numHospitals: number,
  planeSize: number
): KMeansResult => {
  const neighborhoods = generateNeighborhoods(numNeighborhoods, planeSize);
  const optimalClusters = calculateOptimalClusters(neighborhoods);
  
  const { neighborhoods: clusteredNeighborhoods, centroids } = runKMeans(
    neighborhoods,
    numHospitals
  );
  
  return {
    neighborhoods: clusteredNeighborhoods,
    hospitals: centroids,
    optimalClusters,
  };
};

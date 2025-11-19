"""
Backend API para el modelo K-Means de ubicación óptima de hospitales (Ponderado).
Incluye la lógica de K-Means simple (geométrico) y la búsqueda del K óptimo por Silhouette Score.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np
import math

# Inicialización de la aplicación
app = FastAPI(
    title="KMeans Hospital API",
    description="API para determinar la ubicación óptima de hospitales usando K-Means",
    version="3.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Modelos Pydantic

class Point(BaseModel):
    id: int
    x: float
    y: float
    weight: float = Field(1.0, description="Peso o Población del vecindario.")
    cluster: Optional[int] = None

class Hospital(BaseModel):
    id: int
    x: float
    y: float

class KMeansRequest(BaseModel):
    num_neighborhoods: int = Field(100, ge=2, le=1000000, description="Número de vecindarios (M)")
    num_hospitals: Optional[int] = Field(5, ge=1, le=1000000, description="Número de hospitales (A)")
    plane_size: int = Field(1000, ge=10, le=1000000, description="Tamaño del plano (n x n)") 
    seed: Optional[int] = Field(42, description="Semilla para reproducibilidad")

class KMeansResponse(BaseModel):
    neighborhoods: List[Point]
    hospitals: List[Hospital]
    optimal_clusters: int
    sse: float
    silhouette_score: float
    iterations: int
    metrics: dict


# IMPLEMENTACIÓN DEL ALGORITMO K-MEANS

def distancia_euclidiana(punto1, punto2):
    """Calcula la distancia euclidiana entre dos puntos (arrays de numpy)."""
    return np.sqrt(np.sum((punto1 - punto2) ** 2))

def generar_vecindarios(n_vecindarios: int, universe_size: int, seed: int = 42):
    """
    Genera vecindarios con distribución asimétrica y alta dispersión
    para evitar clusters iniciales.
    """
    np.random.seed(seed)
    vecindarios = []
    id_vecindario = 0

    # Definimos 5 CENTROS INICIALES MUY SEPARADOS y los mezclaremos. (Focos de densidad)
    num_centros_densidad = 5
    centros_densidad = np.random.uniform(0, universe_size, (num_centros_densidad, 2))
    
    # Asimetría: Define la probabilidad de que un punto caiga en un foco
    proporciones = np.array([2.0, 0.5, 1.5, 0.7, 1.3]) 
    proporciones = proporciones / np.sum(proporciones)
    
    # Dispersión Fuerte (45% del universo) para mezclar los 5 grupos
    base_dispersion = universe_size * 0.45 
    
    for i in range(n_vecindarios):
        centro_idx = np.random.choice(num_centros_densidad, p=proporciones)
        centro = centros_densidad[centro_idx]
        
        # Ajuste por asimetría: los centros más densos tienen una dispersión ligeramente menor.
        current_dispersion = base_dispersion * (1.05 - proporciones[centro_idx]) 
        
        # Generar las coordenadas y asegurarse de que estén dentro del plano
        x = np.clip(np.random.normal(centro[0], current_dispersion), 0, universe_size)
        y = np.clip(np.random.normal(centro[1], current_dispersion), 0, universe_size)

        # Población con distribución log-normal para simular alta variabilidad
        poblacion = np.random.lognormal(mean=7.0, sigma=1.0)
        poblacion = np.clip(poblacion, 50, 50000)

        vecindarios.append({
            'id': id_vecindario,
            'x': float(x),
            'y': float(y),
            'weight': float(poblacion) 
        })
        id_vecindario += 1

    return vecindarios

def inicializar_centroides(X, k):
    n_samples = X.shape[0]
    indices = np.random.choice(n_samples, k, replace=False)
    return X[indices].copy()

def asignar_clusters(X, centroides):
    n_samples = X.shape[0]
    etiquetas = np.zeros(n_samples, dtype=int)

    for i in range(n_samples):
        distancias = np.array([distancia_euclidiana(X[i], centroides[j]) for j in range(centroides.shape[0])])
        etiquetas[i] = np.argmin(distancias)
    return etiquetas

def actualizar_centroides(X, W, etiquetas, k):
    """Calcula la MEDIA PONDERADA Ubicación óptima de recursos."""
    n_features = X.shape[1]
    centroides = np.zeros((k, n_features))

    for i in range(k):
        indices_cluster = (etiquetas == i)
        puntos_cluster = X[indices_cluster]
        pesos_cluster = W[indices_cluster] 

        if len(puntos_cluster) > 0:
            sum_weighted_points = np.sum(puntos_cluster * pesos_cluster[:, np.newaxis], axis=0)
            sum_weights = np.sum(pesos_cluster)

            if sum_weights > 0:
                # Media Ponderada
                centroides[i] = sum_weighted_points / sum_weights
            else:
                # Cluster vacío
                centroides[i] = X[np.random.randint(0, X.shape[0])]
        else:
            centroides[i] = X[np.random.randint(0, X.shape[0])]
    return centroides

def kmeans(X, W, k, max_iter=300, tol=1e-4):
    """Implementación completa del algoritmo K-Means PONDERADO."""
    if X.shape[0] < k:
        raise ValueError(f"El número de vecindarios ({X.shape[0]}) debe ser mayor o igual al número de hospitales ({k}).")

    centroides = inicializar_centroides(X, k)
    
    for iteracion in range(max_iter):
        centroides_anteriores = centroides.copy()
        etiquetas = asignar_clusters(X, centroides)
        centroides = actualizar_centroides(X, W, etiquetas, k)
        
        cambio = np.sum(np.abs(centroides - centroides_anteriores))
        if cambio < tol:
            break
            
    sse = calcular_sse(X, etiquetas, centroides)

    return {
        'etiquetas': etiquetas,
        'centroides': centroides,
        'sse': sse,
        'iteraciones': iteracion + 1,
    }

def calcular_sse(X, etiquetas, centroides):
    sse = 0.0
    for i in range(len(X)):
        cluster_idx = etiquetas[i]
        distancia = distancia_euclidiana(X[i], centroides[cluster_idx])
        sse += distancia ** 2
    return sse


# FUNCIONES PARA SILHOUETTE SCORE (K ÓPTIMO)

def calcular_a(i, X, etiquetas):
    """Distancia promedio del punto i a todos los otros puntos en su propio cluster (Cohesion)."""
    cluster_i = etiquetas[i]
    indices_cluster = np.where(etiquetas == cluster_i)[0]
    
    if len(indices_cluster) <= 1:
        return 0.0
        
    punto_i = X[i]
    sum_distancias = 0.0
    
    for j in indices_cluster:
        if i != j:
            sum_distancias += distancia_euclidiana(punto_i, X[j])
            
    return sum_distancias / (len(indices_cluster) - 1)

def calcular_b(i, X, etiquetas):
    """Distancia promedio mínima del punto i a los puntos en el cluster vecino más cercano (Separation)."""
    punto_i = X[i]
    cluster_i = etiquetas[i]
    
    clusters_unicos = np.unique(etiquetas)
    distancias_promedio = []
    
    for cluster_j in clusters_unicos:
        if cluster_j != cluster_i:
            indices_cluster_j = np.where(etiquetas == cluster_j)[0]
            
            if len(indices_cluster_j) > 0:
                distancias = [distancia_euclidiana(punto_i, X[j]) for j in indices_cluster_j]
                distancias_promedio.append(np.mean(distancias))
                
    if not distancias_promedio:
        return 0.0
        
    return np.min(distancias_promedio)

def calcular_silhouette_punto(i, X, etiquetas):
    """Calcula el coeficiente Silhouette para un punto i."""
    a = calcular_a(i, X, etiquetas)
    b = calcular_b(i, X, etiquetas)
    
    if a == 0.0 and b == 0.0:
        return 0.0
    
    if a == 0.0: # Cluster de un solo punto
        return 0.0
    
    return (b - a) / max(a, b)

def calcular_silhouette_score(X, etiquetas, sample_size=None):
    """Calcula el Silhouette Score promedio de todos los puntos (o de una muestra)."""
    if len(np.unique(etiquetas)) <= 1 or len(X) < 2:
        return 0.0

    n_samples = len(X)
        
    if sample_size and n_samples > sample_size:
        # Se muestrea para que el cálculo no sea demasiado lento
        indices = np.random.choice(n_samples, sample_size, replace=False)
    else:
        indices = np.arange(n_samples)
        
    scores = [calcular_silhouette_punto(i, X, etiquetas) for i in indices]
    
    return np.mean(scores)

def encontrar_k_optimo(X, W, n_samples: int):
    """
    Encuentra el número óptimo de clusters (k) evaluando el Silhouette Score
    en un rango de k de 2 hasta min(10, n_samples/2).
    """
    # Rango de k a evaluar. Máximo 10, y nunca más que la mitad de las muestras.
    max_k_eval = min(15, int(n_samples / 2)) 
    k_range = range(2, max_k_eval + 1)
    
    if len(k_range) < 1:
        return 1 if n_samples >= 1 else 0

    mejor_k = 2
    mejor_silhouette = -float('inf') 

    # Usamos una semilla fija (42) para que la búsqueda del k óptimo sea reproducible
    np.random.seed(42) 

    for k in k_range:
        try:
            resultado = kmeans(X, W, k=k)
        except ValueError:
            continue 

        # Calcular el Silhouette Score (muestreando a 500 puntos para eficiencia)
        silhouette = calcular_silhouette_score(X, resultado['etiquetas'], sample_size=min(500, n_samples))

        if silhouette > mejor_silhouette:
            mejor_silhouette = silhouette
            mejor_k = k
    
    return mejor_k



# ENDPOINTS
@app.get("/")
async def root():
    return {"status": "healthy", "message": "KMeans Hospital API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/kmeans", response_model=KMeansResponse)
async def run_kmeans(request: KMeansRequest):
    try:
        # 1. Generación de datos
        vecindarios = generar_vecindarios(
            request.num_neighborhoods,
            request.plane_size,
            request.seed
        )

        X = np.array([[v['x'], v['y']] for v in vecindarios])
        W = np.array([v['weight'] for v in vecindarios]) 
        
        
        n_samples = len(X)
        #k  de ejecución: el que el usuario ingresó
        k_usuario = request.num_hospitals 
        
       
        if n_samples < 2:
             k_optimo_calculado = 1
        elif n_samples > 1000:
            k_optimo_calculado = 5
        else:
            # Aseguramos que la semilla del request se use para que esta parte sea reproducible
            np.random.seed(request.seed) 
            k_optimo_calculado = encontrar_k_optimo(X, W, n_samples)
        
        # 3. VALIDACIÓN Y EJECUCIÓN DEL K-MEANS
        # El k de ejecución es el ingresado por el usuario
        k_ejecucion = k_usuario 

        if n_samples < k_ejecucion:
            raise HTTPException(status_code=400, detail=f"Necesitas al menos {k_ejecucion} vecindarios para ubicar {k_ejecucion} hospitales. Generados: {n_samples}")

        resultado = kmeans(X, W, k=k_ejecucion)

        # 4. Cálculo de métricas
        silhouette = calcular_silhouette_score(X, resultado['etiquetas'], sample_size=min(500, n_samples))

        distancias = []
        for i in range(n_samples):
            cluster_idx = resultado['etiquetas'][i]
            dist = distancia_euclidiana(X[i], resultado['centroides'][cluster_idx])
            distancias.append(dist)
        
        # 5. Preparar Respuesta
        neighborhoods = [
            Point(
                id=v['id'],
                x=v['x'],
                y=v['y'],
                weight=v['weight'],
                cluster=int(resultado['etiquetas'][i])
            )
            for i, v in enumerate(vecindarios)
        ]

        hospitals = [
            Hospital(
                id=i + 1,
                x=float(resultado['centroides'][i][0]),
                y=float(resultado['centroides'][i][1])
            )
            for i in range(k_ejecucion)
        ]

        metrics = {
            "avg_distance": float(np.mean(distancias)),
            "max_distance": float(np.max(distancias)),
            "std_distance": float(np.std(distancias)),
            "neighborhoods_per_hospital": {
                str(i + 1): int(np.sum(resultado['etiquetas'] == i))
                for i in range(k_ejecucion)
            }
        }

        return KMeansResponse(
            neighborhoods=neighborhoods,
            hospitals=hospitals,
            optimal_clusters=k_optimo_calculado,
            sse=float(resultado['sse']),
            silhouette_score=silhouette,
            iterations=resultado['iteraciones'],
            metrics=metrics
        )

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")
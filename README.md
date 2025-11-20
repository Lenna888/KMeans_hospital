### Optimización de Hospitales: Análisis de Distribución Geográfica
## Descripción del Proyecto
Esta aplicación es un proyecto de ML diseñado para optimizar la ubicación de recursos (hospitales, centros de distribución, etc.) en un plano geográfico. Utiliza el algoritmo de K-Means Clustering Ponderado para agrupar vecindarios o zonas, basándose en su población (peso) y posición, determinando así los centros de servicio óptimos (los centroides).

El proyecto se divide en dos módulos interconectados mediante Docker Compose:

`KMeans_Hospital_Frontend` Interfaz de usuario intuitiva desarrollada en React para ingresar parámetros (Número de Hospitales, Vecindarios, Tamaño del Plano) y visualizar los resultados.

`KMeans_Model_Back`: API de backend desarrollada en Python (FastAPI) que implementa el algoritmo K-Means desde cero, sin dependencias de Scikit-learn, y calcula métricas de optimización como el Silhouette Score para sugerir el número óptimo de clusters.

## 🖥️ Tecnologías Utilizadas

### Frontend

| Tecnología              | Rol                                 |
|-------------------------|--------------------------------------|
| React                   | Desarrollo de la interfaz de usuario |
| JavaScript/JSX          | Lógica de la aplicación web          |
| CSS Modules (o similar) | Estilizado y diseño responsivo       |

### Backend

| Tecnología | Librería Clave | Rol                                                   |
|------------|-----------------|--------------------------------------------------------|
| Python     | FastAPI         | Desarrollo del API REST de alto rendimiento           |
| Python     | NumPy           | Cálculos vectorizados y eficientes (distancia, centroides) |
| Python     | Pydantic        | Validación de datos de entrada/salida (schemas)       |
| Python     | Math            | Funciones matemáticas básicas                         |

## 🧩 Orquestación
Docker y Docker Compose: Para construir y gestionar ambos contenedores de manera unificada.

## Estructura del Proyecto

El repositorio principal está organizado en dos subcarpetas, una para cada módulo de la aplicación:

KMeans_hospital/  
├── KMeans_Hospital_Frontend/  # Módulo React  
│   ├── src/                   # Código fuente de React   
│   └── package.json           # Dependencias de React  
├── KMeans_Model_Back/         # Módulo Python/FastAPI  
│   ├── main.py                # Lógica de la API y el modelo K-Means  
│   └── requirements.txt       # Dependencias de Python  
├── .gitignore  
├── README.md  
└── docker-compose.yml         # Archivo de orquestación principal  


## 🐳 Instrucciones de Despliegue con Docker

El proyecto está diseñado para ser desplegado fácilmente con Docker Compose, lo que levanta tanto el frontend como el backend en una red virtual.

### 1. Prerrequisitos
Asegúrese de tener instalado Docker y Docker Compose en tu sistema.

### 2. Despliegue Rápido
Clonar el repositorio: 

```bash
git clone https://github.com/Lenna888/KMeans_hospital.git
cd KMeans_hospital
```

Construir y Ejecutar: Ejecute el siguiente comando en la raíz del proyecto para construir las imágenes y arrancar ambos servicios:

```bash
docker-compose up --build
```

### 3. Acceso a la Aplicación
Una vez que los contenedores estén corriendo:

Aplicación Frontend (Interfaz de Usuario): Abre tu navegador y navega a: http://localhost:80

API Backend (Documentación): Puedes acceder a la documentación interactiva (Swagger/OpenAPI) del backend en: http://localhost:8000/docs

### 4. Detener Servicios
Para detener y eliminar los contenedores y la red creada:

```bash
docker-compose down
```

## 🤖 Funcionamiento del Modelo (K-Means Ponderado)

La lógica central del backend (main.py) implementa el algoritmo K-Means desde cero con dos características clave:

### Media Ponderada (Optimización):  
Los centroides (ubicaciones de los hospitales) se calculan usando la media ponderada de los puntos de su cluster. El peso (weight) es la población o demanda del vecindario, asegurando que el centroide se desplace hacia las zonas de mayor densidad de población.

### K Óptimo (Silhouette Score): 
La API implementa la lógica para calcular el Silhouette Score y determina el número óptimo de clusters (k) que mejor segmenta los datos generados.

$$S = \frac{b - a}{\max(a, b)}$$

Donde **a** es la cohesión y **b** es la separación.


| Parámetro                 | Descripción                                                   |
|---------------------------|---------------------------------------------------------------|
| Número de Hospitales (A)  | El valor de $k$ para la ejecución del K-Means                |
| Número de Vecindarios (M) | Cantidad de puntos (datos) que se generarán                   |
| Tamaño del Plano (m x m)  | Dimensión del universo de trabajo (ej. $1,000,000 \times 1,000,000$) |








# 🎯 Herramienta Matriz McKinsey - Automatizada

Una herramienta web interactiva para generar matrices McKinsey (General Electric) automatizadas que facilitan la toma de decisiones estratégicas empresariales.

## 🚀 Características Principales

### ✨ Funcionalidades Core
- **Matriz 3x3 Interactiva**: Visualización automática de la matriz clásica McKinsey
- **Gestión de Variables**: Configuración personalizable de factores internos y externos con ponderación
- **UENs Dinámicas**: Agregar y evaluar múltiples Unidades Estratégicas de Negocio
- **Análisis Automático**: Generación automática de recomendaciones estratégicas
- **Exportación PDF**: Exportar matriz y análisis completo
- **Guardar/Cargar Proyectos**: Persistencia de datos en formato JSON

### 📊 Visualización Avanzada
- **Círculos Proporcionales**: Tamaño basado en el mercado total
- **Participación de Mercado**: Representación visual mediante sectores sombreados
- **Vectores Direccionales**: Flechas que indican la dirección estratégica deseada
- **Zonas Estratégicas**: Codificación por colores (Crecer, Seleccionar, Cosechar)

## 🏗️ Estructura del Proyecto

```
matriz/
├── index.html              # Interfaz principal
├── styles.css              # Estilos y diseño responsivo
├── matrix-generator.js     # Lógica principal y funcionalidades
├── ejemplo_vinos_lucho.json # Proyecto de ejemplo
└── README.md               # Documentación
```

## 🎮 Cómo Usar la Herramienta

### 1. **Configuración Inicial**
   - Abra `index.html` en su navegador web
   - La herramienta carga con variables predeterminadas

### 2. **Configurar Variables y Pesos**
   - **Factores Internos**: Configure variables relacionadas con fortalezas del negocio
   - **Factores Externos**: Configure variables de atractivo de la industria
   - **Ponderación**: Asegúrese que los pesos sumen exactamente 100% en cada categoría

### 3. **Agregar UENs (Unidades Estratégicas)**
   - Clic en "➕ Agregar UEN"
   - Complete la información requerida:
     - **Nombre de la UEN**
     - **Tamaño Total del Mercado** (en millones $)
     - **Participación de Mercado** (%)
     - **Ventas Anuales** (en millones $)
     - **Dirección Estratégica** (vector X,Y entre -2 y 2)

### 4. **Evaluación de Factores**
   - Para cada UEN, evalúe factores internos y externos
   - **Escala 1-5**: donde 1 = Muy Bajo, 5 = Muy Alto
   - La herramienta calcula automáticamente las posiciones ponderadas

### 5. **Generar y Analizar**
   - Clic en "🔄 Generar Matriz"
   - Revise la matriz visual y las recomendaciones automáticas
   - Analice la distribución estratégica de su portfolio

### 6. **Exportar y Guardar**
   - **📄 Exportar PDF**: Genera un reporte completo
   - **💾 Guardar Proyecto**: Descarga archivo JSON para uso futuro
   - **📂 Cargar Proyecto**: Importa proyectos guardados

## 📚 Marco Teórico

### Ejes de la Matriz
- **Eje X (Horizontal)**: Fortaleza del Negocio (Alto → Bajo)
- **Eje Y (Vertical)**: Atractivo de la Industria (Alto → Bajo)

### Zonas Estratégicas
1. **🚀 CRECER (Verde)**: Invertir para mantener/construir posición
2. **⚖️ SELECCIONAR (Naranja)**: Administrar beneficios, expansión limitada
3. **🌾 COSECHAR (Rojo)**: Maximizar flujo de efectivo, considerar desinversión

### Cálculo de Posiciones
```
Puntuación = Σ(Evaluación × Peso) / Σ(Pesos)
Posición X = (5 - Puntuación_Interna) / 5 × 500 + 50
Posición Y = (5 - Puntuación_Externa) / 5 × 500 + 50
```

## 🔧 Personalización

### Agregar Variables Personalizadas
```javascript
// Ejemplo de variables internas personalizadas
const customInternalVars = [
    { name: "Capacidad de innovación", weight: 30 },
    { name: "Red de distribución", weight: 25 },
    { name: "Marca y reputación", weight: 25 },
    { name: "Eficiencia operacional", weight: 20 }
];
```

### Modificar Colores de Zonas
```css
/* En styles.css */
.zone-crecer { background: rgba(76, 175, 80, 0.3); }  /* Verde */
.zone-seleccionar { background: rgba(255, 152, 0, 0.3); }  /* Naranja */ 
.zone-cosechar { background: rgba(244, 67, 54, 0.3); }  /* Rojo */
```

## 📱 Características Responsivas

- ✅ Diseño adaptable para móviles y tablets
- ✅ Interfaz táctil optimizada
- ✅ Visualización escalable de la matriz
- ✅ Controles accesibles en pantallas pequeñas

## 🗂️ Archivo de Ejemplo

Incluye `ejemplo_vinos_lucho.json` que demuestra:
- 4 UENs de diferentes segmentos de vino
- Variables configuradas para industria vitivinícola
- Evaluaciones realistas y direcciones estratégicas
- Datos de mercado representativos

## 🛠️ Requisitos Técnicos

- **Navegador Web Moderno** (Chrome, Firefox, Safari, Edge)
- **JavaScript Habilitado**
- **Librerías Incluidas**:
  - Chart.js 3.9.1 (visualización)
  - jsPDF 2.5.1 (exportación PDF)

## 📈 Casos de Uso

### Empresas Multi-producto
- Evaluar portfolio de productos/servicios
- Decisiones de asignación de recursos
- Identificar oportunidades de crecimiento

### Consultores Estratégicos
- Análisis cliente para presentaciones
- Herramienta de diagnóstico empresarial
- Facilitar talleres de planificación estratégica

### Académicos y Estudiantes
- Enseñanza de estrategia empresarial
- Casos de estudio interactivos
- Proyectos de investigación

## 🎯 Interpretación de Resultados

### Zona de Crecimiento (🚀)
- **Alta fortaleza + Alto atractivo**
- **Estrategia**: Invertir agresivamente
- **Acciones**: Expansión, I+D, marketing

### Zona de Selección (⚖️)
- **Fortaleza/atractivo medio**
- **Estrategia**: Administrar selectivamente
- **Acciones**: Optimización, inversión selectiva

### Zona de Cosecha (🌾)
- **Baja fortaleza + Bajo atractivo**
- **Estrategia**: Maximizar efectivo
- **Acciones**: Reducir costos, considerar salida

## 🔄 Actualizaciones Futuras

- [ ] Integración con APIs de datos de mercado
- [ ] Análisis de sensibilidad automático
- [ ] Plantillas por industria
- [ ] Comparación temporal de matrices
- [ ] Colaboración multi-usuario
- [ ] Integración con PowerBI/Tableau

## 📞 Soporte

Para soporte técnico o sugerencias de mejora, contacte al equipo de desarrollo o revise la documentación en línea.

---

**Desarrollado con ❤️ para facilitar la toma de decisiones estratégicas empresariales**
// Herramienta Matriz McKinsey - Funcionalidad Principal
class MatrixMcKinsey {
    constructor() {
        this.uens = [];
        this.canvas = null;
        this.ctx = null;
        this.matrixData = {
            internal: [],
            external: []
        };
        this.autoCalculateMarketSize = true;
        this.autoCalculateDirection = true;
        this.previousEvaluations = new Map(); // Para calcular tendencias
        this.init();
    }

    init() {
        this.canvas = document.getElementById('matrixCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.updateWeightTotals();
        this.setupEventListeners();
        // Iniciar sin UEN por defecto - matriz vacía
        this.generateMatrix();
    }

    setupEventListeners() {
        // Listeners para actualizar totales de peso
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('variable-weight')) {
                this.updateWeightTotals();
                this.validateWeights();
            }
            if (e.target.classList.contains('evaluation-input')) {
                this.generateMatrix();
            }
        });

        // Listener para cambios en nombres de UEN
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('uen-name')) {
                this.generateMatrix();
            }
        });
    }

    addVariable(type) {
        const container = document.getElementById(`${type}-variables`);
        const variableRow = document.createElement('div');
        variableRow.className = 'variable-row';
        variableRow.innerHTML = `
            <input type="text" class="variable-name" placeholder="Nombre de la variable">
            <input type="number" class="variable-weight" value="0" min="0" max="100" placeholder="Peso %">
            <button onclick="this.parentElement.remove(); matrixTool.updateWeightTotals();" 
                    class="btn-remove" style="padding: 8px; margin-left: 5px;">×</button>
        `;
        container.appendChild(variableRow);
        this.updateWeightTotals();
    }

    updateWeightTotals() {
        const internalWeights = Array.from(document.querySelectorAll('#internal-variables .variable-weight'));
        const externalWeights = Array.from(document.querySelectorAll('#external-variables .variable-weight'));

        const internalTotal = internalWeights.reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
        const externalTotal = externalWeights.reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);

        document.getElementById('internal-total').textContent = internalTotal.toFixed(1);
        document.getElementById('external-total').textContent = externalTotal.toFixed(1);

        // Actualizar colores según validez
        document.getElementById('internal-total').style.color = internalTotal === 100 ? '#4CAF50' : '#f44336';
        document.getElementById('external-total').style.color = externalTotal === 100 ? '#4CAF50' : '#f44336';
    }

    validateWeights() {
        const weights = document.querySelectorAll('.variable-weight');
        weights.forEach(weight => {
            const value = parseFloat(weight.value) || 0;
            if (value < 0 || value > 100) {
                weight.classList.add('invalid-weight');
                weight.classList.remove('valid-weight');
            } else {
                weight.classList.add('valid-weight');
                weight.classList.remove('invalid-weight');
            }
        });
    }

    // Matriz inicia vacía - sin UEN por defecto

    // Generar color único para cada UEN basado en su ID
    getUENColor(uenId) {
        const colors = [
            { fill: 'rgba(33, 150, 243, 0.7)', stroke: '#1976D2' },   // Azul
            { fill: 'rgba(76, 175, 80, 0.7)', stroke: '#388E3C' },    // Verde
            { fill: 'rgba(255, 152, 0, 0.7)', stroke: '#F57C00' },    // Naranja
            { fill: 'rgba(156, 39, 176, 0.7)', stroke: '#7B1FA2' },   // Púrpura
            { fill: 'rgba(244, 67, 54, 0.7)', stroke: '#D32F2F' },    // Rojo
            { fill: 'rgba(0, 188, 212, 0.7)', stroke: '#0097A7' },    // Cian
            { fill: 'rgba(255, 193, 7, 0.7)', stroke: '#F57C00' },    // Amarillo
            { fill: 'rgba(121, 85, 72, 0.7)', stroke: '#5D4037' },    // Marrón
            { fill: 'rgba(96, 125, 139, 0.7)', stroke: '#455A64' },   // Gris azul
            { fill: 'rgba(233, 30, 99, 0.7)', stroke: '#C2185B' }     // Rosa
        ];

        // Usar el hash del ID para seleccionar un color de forma consistente
        let hash = 0;
        for (let i = 0; i < uenId.length; i++) {
            const char = uenId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32-bit integer
        }

        return colors[Math.abs(hash) % colors.length];
    }

    addUEN(name = '') {
        const uenId = 'uen_' + Date.now();
        const uen = {
            id: uenId,
            name: name || `UEN ${this.uens.length + 1}`,
            marketSize: 333333, // Se calculará automáticamente
            marketShare: 15,
            sales: 50000,    // 50,000 en lugar de 50 millones
            direction: { x: 0, y: 0 },
            evaluations: {
                internal: [],
                external: []
            }
        };

        // Calcular valores automáticamente al crear la UEN
        if (this.autoCalculateMarketSize && uen.sales > 0 && uen.marketShare > 0) {
            this.calculateTotalMarketSize(uen);
        }

        this.uens.push(uen);
        this.renderUENCard(uen);

        // Inicializar dirección estratégica después de renderizar
        setTimeout(() => {
            if (this.autoCalculateDirection) {
                this.calculateStrategicDirection(uen);
            }
        }, 100);

        this.generateMatrix();
    }

    renderUENCard(uen) {
        const container = document.getElementById('uens-container');
        const uenCard = document.createElement('div');
        uenCard.className = 'uen-card';
        uenCard.id = uen.id;

        // Obtener variables actuales
        const internalVars = this.getVariables('internal');
        const externalVars = this.getVariables('external');

        // Inicializar evaluaciones si no existen
        if (uen.evaluations.internal.length === 0) {
            uen.evaluations.internal = internalVars.map(() => 3);
        }
        if (uen.evaluations.external.length === 0) {
            uen.evaluations.external = externalVars.map(() => 3);
        }

        uenCard.innerHTML = `
            <div class="uen-header">
                <input type="text" class="uen-name" value="${uen.name}" placeholder="Nombre de la UEN">
                <button onclick="matrixTool.removeUEN('${uen.id}')" class="btn-remove">🗑️ Eliminar</button>
            </div>
            
            <div class="uen-info">
            <div class="uen-info-item">
                    <label>📈 Ventas Anuales ($)</label>
                    <input type="number" value="${uen.sales}" min="0" 
                           onchange="matrixTool.updateUENData('${uen.id}', 'sales', this.value)">
                </div>
                <div class="uen-info-item">
                    <label>📊 Participación de Mercado (%)</label>
                    <input type="number" value="${uen.marketShare}" min="0" max="100" 
                           onchange="matrixTool.updateUENData('${uen.id}', 'marketShare', this.value)">
                </div>
            </div>

            <div class="evaluations-grid">
                <div class="evaluation-section">
                    <h5>🏢 Evaluación Factores Internos (1-5)</h5>
                    ${internalVars.map((variable, index) => `
                        <div class="evaluation-row">
                            <span>${variable.name}</span>
                            <input type="number" class="evaluation-input" min="1" max="5" 
                                   value="${uen.evaluations.internal[index] || 3}"
                                   onchange="matrixTool.updateEvaluation('${uen.id}', 'internal', ${index}, this.value)">
                        </div>
                    `).join('')}
                </div>
                
                <div class="evaluation-section">
                    <h5>🌍 Evaluación Factores Externos (1-5)</h5>
                    ${externalVars.map((variable, index) => `
                        <div class="evaluation-row">
                            <span>${variable.name}</span>
                            <input type="number" class="evaluation-input" min="1" max="5" 
                                   value="${uen.evaluations.external[index] || 3}"
                                   onchange="matrixTool.updateEvaluation('${uen.id}', 'external', ${index}, this.value)">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.appendChild(uenCard);
    }

    getVariables(type) {
        const container = document.getElementById(`${type}-variables`);
        const rows = container.querySelectorAll('.variable-row');
        return Array.from(rows).map(row => ({
            name: row.querySelector('.variable-name').value || 'Variable sin nombre',
            weight: parseFloat(row.querySelector('.variable-weight').value) || 0
        }));
    }

    updateUENData(uenId, field, value) {
        const uen = this.uens.find(u => u.id === uenId);
        if (uen) {
            uen[field] = parseFloat(value) || 0;
            if (field === 'name') {
                uen[field] = value;
            }

            // Calcular automáticamente el tamaño del mercado si se modifica ventas o participación
            if ((field === 'sales' || field === 'marketShare') && this.autoCalculateMarketSize) {
                this.calculateTotalMarketSize(uen);
            }

            this.generateMatrix();
        }
    }

    calculateTotalMarketSize(uen) {
        // Calcular tamaño total del mercado basado en ventas y participación
        if (uen.sales > 0 && uen.marketShare > 0) {
            const calculatedMarketSize = (uen.sales / uen.marketShare) * 100;
            uen.marketSize = Math.round(calculatedMarketSize * 100) / 100; // Redondear a 2 decimales

            // Actualizar la interfaz
            const uenElement = document.getElementById(uen.id);
            if (uenElement) {
                const marketSizeInput = uenElement.querySelector('input[onchange*="marketSize"]');
                if (marketSizeInput) {
                    marketSizeInput.value = uen.marketSize;
                    marketSizeInput.style.backgroundColor = '#e8f5e8'; // Verde claro para indicar cálculo automático
                }
            }
        }
    }

    updateUENDirection(uenId, axis, value) {
        const uen = this.uens.find(u => u.id === uenId);
        if (uen) {
            uen.direction[axis] = parseFloat(value) || 0;
            this.generateMatrix();
        }
    }

    updateEvaluation(uenId, type, index, value) {
        const uen = this.uens.find(u => u.id === uenId);
        if (uen) {
            // Guardar evaluación anterior para calcular tendencia
            const previousKey = `${uenId}_${type}_${index}`;
            if (!this.previousEvaluations.has(previousKey)) {
                this.previousEvaluations.set(previousKey, uen.evaluations[type][index] || 3);
            }

            uen.evaluations[type][index] = parseFloat(value) || 1;

            // Calcular dirección estratégica automáticamente
            if (this.autoCalculateDirection) {
                this.calculateStrategicDirection(uen);
            }

            this.generateMatrix();
        }
    }

    calculateStrategicDirection(uen) {
        // Calcular la dirección basada en las tendencias de evaluación y posición actual
        const currentPosition = this.calculatePosition(uen);

        // Calcular tendencias promedio
        let internalTrend = 0;
        let externalTrend = 0;
        let internalCount = 0;
        let externalCount = 0;

        // Analizar tendencias en factores internos
        uen.evaluations.internal.forEach((current, index) => {
            const previousKey = `${uen.id}_internal_${index}`;
            if (this.previousEvaluations.has(previousKey)) {
                const previous = this.previousEvaluations.get(previousKey);
                internalTrend += (current - previous);
                internalCount++;
            }
        });

        // Analizar tendencias en factores externos
        uen.evaluations.external.forEach((current, index) => {
            const previousKey = `${uen.id}_external_${index}`;
            if (this.previousEvaluations.has(previousKey)) {
                const previous = this.previousEvaluations.get(previousKey);
                externalTrend += (current - previous);
                externalCount++;
            }
        });

        // Calcular direcciones promedio
        const avgInternalTrend = internalCount > 0 ? internalTrend / internalCount : 0;
        const avgExternalTrend = externalCount > 0 ? externalTrend / externalCount : 0;

        // La dirección X representa el cambio en fortaleza del negocio (factores internos)
        // La dirección Y representa el cambio en atractivo de la industria (factores externos)
        uen.direction.x = Math.max(-2, Math.min(2, avgInternalTrend * 0.5));
        uen.direction.y = Math.max(-2, Math.min(2, avgExternalTrend * 0.5));

        // Si no hay cambios significativos, calcular dirección hacia zona óptima
        if (Math.abs(uen.direction.x) < 0.1 && Math.abs(uen.direction.y) < 0.1) {
            const targetDirection = this.calculateOptimalDirection(currentPosition);
            uen.direction.x = targetDirection.x;
            uen.direction.y = targetDirection.y;
        }

        // Actualizar la interfaz
        this.updateDirectionInputs(uen);
    }

    calculateOptimalDirection(currentPosition) {
        // Calcular dirección hacia la zona "CRECER" (alto-alto)
        const targetX = 116; // Posición X del centro de la zona CRECER
        const targetY = 116; // Posición Y del centro de la zona CRECER

        let directionX = 0;
        let directionY = 0;

        // Calcular dirección normalizada hacia la zona objetivo
        if (currentPosition.x > targetX) {
            directionX = -0.5; // Moverse hacia la izquierda (mayor fortaleza)
        } else if (currentPosition.x < targetX) {
            directionX = 0.5; // Moverse hacia la derecha puede no ser deseable, mantenemos neutro
        }

        if (currentPosition.y > targetY) {
            directionY = -0.5; // Moverse hacia arriba (mayor atractivo)
        } else if (currentPosition.y < targetY) {
            directionY = 0.5; // Mantener o mejorar posición
        }

        return { x: directionX, y: directionY };
    }

    updateDirectionInputs(uen) {
        const uenElement = document.getElementById(uen.id);
        if (uenElement) {
            const xInput = uenElement.querySelector('input[onchange*="direction"][placeholder="X"]');
            const yInput = uenElement.querySelector('input[onchange*="direction"][placeholder="Y"]');

            if (xInput && yInput) {
                xInput.value = uen.direction.x.toFixed(1);
                yInput.value = uen.direction.y.toFixed(1);
                xInput.style.backgroundColor = '#e8f5e8'; // Verde claro para indicar cálculo automático
                yInput.style.backgroundColor = '#e8f5e8';
            }
        }
    }

    removeUEN(uenId) {
        this.uens = this.uens.filter(u => u.id !== uenId);
        document.getElementById(uenId).remove();
        this.generateMatrix();
    }

    calculatePosition(uen) {
        const internalVars = this.getVariables('internal');
        const externalVars = this.getVariables('external');

        // Calcular puntaje ponderado para factores internos (Fortaleza del Negocio)
        let internalScore = 0;
        let internalTotalWeight = 0;

        internalVars.forEach((variable, index) => {
            const evaluation = uen.evaluations.internal[index] || 3;
            const weight = variable.weight / 100; // Convertir porcentaje a decimal
            internalScore += evaluation * weight;
            internalTotalWeight += weight;
        });

        // Calcular puntaje ponderado para factores externos (Atractivo de la Industria)
        let externalScore = 0;
        let externalTotalWeight = 0;

        externalVars.forEach((variable, index) => {
            const evaluation = uen.evaluations.external[index] || 3;
            const weight = variable.weight / 100; // Convertir porcentaje a decimal
            externalScore += evaluation * weight;
            externalTotalWeight += weight;
        });

        // Normalizar a escala 0-5 si los pesos no suman exactamente 1
        if (internalTotalWeight > 0) {
            internalScore = internalScore / internalTotalWeight;
        }
        if (externalTotalWeight > 0) {
            externalScore = externalScore / externalTotalWeight;
        }

        // Convertir a coordenadas de matriz (0-600 pixels)
        // Invertir Y para que Alto esté arriba
        const x = ((5 - internalScore) / 5) * 500 + 50; // Fortaleza: Alto a la izquierda
        const y = ((5 - externalScore) / 5) * 500 + 50; // Atractivo: Alto arriba

        return { x, y, internalScore, externalScore };
    }

    getStrategicZone(x, y) {
        const zoneX = Math.floor((x - 50) / (500 / 3));
        const zoneY = Math.floor((y - 50) / (500 / 3));

        // Matriz 3x3 con zonas estratégicas
        const zones = [
            ['CRECER', 'CRECER', 'SELECCIONAR'],
            ['CRECER', 'SELECCIONAR', 'SELECCIONAR'],
            ['SELECCIONAR', 'COSECHAR', 'COSECHAR']
        ];

        const clampedX = Math.max(0, Math.min(2, zoneX));
        const clampedY = Math.max(0, Math.min(2, zoneY));

        return zones[clampedY][clampedX];
    }

    generateMatrix() {
        if (!this.ctx) return;

        const canvas = this.canvas;
        const ctx = this.ctx;

        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Configurar dimensiones
        const width = 600;
        const height = 600;
        canvas.width = width;
        canvas.height = height;

        // Dibujar fondo y cuadrícula
        this.drawMatrixBackground(ctx, width, height);

        // Dibujar UENs o mensaje inicial
        if (this.uens.length === 0) {
            // Mensaje cuando no hay UENs
            ctx.fillStyle = '#666';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('', width / 2, height / 2 - 10);

        } else {
            this.uens.forEach(uen => {
                const uenElement = document.getElementById(uen.id);
                if (uenElement) {
                    const nameInput = uenElement.querySelector('.uen-name');
                    uen.name = nameInput.value || uen.name;
                }

                const position = this.calculatePosition(uen);
                this.drawUEN(ctx, uen, position);
            });
        }

        // La leyenda de colores se muestra en la vista completa

        // Generar análisis estratégico
        this.generateStrategicAnalysis();
    }

    drawMatrixBackground(ctx, width, height) {
        const colors = {
            crecer: 'rgba(76, 175, 80, 0.3)',
            seleccionar: 'rgba(255, 152, 0, 0.3)',
            cosechar: 'rgba(244, 67, 54, 0.3)'
        };

        // Dibujar zonas de color
        const zones = [
            [colors.crecer, colors.crecer, colors.seleccionar],
            [colors.crecer, colors.seleccionar, colors.seleccionar],
            [colors.seleccionar, colors.cosechar, colors.cosechar]
        ];

        const cellWidth = 500 / 3;
        const cellHeight = 500 / 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                ctx.fillStyle = zones[i][j];
                ctx.fillRect(50 + j * cellWidth, 50 + i * cellHeight, cellWidth, cellHeight);
            }
        }

        // Dibujar líneas de cuadrícula
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;

        // Líneas verticales
        for (let i = 0; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(50 + i * cellWidth, 50);
            ctx.lineTo(50 + i * cellWidth, 550);
            ctx.stroke();
        }

        // Líneas horizontales
        for (let i = 0; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(50, 50 + i * cellHeight);
            ctx.lineTo(550, 50 + i * cellHeight);
            ctx.stroke();
        }

        // Etiquetas de los ejes
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';

        // Eje X (Fortaleza del Negocio)
        ctx.fillText('ALTO', 116, 575);
        ctx.fillText('MEDIO', 300, 575);
        ctx.fillText('BAJO', 483, 575);

        // Eje Y (Atractivo de la Industria)
        ctx.save();
        ctx.translate(25, 300);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('ALTO', 165, 550);
        ctx.fillText('MEDIO', 0, 550);
        ctx.fillText('BAJO', -165, 550);
        ctx.restore();

        // Título de zonas estratégicas
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';

        // Etiquetas de zonas
        
        ctx.fillText('CRECER', 116, 40);
        ctx.fillText('SELECCIONAR', 300, 40);
        ctx.fillText('COSECHAR', 483, 40);
    }

    drawUEN(ctx, uen, position) {
        const { x, y } = position;
        // Tamaño de círculos balanceado para buena visualización
        const radius = Math.sqrt(uen.marketSize / 10000) * 4; // Escalado moderado
        const maxRadius = 45;  // Radio máximo moderado
        const minRadius = 15;  // Radio mínimo moderado
        const normalizedRadius = Math.max(minRadius, Math.min(maxRadius, radius));

        // Obtener color único para esta UEN
        const uenColor = this.getUENColor(uen.id);

        // Dibujar círculo principal
        ctx.beginPath();
        ctx.arc(x, y, normalizedRadius, 0, 2 * Math.PI);
        ctx.fillStyle = uenColor.fill;
        ctx.fill();
        ctx.strokeStyle = uenColor.stroke;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dibujar participación de mercado (sector) con color más intenso
        if (uen.marketShare > 0) {
            const shareAngle = (uen.marketShare / 100) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.arc(x, y, normalizedRadius, 0, shareAngle);
            ctx.closePath();
            // Usar una versión más intensa del color de la UEN para el sector
            const intenserColor = uenColor.fill.replace('0.7', '0.9');
            ctx.fillStyle = intenserColor;
            ctx.fill();
        }

        // Dibujar flecha de dirección estratégica
        if (uen.direction.x !== 0 || uen.direction.y !== 0) {
            const arrowLength = 40;
            const arrowX = uen.direction.x * arrowLength;
            const arrowY = -uen.direction.y * arrowLength; // Invertir Y

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + arrowX, y + arrowY);
            ctx.strokeStyle = '#FF5722';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Punta de flecha
            const headLength = 10;
            const angle = Math.atan2(arrowY, arrowX);

            ctx.beginPath();
            ctx.moveTo(x + arrowX, y + arrowY);
            ctx.lineTo(
                x + arrowX - headLength * Math.cos(angle - Math.PI / 6),
                y + arrowY - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(x + arrowX, y + arrowY);
            ctx.lineTo(
                x + arrowX - headLength * Math.cos(angle + Math.PI / 6),
                y + arrowY - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
        }

        // Etiqueta de la UEN con fondo de color
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';

        // Fondo para el texto
        const textWidth = ctx.measureText(uen.name).width;
        ctx.fillStyle = uenColor.fill;
        ctx.fillRect(x - textWidth / 2 - 5, y - normalizedRadius - 18, textWidth + 10, 16);

        // Texto del nombre en blanco
        ctx.fillStyle = '#fff';
        ctx.fillText(uen.name, x, y - normalizedRadius - 6);

        // Información adicional
        ctx.font = '10px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(`$${uen.marketSize.toLocaleString()}`, x, y + normalizedRadius + 15);
        ctx.fillText(`${uen.marketShare}%`, x, y + normalizedRadius + 28);
    }

    drawColorLegend(ctx) {
        if (this.uens.length === 0) return;

        const legendX = 20;
        const legendY = 50;
        const itemHeight = 25;

        // Título de la leyenda
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Unidades Estratégicas de Negocio:', legendX, legendY);

        // Dibujar cada UEN en la leyenda
        this.uens.forEach((uen, index) => {
            const y = legendY + 25 + (index * itemHeight);
            const uenColor = this.getUENColor(uen.id);

            // Círculo de color
            ctx.beginPath();
            ctx.arc(legendX + 10, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = uenColor.fill;
            ctx.fill();
            ctx.strokeStyle = uenColor.stroke;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Nombre de la UEN
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.fillText(uen.name, legendX + 25, y + 4);
        });
    }

    generateStrategicAnalysis() {
        const analysisContainer = document.getElementById('strategic-analysis');
        let html = '<div class="analysis-summary">';

        if (this.uens.length === 0) {
            html += '<p>Agregue UENs para generar el análisis estratégico.</p>';
        } else {
            this.uens.forEach(uen => {
                const position = this.calculatePosition(uen);
                const zone = this.getStrategicZone(position.x, position.y);
                const zoneClass = zone.toLowerCase().replace('ñ', 'n');

                // Determinar si los valores fueron calculados automáticamente
                const marketSizeAuto = this.autoCalculateMarketSize ? ' (🤖 Calculado automáticamente)' : '';
                const directionAuto = this.autoCalculateDirection ? ' (🤖 Calculado automáticamente)' : '';

                html += `
                    <div class="strategic-recommendation">
                        <h4>🎯 ${uen.name}</h4>
                        <div class="position-info position-${zoneClass}">${zone}</div>
                        <p><strong>Posición:</strong> Fortaleza del Negocio: ${position.internalScore.toFixed(2)}/5, 
                           Atractivo de la Industria: ${position.externalScore.toFixed(2)}/5</p>
                        <p><strong>Tamaño del Mercado:</strong> $${uen.marketSize.toLocaleString()}${marketSizeAuto}</p>
                        <p><strong>Participación:</strong> ${uen.marketShare}%</p>
                        <p><strong>Ventas:</strong> $${uen.sales.toLocaleString()}</p>
                        <p><strong>Dirección Estratégica:</strong> X: ${uen.direction.x.toFixed(1)}, Y: ${uen.direction.y.toFixed(1)}${directionAuto}</p>
                        ${this.getStrategicRecommendation(zone, uen)}
                    </div>
                `;
            });

            // Resumen general
            const crecer = this.uens.filter(uen => this.getStrategicZone(...Object.values(this.calculatePosition(uen))).includes('CRECER')).length;
            const seleccionar = this.uens.filter(uen => this.getStrategicZone(...Object.values(this.calculatePosition(uen))).includes('SELECCIONAR')).length;
            const cosechar = this.uens.filter(uen => this.getStrategicZone(...Object.values(this.calculatePosition(uen))).includes('COSECHAR')).length;

            // Calcular totales del mercado
            const totalMarketSize = this.uens.reduce((sum, uen) => sum + uen.marketSize, 0);
            const totalSales = this.uens.reduce((sum, uen) => sum + uen.sales, 0);
            const avgMarketShare = this.uens.reduce((sum, uen) => sum + uen.marketShare, 0) / this.uens.length;

            html += `
                <div class="strategic-recommendation" style="background: #e3f2fd; border-left-color: #2196F3;">
                    <h4>📊 Resumen del Portfolio</h4>
                    <p><strong>Distribución Estratégica:</strong></p>
                    <p>🚀 UENs para CRECER: ${crecer}</p>
                    <p>⚖️ UENs para SELECCIONAR: ${seleccionar}</p>
                    <p>🌾 UENs para COSECHAR: ${cosechar}</p>
                    <p><strong>Total de UENs analizadas:</strong> ${this.uens.length}</p>
                    <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
                    <p><strong>📈 Métricas del Portfolio:</strong></p>
                    <p><strong>Tamaño Total de Mercados:</strong> $${totalMarketSize.toLocaleString()}</p>
                    <p><strong>Ventas Totales:</strong> $${totalSales.toLocaleString()}</p>
                    <p><strong>Participación Promedio:</strong> ${avgMarketShare.toFixed(1)}%</p>
                    <p><strong>Cálculos Automáticos:</strong> 
                        ${this.autoCalculateMarketSize ? '✅ Tamaño Mercado' : '❌ Tamaño Mercado'} | 
                        ${this.autoCalculateDirection ? '✅ Dirección Estratégica' : '❌ Dirección Estratégica'}
                    </p>
                </div>
            `;
        }

        html += '</div>';
        analysisContainer.innerHTML = html;
    }

    getStrategicRecommendation(zone, uen) {
        const recommendations = {
            'CRECER': `
                <p><strong>🚀 Estrategia Recomendada:</strong> Invertir para crecer y mantener la posición competitiva.</p>
                <p><strong>Acciones:</strong></p>
                <ul style="margin-left: 20px; margin-top: 5px;">
                    <li>Aumentar inversión en marketing y ventas</li>
                    <li>Expandir capacidad de producción</li>
                    <li>Desarrollar nuevos productos/servicios</li>
                    <li>Fortalecer canales de distribución</li>
                </ul>
            `,
            'SELECCIONAR': `
                <p><strong>⚖️ Estrategia Recomendada:</strong> Administrar beneficios y mantener posición selectivamente.</p>
                <p><strong>Acciones:</strong></p>
                <ul style="margin-left: 20px; margin-top: 5px;">
                    <li>Optimizar operaciones para mejorar rentabilidad</li>
                    <li>Inversión selectiva en áreas de mayor potencial</li>
                    <li>Mantener participación de mercado actual</li>
                    <li>Evaluar oportunidades de mejora específicas</li>
                </ul>
            `,
            'COSECHAR': `
                <p><strong>🌾 Estrategia Recomendada:</strong> Maximizar flujo de efectivo o considerar desinversión.</p>
                <p><strong>Acciones:</strong></p>
                <ul style="margin-left: 20px; margin-top: 5px;">
                    <li>Reducir inversiones no esenciales</li>
                    <li>Maximizar generación de efectivo</li>
                    <li>Considerar venta o liquidación de activos</li>
                    <li>Minimizar costos operativos</li>
                </ul>
            `
        };

        return recommendations[zone] || '<p>Análisis no disponible.</p>';
    }

    saveProject() {
        const projectData = {
            name: 'Proyecto Matriz McKinsey',
            date: new Date().toISOString(),
            variables: {
                internal: this.getVariables('internal'),
                external: this.getVariables('external')
            },
            uens: this.uens
        };

        const dataStr = JSON.stringify(projectData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'matriz_mckinsey_proyecto.json';
        link.click();

        URL.revokeObjectURL(url);

        alert('✅ Proyecto guardado exitosamente');
    }

    loadProject() {
        document.getElementById('project-file').click();
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const projectData = JSON.parse(e.target.result);
                this.loadProjectData(projectData);
                alert('✅ Proyecto cargado exitosamente');
            } catch (error) {
                alert('❌ Error al cargar el proyecto: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    loadProjectData(projectData) {
        // Limpiar UENs existentes
        this.uens = [];
        document.getElementById('uens-container').innerHTML = '';

        // Cargar variables
        this.loadVariables('internal', projectData.variables.internal);
        this.loadVariables('external', projectData.variables.external);

        // Cargar UENs
        projectData.uens.forEach(uenData => {
            this.uens.push(uenData);
            this.renderUENCard(uenData);
        });

        this.updateWeightTotals();
        this.generateMatrix();
    }

    loadVariables(type, variables) {
        const container = document.getElementById(`${type}-variables`);
        container.innerHTML = '';

        variables.forEach(variable => {
            const variableRow = document.createElement('div');
            variableRow.className = 'variable-row';
            variableRow.innerHTML = `
                <input type="text" class="variable-name" value="${variable.name}" placeholder="Nombre de la variable">
                <input type="number" class="variable-weight" value="${variable.weight}" min="0" max="100" placeholder="Peso %">
                <button onclick="this.parentElement.remove(); matrixTool.updateWeightTotals();" 
                        class="btn-remove" style="padding: 8px; margin-left: 5px;">×</button>
            `;
            container.appendChild(variableRow);
        });
    }

    exportToPDF() {
        // Generar matriz actualizada
        this.generateMatrix();

        // Crear el PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('l', 'mm', 'a4'); // Formato landscape

        // Título
        pdf.setFontSize(20);
        pdf.setFont(undefined, 'bold');
        pdf.text('Matriz McKinsey - Análisis Estratégico', 20, 20);

        // Fecha
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);

        // Capturar canvas de la matriz
        const canvas = this.canvas;
        const imgData = canvas.toDataURL('image/png');

        // Agregar imagen de la matriz
        pdf.addImage(imgData, 'PNG', 20, 40, 120, 120);

        // Agregar tabla de UENs
        let yPosition = 170;
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Resumen de UENs:', 20, yPosition);

        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');

        this.uens.forEach((uen, index) => {
            const position = this.calculatePosition(uen);
            const zone = this.getStrategicZone(position.x, position.y);

            pdf.text(`${index + 1}. ${uen.name}`, 20, yPosition);
            pdf.text(`Zona: ${zone}`, 80, yPosition);
            pdf.text(`Mercado: $${uen.marketSize}M`, 120, yPosition);
            pdf.text(`Participación: ${uen.marketShare}%`, 160, yPosition);

            yPosition += 6;

            if (yPosition > 190) {
                pdf.addPage();
                yPosition = 20;
            }
        });

        // Guardar PDF
        pdf.save('matriz_mckinsey_analisis.pdf');

        alert('📄 PDF exportado exitosamente');
    }
}

// Inicializar la herramienta
let matrixTool;

window.addEventListener('DOMContentLoaded', () => {
    matrixTool = new MatrixMcKinsey();
});

// Funciones globales para los botones
function addUEN() {
    matrixTool.addUEN();
}

function generateMatrix() {
    matrixTool.generateMatrix();
}

// Función para abrir la vista completa de la matriz
function openMatrixView() {
    // Guardar datos actuales en localStorage
    const projectData = {
        uens: matrixTool.uens,
        variables: {
            internal: matrixTool.getVariables('internal'),
            external: matrixTool.getVariables('external')
        },
        settings: {
            autoCalculateMarketSize: matrixTool.autoCalculateMarketSize,
            autoCalculateDirection: matrixTool.autoCalculateDirection
        }
    };

    localStorage.setItem('currentMatrixProject', JSON.stringify(projectData));

    // Abrir la nueva ventana
    window.open('matrix-view.html', '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
}

function exportToPDF() {
    matrixTool.exportToPDF();
}

// Función para alternar cálculo automático
function toggleAutoCalculation(type, enabled) {
    if (type === 'marketSize') {
        matrixTool.autoCalculateMarketSize = enabled;
        // Recalcular si se habilitó
        if (enabled) {
            matrixTool.uens.forEach(uen => {
                if (uen.sales > 0 && uen.marketShare > 0) {
                    matrixTool.calculateTotalMarketSize(uen);
                }
            });
        }
    } else if (type === 'direction') {
        matrixTool.autoCalculateDirection = enabled;
        // Recalcular si se habilitó
        if (enabled) {
            matrixTool.uens.forEach(uen => {
                matrixTool.calculateStrategicDirection(uen);
            });
        }
    }

    // Regenerar la matriz y la interfaz
    matrixTool.generateMatrix();
    matrixTool.renderUENs();
}

function saveProject() {
    matrixTool.saveProject();
}

function loadProject() {
    matrixTool.loadProject();
}

function handleFileLoad(event) {
    matrixTool.handleFileLoad(event);
}

function addVariable(type) {
    matrixTool.addVariable(type);
}

function toggleAutoCalculation(type, enabled) {
    if (type === 'marketSize') {
        matrixTool.autoCalculateMarketSize = enabled;

        // Si se activa, recalcular todos los tamaños de mercado
        if (enabled) {
            matrixTool.uens.forEach(uen => {
                matrixTool.calculateTotalMarketSize(uen);
            });
        } else {
            // Quitar el estilo de cálculo automático
            matrixTool.uens.forEach(uen => {
                const uenElement = document.getElementById(uen.id);
                if (uenElement) {
                    const marketSizeInput = uenElement.querySelector('input[onchange*="marketSize"]');
                    if (marketSizeInput) {
                        marketSizeInput.style.backgroundColor = '';
                    }
                }
            });
        }
    } else if (type === 'direction') {
        matrixTool.autoCalculateDirection = enabled;

        // Si se activa, recalcular todas las direcciones estratégicas
        if (enabled) {
            matrixTool.uens.forEach(uen => {
                matrixTool.calculateStrategicDirection(uen);
            });
        } else {
            // Quitar el estilo de cálculo automático
            matrixTool.uens.forEach(uen => {
                const uenElement = document.getElementById(uen.id);
                if (uenElement) {
                    const xInput = uenElement.querySelector('input[onchange*="direction"][placeholder="X"]');
                    const yInput = uenElement.querySelector('input[onchange*="direction"][placeholder="Y"]');

                    if (xInput && yInput) {
                        xInput.style.backgroundColor = '';
                        yInput.style.backgroundColor = '';
                    }
                }
            });
        }
    }

    matrixTool.generateMatrix();
}
const menuPrincipal = document.getElementById('menu-principal');
const juegoContainer = document.getElementById('juego');
const tablero = document.getElementById('tablero');
const mensajeElement = document.getElementById('mensaje');
const asistenteElement = document.getElementById('asistente');
const piezasCapturadasBlancas = document.getElementById('piezas-capturadas-blancas');
const piezasCapturadasNegras = document.getElementById('piezas-capturadas-negras');
const volverMenuBtn = document.getElementById('volver-menu');

let piezaSeleccionada = null;
let turnoJugador = true;
let jugandoContraBot = false;

const piezas = {
    'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟',
    'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙'
};

let posicionActual = [
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
];

document.getElementById('jugar-humano').addEventListener('click', () => iniciarJuego(false));
document.getElementById('jugar-bot').addEventListener('click', () => iniciarJuego(true));
document.getElementById('salir').addEventListener('click', () => window.close());
volverMenuBtn.addEventListener('click', volverAlMenu);

function iniciarJuego(contraBot) {
    jugandoContraBot = contraBot;
    menuPrincipal.style.display = 'none';
    juegoContainer.style.display = 'flex';
    volverMenuBtn.style.display = 'block';
    reiniciarJuego();
}

function volverAlMenu() {
    juegoContainer.style.display = 'none';
    volverMenuBtn.style.display = 'none';
    menuPrincipal.style.display = 'flex';
    mensajeElement.textContent = '';
    asistenteElement.textContent = '';
}

function reiniciarJuego() {
    posicionActual = [
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
    ];
    turnoJugador = true;
    piezaSeleccionada = null;
    piezasCapturadasBlancas.innerHTML = '';
    piezasCapturadasNegras.innerHTML = '';
    crearTablero();
    mensajeElement.textContent = "Turno de las blancas";
    asistenteElement.textContent = "Selecciona una pieza para ver sus movimientos posibles.";
}

function crearTablero() {
    tablero.innerHTML = '';
    for (let fila = 0; fila < 8; fila++) {
        for (let columna = 0; columna < 8; columna++) {
            const casilla = document.createElement('div');
            casilla.className = `casilla ${(fila + columna) % 2 === 0 ? 'blanco' : 'negro'}`;
            casilla.dataset.fila = fila;
            casilla.dataset.columna = columna;
            casilla.addEventListener('click', manejarClick);
            tablero.appendChild(casilla);

            const pieza = posicionActual[fila][columna];
            if (pieza !== ' ') {
                const piezaElement = document.createElement('div');
                piezaElement.className = 'pieza';
                piezaElement.textContent = piezas[pieza];
                piezaElement.style.color = pieza === pieza.toUpperCase() ? 'black' : 'white';
                casilla.appendChild(piezaElement);
            }
        }
    }
}

function manejarClick(evento) {
    const casilla = evento.target.closest('.casilla');
    if (!casilla) return;

    const fila = parseInt(casilla.dataset.fila);
    const columna = parseInt(casilla.dataset.columna);

    if (piezaSeleccionada) {
        const filaOrigen = parseInt(piezaSeleccionada.parentElement.dataset.fila);
        const columnaOrigen = parseInt(piezaSeleccionada.parentElement.dataset.columna);
        moverPieza(filaOrigen, columnaOrigen, fila, columna);
        limpiarMovimientosPosibles();
        piezaSeleccionada = null;
        asistenteElement.textContent = "Selecciona una pieza para ver sus movimientos posibles.";
    } else if (casilla.firstChild && esPiezaJugador(posicionActual[fila][columna])) {
        piezaSeleccionada = casilla.firstChild;
        mostrarMovimientosPosibles(fila, columna, posicionActual[fila][columna]);
        mostrarAsistente(posicionActual[fila][columna]);
    }
}



function esPiezaJugador(pieza) {
    return turnoJugador ? pieza === pieza.toLowerCase() : pieza === pieza.toUpperCase();
}

function mostrarMovimientosPosibles(fila, columna, pieza) {
    limpiarMovimientosPosibles();

    const movimientos = obtenerMovimientosPosibles(fila, columna, pieza);
    movimientos.forEach(([f, c]) => {
        const casilla = document.querySelector(`.casilla[data-fila="${f}"][data-columna="${c}"]`);
        casilla.classList.add('posible-movimiento');
    });
}

function limpiarMovimientosPosibles() {
    document.querySelectorAll('.posible-movimiento').forEach(casilla => {
        casilla.classList.remove('posible-movimiento');
    });
}

function obtenerMovimientosPosibles(fila, columna, pieza) {
    const movimientos = [];
    const esPiezaBlanca = pieza === pieza.toLowerCase();
    const direccion = esPiezaBlanca ? -1 : 1;

    switch (pieza.toLowerCase()) {
        case 'p': // Peón
            if (esMovimientoValido(fila + direccion, columna) && !hayPiezaEn(fila + direccion, columna)) {
                movimientos.push([fila + direccion, columna]);
                if ((esPiezaBlanca && fila === 6) || (!esPiezaBlanca && fila === 1)) {
                    if (!hayPiezaEn(fila + 2 * direccion, columna)) {
                        movimientos.push([fila + 2 * direccion, columna]);
                    }
                }
            }
            if (esMovimientoValido(fila + direccion, columna - 1) && esPiezaEnemiga(fila + direccion, columna - 1, esPiezaBlanca)) {
                movimientos.push([fila + direccion, columna - 1]);
            }
            if (esMovimientoValido(fila + direccion, columna + 1) && esPiezaEnemiga(fila + direccion, columna + 1, esPiezaBlanca)) {
                movimientos.push([fila + direccion, columna + 1]);
            }
            break;
        case 'r': // Torre
            movimientos.push(...obtenerMovimientosEnLinea(fila, columna, [[0, 1], [0, -1], [1, 0], [-1, 0]], esPiezaBlanca));
            break;
        case 'n': // Caballo
            const movimientosCaballo = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
            movimientosCaballo.forEach(([df, dc]) => {
                const nuevaFila = fila + df;
                const nuevaColumna = columna + dc;
                if (esMovimientoValido(nuevaFila, nuevaColumna) && !esPiezaAliada(nuevaFila, nuevaColumna, esPiezaBlanca)) {
                    movimientos.push([nuevaFila, nuevaColumna]);
                }
            });
            break;
        case 'b': // Alfil
            movimientos.push(...obtenerMovimientosEnLinea(fila, columna, [[1, 1], [1, -1], [-1, 1], [-1, -1]], esPiezaBlanca));
            break;
        case 'q': // Reina
            movimientos.push(...obtenerMovimientosEnLinea(fila, columna, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]], esPiezaBlanca));
            break;
        case 'k': // Rey
            for (let df = -1; df <= 1; df++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (df === 0 && dc === 0) continue;
                    const nuevaFila = fila + df;
                    const nuevaColumna = columna + dc;
                    if (esMovimientoValido(nuevaFila, nuevaColumna) && !esPiezaAliada(nuevaFila, nuevaColumna, esPiezaBlanca)) {
                        movimientos.push([nuevaFila, nuevaColumna]);
                    }
                }
            }
            break;
    }

    return movimientos;
}

function obtenerMovimientosEnLinea(fila, columna, direcciones, esPiezaBlanca) {
    const movimientos = [];
    direcciones.forEach(([df, dc]) => {
        let nuevaFila = fila + df;
        let nuevaColumna = columna + dc;
        while (esMovimientoValido(nuevaFila, nuevaColumna)) {
            if (!hayPiezaEn(nuevaFila, nuevaColumna)) {
                movimientos.push([nuevaFila, nuevaColumna]);
            } else if (esPiezaEnemiga(nuevaFila, nuevaColumna, esPiezaBlanca)) {
                movimientos.push([nuevaFila, nuevaColumna]);
                break;
            } else {
                break;
            }
            nuevaFila += df;
            nuevaColumna += dc;
        }
    });
    return movimientos;
}

function esMovimientoValido(fila, columna) {
    return fila >= 0 && fila < 8 && columna >= 0 && columna < 8;
}

function hayPiezaEn(fila, columna) {
    return posicionActual[fila][columna] !== ' ';
}

function esPiezaEnemiga(fila, columna, esPiezaBlanca) {
    const pieza = posicionActual[fila][columna];
    return pieza !== ' ' && (esPiezaBlanca ? pieza === pieza.toUpperCase() : pieza === pieza.toLowerCase());
}

function esPiezaAliada(fila, columna, esPiezaBlanca) {
    const pieza = posicionActual[fila][columna];
    return pieza !== ' ' && (esPiezaBlanca ? pieza === pieza.toLowerCase() : pieza === pieza.toUpperCase());
}

function moverPieza(filaOrigen, columnaOrigen, filaDestino, columnaDestino) {
    const pieza = posicionActual[filaOrigen][columnaOrigen];
    const piezaDestino = posicionActual[filaDestino][columnaDestino];
    
    if (esPiezaJugador(pieza) && esMovimientoValido(filaDestino, columnaDestino)) {
        if (piezaDestino !== ' ') {
            capturarPieza(piezaDestino);
        }

        posicionActual[filaDestino][columnaDestino] = pieza;
        posicionActual[filaOrigen][columnaOrigen] = ' ';

        const piezaElement = document.querySelector(`.casilla[data-fila="${filaOrigen}"][data-columna="${columnaOrigen}"] .pieza`);
        const casillaDestino = document.querySelector(`.casilla[data-fila="${filaDestino}"][data-columna="${columnaDestino}"]`);
        
        casillaDestino.innerHTML = '';
        casillaDestino.appendChild(piezaElement);

        turnoJugador = !turnoJugador;
        
        if (esJaqueMate(!turnoJugador)) {
            mensajeElement.textContent = turnoJugador ? "¡Jaque mate! Ganan las negras" : "¡Jaque mate! Ganan las blancas";
        } else if (esJaque(!turnoJugador)) {
            mensajeElement.textContent = turnoJugador ? "¡Jaque al rey negro!" : "¡Jaque al rey blanco!";
        } else {
            mensajeElement.textContent = turnoJugador ? "Turno de las blancas" : "Turno de las negras";
        }

        if (jugandoContraBot && !turnoJugador) {
            setTimeout(movimientoBot, 500);
        }
    }
}

function movimientoBot() {
    let mejorMovimiento = null;
    let mejorPuntuacion = -Infinity;

    for (let filaOrigen = 0; filaOrigen < 8; filaOrigen++) {
        for (let columnaOrigen = 0; columnaOrigen < 8; columnaOrigen++) {
            const pieza = posicionActual[filaOrigen][columnaOrigen];
            if (pieza !== ' ' && pieza === pieza.toUpperCase()) {
                const movimientos = obtenerMovimientosPosibles(filaOrigen, columnaOrigen, pieza);
                for (const [filaDestino, columnaDestino] of movimientos) {
                    const puntuacion = evaluarMovimiento(filaOrigen, columnaOrigen, filaDestino, columnaDestino);
                    if (puntuacion > mejorPuntuacion) {
                        mejorPuntuacion = puntuacion;
                        mejorMovimiento = [filaOrigen, columnaOrigen, filaDestino, columnaDestino];
                    }
                }
            }
        }
    }

    if (mejorMovimiento) {
        moverPieza(...mejorMovimiento);
    }
}

function evaluarMovimiento(filaOrigen, columnaOrigen, filaDestino, columnaDestino) {
    const piezaOrigen = posicionActual[filaOrigen][columnaOrigen];
    const piezaDestino = posicionActual[filaDestino][columnaDestino];
    
    let puntuacion = 0;

    // Valor de la pieza capturada
    if (piezaDestino !== ' ') {
        puntuacion += valorPieza(piezaDestino);
    }

    // Penalización por mover piezas importantes demasiado pronto
    if (piezaOrigen === 'Q' && filaOrigen === 7) {
        puntuacion -= 5;
    }

    // Bonus por avanzar peones
    if (piezaOrigen === 'P') {
        puntuacion += (7 - filaDestino) * 0.1;
    }

    // Bonus por controlar el centro
    if ((filaDestino === 3 || filaDestino === 4) && (columnaDestino === 3 || columnaDestino === 4)) {
        puntuacion += 0.5;
    }

    return puntuacion;
}

function valorPieza(pieza) {
    const valores = {
        'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0,
        'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
    };
    return valores[pieza] || 0;
}
function capturarPieza(pieza) {
    const piezaCapturada = document.createElement('div');
    piezaCapturada.className = 'pieza-capturada';
    piezaCapturada.textContent = piezas[pieza];
    piezaCapturada.style.color = pieza === pieza.toUpperCase() ? 'black' : 'white';
    
    if (pieza === pieza.toUpperCase()) {
        piezasCapturadasNegras.appendChild(piezaCapturada);
    } else {
        piezasCapturadasBlancas.appendChild(piezaCapturada);
    }
}

function esJaque(esBlanco) {
    const reyPieza = esBlanco ? 'k' : 'K';
    let posicionRey;

    // Encontrar la posición del rey
    for (let fila = 0; fila < 8; fila++) {
        for (let columna = 0; columna < 8; columna++) {
            if (posicionActual[fila][columna] === reyPieza) {
                posicionRey = [fila, columna];
                break;
            }
        }
        if (posicionRey) break;
    }

    // Verificar si alguna pieza enemiga puede atacar al rey
    for (let fila = 0; fila < 8; fila++) {
        for (let columna = 0; columna < 8; columna++) {
            const pieza = posicionActual[fila][columna];
            if (pieza !== ' ' && esPiezaEnemiga(fila, columna, esBlanco)) {
                const movimientos = obtenerMovimientosPosibles(fila, columna, pieza);
                if (movimientos.some(([f, c]) => f === posicionRey[0] && c === posicionRey[1])) {
                    return true;
                }
            }
        }
    }

    return false;
}

function esJaqueMate(esBlanco) {
    if (!esJaque(esBlanco)) return false;

    // Verificar si hay algún movimiento legal que saque al rey del jaque
    for (let fila = 0; fila < 8; fila++) {
        for (let columna = 0; columna < 8; columna++) {
            const pieza = posicionActual[fila][columna];
            if (pieza !== ' ' && !esPiezaEnemiga(fila, columna, esBlanco)) {
                const movimientos = obtenerMovimientosPosibles(fila, columna, pieza);
                for (const [nuevaFila, nuevaColumna] of movimientos) {
                    // Simular el movimiento
                    const piezaOriginal = posicionActual[nuevaFila][nuevaColumna];
                    posicionActual[nuevaFila][nuevaColumna] = pieza;
                    posicionActual[fila][columna] = ' ';

                    const sigueEnJaque = esJaque(esBlanco);

                    // Deshacer el movimiento
                    posicionActual[fila][columna] = pieza;
                    posicionActual[nuevaFila][nuevaColumna] = piezaOriginal;

                    if (!sigueEnJaque) {
                        return false; // Hay al menos un movimiento que evita el jaque mate
                    }
                }
            }
        }
    }

    return true; // No hay movimientos que eviten el jaque mate
}


function mostrarAsistente(pieza) {
    let mensaje = "Movimientos posibles para ";
    switch (pieza.toLowerCase()) {
        case 'p':
            mensaje += "el Peón: Avanza una casilla hacia adelante (o dos en su primer movimiento). Captura en diagonal.";
            break;
        case 'r':
            mensaje += "la Torre: Se mueve en línea recta horizontal o verticalmente.";
            break;
        case 'n':
            mensaje += "el Caballo: Se mueve en forma de 'L' (dos casillas en una dirección y luego una en perpendicular).";
            break;
        case 'b':
            mensaje += "el Alfil: Se mueve en diagonal.";
            break;
        case 'q':
            mensaje += "la Reina: Se mueve en cualquier dirección (horizontal, vertical o diagonal).";
            break;
        case 'k':
            mensaje += "el Rey: Se mueve una casilla en cualquier dirección.";
            break;
    }
    asistenteElement.textContent = mensaje;
}

crearTablero();
mensajeElement.textContent = "Turno de las blancas";
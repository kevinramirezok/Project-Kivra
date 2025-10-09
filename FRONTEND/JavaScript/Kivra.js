/*=================================
  DATOS DE PRODUCTOS - SOLO FALLBACK
==================================*/
// Estructura vacÃ­a que se llenarÃ¡ desde el backend
const productos = {
    barritas: [],
    granolas: [],
    otros: [],
    promos: [
        {
            titulo: "Promo Granolas Premium",
            descripcion: "Llevando 3 unidades surtidas",
            cantidadRequerida: 3,
            categoria: "granolas",
            productos: ["Granola Premium", "Granola Madre Tierra", "Granola Fuerza Natural"],
            precioPromo: 27000,
            precioOriginal: 9900
        },
        {
            titulo: "Promo Granolas Especiales",
            descripcion: "Llevando 3 unidades surtidas",
            cantidadRequerida: 3,
            categoria: "granolas",
            productos: ["Granola Crocante", "Granola Especial con Frutas", "Granola Natural", "Granola EnergÃ©tica", "Granola Crocante con Manzanas", "Granola Tropical"],
            precioPromo: 25000,
            precioOriginal: 9500
        },
        {
            titulo: "Promo Barritas Premium",
            descripcion: "Llevando 4 unidades surtidas",
            cantidadRequerida: 4,
            categoria: "barritas",
            productos: ["Barrita Proteica", "Barrita Dulce de Leche", "Barrita Trigo Sarraceno", "Barrita EnergÃ©tica"],
            precioPromo: 4000,
            precioOriginal: 1150
        },
        {
            titulo: "Promo Barritas Naturales",
            descripcion: "Llevando 4 unidades surtidas",
            cantidadRequerida: 4,
            categoria: "barritas",
            productos: ["Barrita Natural", "Barrita Granola", "Barrita de SÃ©samo", "Barrita de ManÃ­"],
            precioPromo: 3600,
            precioOriginal: 1000
        },
        {
            titulo: "Promo Turrones",
            descripcion: "Llevando 5 unidades surtidas",
            cantidadRequerida: 5,
            categoria: "barritas",
            productos: ["TurrÃ³n EnergÃ©tico de ChÃ­a", "TurrÃ³n EnergÃ©tico", "TurrÃ³n Puro Calcio", "TurrÃ³n Pura Fibra", "TurrÃ³n Crocante de ManÃ­"],
            precioPromo: 7000,
            precioOriginal: 1600
        },
        {
            titulo: "Promo Keto",
            descripcion: "Llevando 2 unidades de Granola Keto",
            cantidadRequerida: 2,
            categoria: "granolas",
            productos: ["Granola Keto"],
            precioPromo: 29900,
            precioOriginal: 16800
        },
        {
            titulo: "Promo Barritas Keto",
            descripcion: "Llevando 4 unidades de Barrita Keto",
            cantidadRequerida: 4,
            categoria: "barritas",
            productos: ["Barrita Keto"],
            precioPromo: 8500,
            precioOriginal: 2500
        }
    ]
};


let mostrandoTodasBarritas = false;
let mostrandoTodosGranolas = false;
let modalPaginaActual = 1;
let mostrandoPromos = false;
const productosPorPagina = 8;

/*=================================
  MÃ“DULOS DE CARRITO
==================================*/
// Estado global
let carrito = [];
let total = 0;

// Funciones de utilidad para mensajes
function mostrarMensaje(mensaje, tipo) {
    const contenedor = document.createElement('div');
    contenedor.className = `mensaje-${tipo}`;
    contenedor.textContent = mensaje;
    document.body.appendChild(contenedor);
    setTimeout(() => contenedor.remove(), 3000);
}

// Funciones de almacenamiento local
function guardarCarrito() {
    localStorage.setItem('kivraCarrito', JSON.stringify(carrito));
    localStorage.setItem('kivraTotal', total.toString());
}

function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('kivraCarrito');
    const totalGuardado = localStorage.getItem('kivraTotal');

    if (carritoGuardado && totalGuardado) {
        carrito = JSON.parse(carritoGuardado);
        total = parseFloat(totalGuardado);
        carritoModule.actualizarCarrito();
        carritoModule.actualizarMiniCarrito();
    }
}

// Funciones del carrito
const carritoModule = {
    async agregarAlCarrito(nombre, precio) {
        try {
            // ðŸš¨ VALIDACIÃ“N CRÃTICA: Tipo y formato de datos
            if (typeof nombre !== 'string' || nombre.trim().length === 0) {
                throw new Error('Nombre del producto invÃ¡lido');
            }
            
            if (typeof precio !== 'number' || isNaN(precio) || precio <= 0) {
                throw new Error('Precio del producto invÃ¡lido');
            }
            
            if (nombre.trim().length > 255) {
                throw new Error('Nombre del producto demasiado largo');
            }
            
            if (precio > 999999) {
                throw new Error('Precio demasiado alto');
            }

            // ðŸ”’ VALIDACIÃ“N DE STOCK: Verificar disponibilidad en tiempo real
            console.log('ðŸ” Verificando stock para:', nombre);
            
            try {
                const response = await fetch('/api/productos');
                const productos = await response.json();
                
                const producto = productos.find(p => p.nombre === nombre.trim());
                
                if (!producto) {
                    throw new Error('Producto no encontrado o discontinuado');
                }
                
                if (producto.stock <= 0) {
                    throw new Error('Producto sin stock disponible');
                }
                
                // Verificar si ya existe en carrito
                const itemExistente = carrito.find(item => item.nombre === nombre.trim());
                const cantidadEnCarrito = itemExistente ? itemExistente.cantidad : 0;
                
                if (cantidadEnCarrito >= producto.stock) {
                    throw new Error(`Solo quedan ${producto.stock} unidades disponibles`);
                }
                
                if (cantidadEnCarrito >= 10) {
                    throw new Error('MÃ¡ximo 10 unidades por producto');
                }
                
                console.log('âœ… Stock validado:', producto.stock, 'En carrito:', cantidadEnCarrito);
                
            } catch (fetchError) {
                console.warn('âš ï¸ No se pudo validar stock, continuando...', fetchError.message);
                // Continuar sin validaciÃ³n de stock si el servidor no responde
            }

            // Proceder con la adiciÃ³n al carrito
            const nombreLimpio = nombre.trim();
            const itemExistente = carrito.find(item => item.nombre === nombreLimpio);
            
            if (itemExistente) {
                itemExistente.cantidad++;
                total += precio;
            } else {
                carrito.push({ nombre: nombreLimpio, precio, cantidad: 1 });
                total += precio;
            }

            guardarCarrito();
            mostrarMensaje('Producto agregado al carrito', 'exito');
        } catch (error) {
            console.error('âŒ Error agregando al carrito:', error);
            mostrarMensaje(error.message, 'error');
            return false;
        }
        this.actualizarCarrito();
        this.actualizarMiniCarrito();
    },

    eliminarDelCarrito(nombre) {
        const itemIndex = carrito.findIndex(item => item.nombre === nombre);
        if (itemIndex !== -1) {
            const item = carrito[itemIndex];
            if (item.cantidad > 1) {
                item.cantidad--;
                total -= item.precio;
            } else {
                total -= item.precio;
                carrito.splice(itemIndex, 1);
            }
            this.actualizarCarrito();
            this.actualizarMiniCarrito();
        }
    },

    vaciarCarrito() {
        carrito = [];
        total = 0;
        this.actualizarCarrito();
        this.actualizarMiniCarrito();
    },

    eliminarProductoCompleto(nombre) {
        const precioTotal = carrito
            .filter(item => item.nombre === nombre)
            .reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        total -= precioTotal;
        carrito = carrito.filter(item => item.nombre !== nombre);
        this.actualizarCarrito();
        this.actualizarMiniCarrito();
    },

    contarProductosAgrupados() {
        return carrito.reduce((acc, item) => {
            if (!acc[item.nombre]) {
                acc[item.nombre] = {
                    cantidad: item.cantidad,
                    precio: item.precio,
                    subtotal: item.precio * item.cantidad
                };
            }
            return acc;
        }, {});
    },

    actualizarCarrito() {
        const lista = document.getElementById("lista-carrito");
        const badge = document.getElementById("carrito-badge");
        const totalElement = document.getElementById("total");

        if (!lista || !badge || !totalElement) return;

        lista.innerHTML = carrito.length === 0
            ? "<li>El carrito estÃ¡ vacÃ­o.</li>"
            : this.renderizarItemsCarrito();

        badge.textContent = carrito.length;
        totalElement.textContent = total;
    },

    actualizarMiniCarrito() {
        const carritos = [
            {
                lista: "mini-carrito-lista",
                count: "mini-carrito-count",
                total: "mini-total"
            },
            {
                lista: "header-mini-carrito-lista",
                count: "header-carrito-count",
                total: "header-mini-total"
            },
            {
                lista: "carrito-modal-items",
                count: "modal-carrito-count",
                total: "carrito-modal-total"
            }
        ];

        const productosAgrupados = this.contarProductosAgrupados();
        const contenidoHTML = Object.keys(productosAgrupados).length === 0
            ? "<div class='mini-vacio'>VacÃ­o</div>"
            : this.renderizarMiniCarrito(productosAgrupados);

        carritos.forEach(cart => {
            const lista = document.getElementById(cart.lista);
            const count = document.getElementById(cart.count);
            const totalElement = document.getElementById(cart.total);

            if (lista) lista.innerHTML = contenidoHTML;
            if (count) count.textContent = carrito.length;
            if (totalElement) totalElement.textContent = total;
        });
    },

    renderizarItemsCarrito() {
        return carrito.map((item, index) => `
            <li>
                ${item.nombre} - $${item.precio}
                <button class="btneliminar" onclick="carritoModule.eliminarDelCarrito(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </li>
        `).join('');
    },

    renderizarMiniCarrito(productos) {
        // ðŸ”’ SEGURIDAD: FunciÃ³n para escapar HTML y prevenir XSS
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        let html = Object.entries(productos)
            .map(([nombre, info], index) => `
                <div class="mini-item">
                    <span class="mini-nombre">${escapeHtml(nombre)}</span>
                    <span class="mini-cantidad">x${info.cantidad}</span>
                    <span class="mini-precio">$${info.subtotal}</span>
                    <div class="mini-acciones">
                        <button class="mini-eliminar-uno" data-producto="${escapeHtml(nombre)}" data-accion="eliminar-uno">-</button>
                        <button class="mini-eliminar-todo" data-producto="${escapeHtml(nombre)}" data-accion="eliminar-todo">Ã—</button>
                    </div>
                </div>
            `).join('');

        if (Object.keys(productos).length > 0) {
            html += `
                <div class="mini-item vaciar-carrito">
                    <button data-accion="vaciar-carrito" class="btn-vaciar">
                        <i class="bi bi-trash"></i> Vaciar Carrito
                    </button>
                </div>
            `;
        }

        // ðŸ”’ SEGURIDAD: Configurar event listeners seguros despuÃ©s del render
        setTimeout(() => this.configurarEventListenersSegurosMini(), 0);

        return html;
    },

    // ðŸ”’ Event listeners seguros para mini carrito
    configurarEventListenersSegurosMini() {
        // Remover listeners anteriores para evitar duplicados
        document.querySelectorAll('[data-accion]').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });

        // Agregar listeners seguros
        document.querySelectorAll('[data-accion="eliminar-uno"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const producto = e.target.dataset.producto;
                if (producto) this.eliminarDelCarrito(producto);
            });
        });

        document.querySelectorAll('[data-accion="eliminar-todo"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const producto = e.target.dataset.producto;
                if (producto) this.eliminarProductoCompleto(producto);
            });
        });

        document.querySelectorAll('[data-accion="vaciar-carrito"]').forEach(btn => {
            btn.addEventListener('click', () => this.vaciarCarrito());
        });
    },

    async finalizarCompra() {
        if (carrito.length === 0) {
            alert("El carrito estÃ¡ vacÃ­o.");
            return;
        }

        // ðŸ”’ VALIDACIÃ“N CRÃTICA: Verificar stock disponible antes de finalizar
        console.log('ðŸ” Validando stock disponible...');
        
        try {
            const response = await fetch('/api/productos');
            const productosActuales = await response.json();
            
            // Verificar cada producto del carrito
            const productosNoDisponibles = [];
            
            for (const itemCarrito of carrito) {
                const productoActual = productosActuales.find(p => p.nombre === itemCarrito.nombre);
                
                if (!productoActual) {
                    productosNoDisponibles.push(`${itemCarrito.nombre} (ya no estÃ¡ disponible)`);
                } else if (productoActual.stock === 0) {
                    productosNoDisponibles.push(`${itemCarrito.nombre} (sin stock)`);
                } else if (productoActual.precio !== itemCarrito.precio) {
                    // Opcional: notificar cambio de precio
                    console.log(`âš ï¸ Precio cambiÃ³ para ${itemCarrito.nombre}: $${itemCarrito.precio} â†’ $${productoActual.precio}`);
                }
            }
            
            // Si hay productos no disponibles, mostrar error
            if (productosNoDisponibles.length > 0) {
                alert(`âŒ Los siguientes productos ya no estÃ¡n disponibles:\n\n${productosNoDisponibles.join('\n')}\n\nPor favor, actualiza tu carrito.`);
                
                // Opcional: remover productos no disponibles del carrito
                carrito = carrito.filter(item => {
                    const disponible = productosActuales.find(p => p.nombre === item.nombre && p.stock > 0);
                    return disponible;
                });
                
                total = carrito.reduce((sum, item) => sum + item.precio, 0);
                this.actualizarCarrito();
                guardarCarrito();
                return;
            }
            
            console.log('âœ… Stock validado correctamente');
            
            // Proceder con la compra
            let mensaje = "Â¡Hola! Quiero pedir:\n";
            carrito.forEach(item => {
                mensaje += `- ${item.nombre} ($${item.precio})\n`;
            });
            mensaje += `Total: $${total}\nÂ¿Podemos coordinar el retiro?`;

            window.open(`https://wa.me/5493482676690?text=${encodeURIComponent(mensaje)}`, "_blank");

            carrito = [];
            total = 0;
            this.actualizarCarrito();
            guardarCarrito();
            
        } catch (error) {
            console.error('âŒ Error validando stock:', error);
            alert('Error al validar stock. Por favor, intenta nuevamente.');
        }
    }
};

/*=================================
  MÃ“DULO DE PRODUCTOS
==================================*/

const productosModule = {
    mostrarPaginaModal(tipo) {
        const productosArray = productos[tipo];
        const modalListado = document.getElementById("modal-listado");
        const modalPagina = document.getElementById("modal-pagina");
        const btnAnterior = document.getElementById("modal-anterior");
        const btnSiguiente = document.getElementById("modal-siguiente");

        // Ocultar elementos de paginaciÃ³n
        modalPagina.style.display = 'none';
        btnAnterior.style.display = 'none';
        btnSiguiente.style.display = 'none';

        // Mostrar todos los productos o promociones
        if (tipo === 'promos') {
            modalListado.innerHTML = this.renderizarPromos(productosArray);
        } else {
            modalListado.innerHTML = this.renderizarProductos(productosArray);
        }

        // Ajustar estilos del contenedor para scroll
        modalListado.style.maxHeight = '70vh';
        modalListado.style.overflowY = 'auto';
    },

    renderizarProductos(productos) {
        return productos.map(prod => `
            <div class="card" data-nombre="${prod.nombre}">
                <img src="imagenes/${prod.imagen}" alt="${prod.nombre}" class="producto-img">
                <strong>${prod.nombre}</strong>
                <span class="precio-modal">$${prod.precio}</span>
                <small class="descripcion">${prod.descripcion}</small>
                <button class="btnagregar" onclick="carritoModule.agregarAlCarrito('${prod.nombre}', ${prod.precio})">
                    Agregar
                </button>
            </div>
        `).join('');
    },

    renderizarPromos(promos) {
        return promos.map(promo => `
            <div class="card" data-nombre="${promo.titulo}">
                <div class="promo-icon-large">âš¡</div>
                <strong>${promo.titulo}</strong>
                <span class="precio-modal precio-promo-modal">$${promo.precioPromo}</span>
                <small class="descripcion">${promo.descripcion}</small>
                <div class="promo-productos">
                    <small>Incluye: ${promo.productos.join(', ')}</small>
                </div>
                <button class="btnagregar" onclick="agregarPromoAlCarrito('${promo.titulo}', ${promo.precioPromo})">
                    Agregar
                </button>
            </div>
        `).join('');
    },

    actualizarControlesPaginacion(pagina, anterior, siguiente, total, tipo) {
        pagina.textContent = `PÃ¡gina ${modalPaginaActual} de ${total}`;
        anterior.style.display = modalPaginaActual > 1 ? "inline-block" : "none";
        siguiente.style.display = modalPaginaActual < total ? "inline-block" : "none";

        anterior.onclick = () => {
            modalPaginaActual--;
            this.mostrarPaginaModal(tipo);
        };
        siguiente.onclick = () => {
            modalPaginaActual++;
            this.mostrarPaginaModal(tipo);
        };
    },

    filtrarProductos() {
        const texto = document.getElementById("buscador").value.toLowerCase();
        const containerGranola = document.getElementById("granolaContainer");
        const containerBarritas = document.getElementById("barritasContainer");
        const containerPromos = document.getElementById("promosContainer");
        const subtitulos = document.querySelectorAll(".productos-subtitulo");
        const seccionesProductos = document.querySelectorAll(".productos-seccion");

        // FunciÃ³n auxiliar para verificar si un producto coincide con la bÃºsqueda
        const coincideConBusqueda = (producto) => {
            return producto.nombre.toLowerCase().includes(texto) ||
                producto.descripcion.toLowerCase().includes(texto);
        };

        // FunciÃ³n auxiliar para verificar si una promo coincide con la bÃºsqueda
        const coincideConBusquedaPromo = (promo) => {
            return promo.titulo.toLowerCase().includes(texto) ||
                promo.descripcion.toLowerCase().includes(texto) ||
                promo.productos.some(p => p.toLowerCase().includes(texto));
        };

        // Filtrar productos y promos
        const granolasCoincidentes = productos.granolas.filter(coincideConBusqueda);
        const barritasCoincidentes = productos.barritas.filter(coincideConBusqueda);
        const promosCoincidentes = productos.promos.filter(coincideConBusquedaPromo);
        const hayResultados = granolasCoincidentes.length > 0 || barritasCoincidentes.length > 0 || promosCoincidentes.length > 0;

        // Mostrar u ocultar subtÃ­tulos y secciones
        subtitulos.forEach(subtitulo => {
            subtitulo.style.display = texto ? "none" : "block";
        });

        seccionesProductos.forEach(seccion => {
            seccion.style.display = texto ? "none" : "block";
        });

        // FunciÃ³n para renderizar mensaje de no resultados
        const mensajeNoResultados = `
        <div class="no-resultados" style="text-align: center; padding: 20px; width: 100%;">
            <h3 style="color: var(--marron); font-size: 1.8rem;">No se encontraron productos que coincidan con "${texto}"</h3>
        </div>
    `;

        // Actualizar contenido de los contenedores
        if (containerGranola) {
            containerGranola.innerHTML = granolasCoincidentes.length > 0 ?
                granolasCoincidentes.map(producto => `
                <div class="producto">
                    <img src="imagenes/${producto.imagen}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p class="descripcion">${producto.descripcion}</p>
                    <p class="precio">$${producto.precio}</p>
                    <button class="btnagregar" onclick="carritoModule.agregarAlCarrito('${producto.nombre}', ${producto.precio})">
                        Agregar al carrito
                    </button>
                </div>
            `).join('') :
                (texto && !hayResultados ? mensajeNoResultados : '');
        }

        if (containerBarritas) {
            containerBarritas.innerHTML = barritasCoincidentes.length > 0 ?
                barritasCoincidentes.map(producto => `
                <div class="producto">
                    <img src="imagenes/${producto.imagen}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p class="descripcion">${producto.descripcion}</p>
                    <p class="precio">$${producto.precio}</p>
                    <button class="btnagregar" onclick="carritoModule.agregarAlCarrito('${producto.nombre}', ${producto.precio})">
                        Agregar al carrito
                    </button>
                </div>
            `).join('') :
                (texto && !hayResultados && !containerGranola.innerHTML && !containerPromos.innerHTML ? mensajeNoResultados : '');
        }

        if (containerPromos) {
            containerPromos.innerHTML = promosCoincidentes.length > 0 ?
                promosCoincidentes.map(promo => `
                <div class="producto">
                    <div class="promo-icon">âš¡</div>
                    <h3>${promo.titulo}</h3>
                    <p class="descripcion">${promo.descripcion}</p>
                    <p class="precio">$${promo.precioPromo}</p>
                    <button class="btnagregar" onclick="agregarPromoAlCarrito('${promo.titulo}', ${promo.precioPromo})">
                        Agregar al carrito
                    </button>
                </div>
            `).join('') : '';
        }

        // Actualizar visibilidad de los botones "Ver mÃ¡s"
        const btnVerMasGranola = document.getElementById("verMasGranola");
        const btnVerMasBarritas = document.getElementById("verMasBarritas");
        const btnVerMasPromos = document.getElementById("verMasPromos");

        if (btnVerMasGranola) {
            btnVerMasGranola.style.display = texto ? "none" : "block";
        }
        if (btnVerMasBarritas) {
            btnVerMasBarritas.style.display = texto ? "none" : "block";
        }
        if (btnVerMasPromos) {
            btnVerMasPromos.style.display = texto ? "none" : "block";
        }
    }
};

/*=================================
  INICIALIZACIÃ“N Y EVENTOS
==================================*/

// Funciones para renderizar productos
function renderBarritas() {
    const contenedor = document.getElementById('barritasContainer');
    const verMasBtn = document.getElementById('verMasBarritas');

    if (!contenedor) return;

    const productosAMostrar = mostrandoTodasBarritas ? productos.barritas : productos.barritas.slice(0, 4);

    contenedor.innerHTML = productosAMostrar.map(producto => {
        // Convertir precio a nÃºmero si viene como string del backend
        const precio = typeof producto.precio === 'string' ? parseFloat(producto.precio) : producto.precio;
        
        return `
        <div class="producto">
            <img src="imagenes/${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="descripcion">${producto.descripcion}</p>
            <p class="precio">$${precio}</p>
            <button class="btnagregar" onclick="carritoModule.agregarAlCarrito('${producto.nombre}', ${precio})">
                Agregar al carrito
            </button>
        </div>
        `;
    }).join('');

    if (verMasBtn) {
        verMasBtn.style.display = mostrandoTodasBarritas ? 'none' : 'block';
    }
}

function renderPromos() {
    const contenedor = document.getElementById('promosContainer');
    const verMasBtn = document.getElementById('verMasPromos');

    if (!contenedor) return;

    // Filtrar promos que tengan productos disponibles en el backend
    const promosDisponibles = productos.promos.filter(promo => {
        const todosLosProductos = [...productos.barritas, ...productos.granolas, ...productos.otros];
        const productosPromoDisponibles = promo.productos.filter(nombrePromo => 
            todosLosProductos.some(prod => prod.nombre === nombrePromo)
        );
        return productosPromoDisponibles.length > 0; // Solo mostrar si al menos 1 producto estÃ¡ disponible
    });

    console.log('ðŸŽ Promos disponibles:', promosDisponibles.length, 'de', productos.promos.length);

    const promosAMostrar = mostrandoPromos ? promosDisponibles : promosDisponibles.slice(0, 4);

    contenedor.innerHTML = promosAMostrar.map(promo => {
        const todosLosProductos = [...productos.barritas, ...productos.granolas, ...productos.otros];
        const productosDisponibles = promo.productos.filter(nombrePromo => 
            todosLosProductos.some(prod => prod.nombre === nombrePromo)
        );
        
        return `
            <div class="producto">
                <div class="promo-icon">âš¡</div>
                <h3>${promo.titulo}</h3>
                <p class="descripcion">${promo.descripcion}</p>  
                <p class="precio">$${promo.precioPromo}</p>
                <div class="promo-productos">
                    <small>Incluye: ${productosDisponibles.join(', ')}</small>
                </div>
                <button class="btnagregar" onclick="agregarPromoAlCarrito('${promo.titulo}', ${promo.precioPromo})">
                    Agregar al carrito
                </button>
            </div>
        `;
    }).join('');

    if (verMasBtn) {
        verMasBtn.style.display = mostrandoPromos || promosDisponibles.length <= 4 ? 'none' : 'block';
    }
}

// Sistema de selecciÃ³n de productos para promos
let seleccionActual = {
    promo: null,
    productosSeleccionados: [],
    cantidadRequerida: 0
};

function mostrarModalSeleccion(promo) {
    const modal = document.getElementById('modal-seleccion');
    const titulo = document.getElementById('modal-seleccion-titulo');
    const descripcion = document.getElementById('modal-seleccion-descripcion');
    const contenedor = document.getElementById('productos-seleccion');
    const totalRequerido = document.getElementById('total-requerido');
    
    // Configurar el modal
    seleccionActual.promo = promo;
    seleccionActual.productosSeleccionados = [];
    seleccionActual.cantidadRequerida = promo.cantidadRequerida;
    
    titulo.textContent = promo.titulo;
    descripcion.textContent = promo.descripcion;
    totalRequerido.textContent = seleccionActual.cantidadRequerida;
    
    // Renderizar opciones de productos con imÃ¡genes
    contenedor.innerHTML = promo.productos.map(nombreProducto => {
        // Buscar el producto completo en la categorÃ­a correspondiente
        const productoCompleto = productos[promo.categoria].find(p => p.nombre === nombreProducto);
        return `
            <div class="producto-seleccion" data-producto="${nombreProducto}" onclick="toggleSeleccionProducto(this)">
                ${productoCompleto ? `<img src="imagenes/${productoCompleto.imagen}" alt="${nombreProducto}">` : ''}
                <h4>${nombreProducto}</h4>
                ${productoCompleto ? `<p class="precio">$${productoCompleto.precio}</p>` : ''}
            </div>
        `;
    }).join('');
    
    actualizarContadorSeleccion();
    modal.classList.add('activo');
}

function toggleSeleccionProducto(elemento) {
    const producto = elemento.dataset.producto;
    const index = seleccionActual.productosSeleccionados.indexOf(producto);
    
    if (index === -1) {
        // Agregar producto si no estÃ¡ seleccionado y no hemos alcanzado el lÃ­mite
        if (seleccionActual.productosSeleccionados.length < seleccionActual.cantidadRequerida) {
            seleccionActual.productosSeleccionados.push(producto);
            elemento.classList.add('seleccionado');
        } else {
            mostrarMensaje(`Solo puedes seleccionar ${seleccionActual.cantidadRequerida} productos`, 'error');
        }
    } else {
        // Remover producto si ya estÃ¡ seleccionado
        seleccionActual.productosSeleccionados.splice(index, 1);
        elemento.classList.remove('seleccionado');
    }
    
    actualizarContadorSeleccion();
}

function actualizarContadorSeleccion() {
    const contador = document.getElementById('contador-seleccion');
    const btnConfirmar = document.getElementById('confirmar-seleccion');
    
    contador.textContent = seleccionActual.productosSeleccionados.length;
    btnConfirmar.disabled = seleccionActual.productosSeleccionados.length !== seleccionActual.cantidadRequerida;
}

function agregarPromoAlCarrito(titulo, precio) {
    const promo = productos.promos.find(p => p.titulo === titulo);
    if (promo) {
        // Promociones Keto se agregan automÃ¡ticamente (un solo producto)
        if (promo.titulo === "Promo Keto" || promo.titulo === "Promo Barritas Keto") {
            const tituloPersonalizado = `${promo.titulo} (${promo.productos.join(', ')})`;
            carritoModule.agregarAlCarrito(tituloPersonalizado, promo.precioPromo);
            mostrarMensaje('PromociÃ³n agregada al carrito con Ã©xito', 'exito');
        } else {
            // Otras promociones requieren selecciÃ³n
            mostrarModalSeleccion(promo);
        }
    }
}

function confirmarSeleccionPromo() {
    if (seleccionActual.productosSeleccionados.length === seleccionActual.cantidadRequerida) {
        const tituloPersonalizado = `${seleccionActual.promo.titulo} (${seleccionActual.productosSeleccionados.join(', ')})`;
        carritoModule.agregarAlCarrito(tituloPersonalizado, seleccionActual.promo.precioPromo);
        document.getElementById('modal-seleccion').classList.remove('activo');
        mostrarMensaje('PromociÃ³n agregada al carrito con Ã©xito', 'exito');
        
        // Limpiar selecciÃ³n actual
        seleccionActual = {
            promo: null,
            productosSeleccionados: [],
            cantidadRequerida: 0
        };
    } else {
        mostrarMensaje(`Debes seleccionar exactamente ${seleccionActual.cantidadRequerida} productos`, 'error');
    }
}

function renderGranolas() {
    const contenedor = document.getElementById('granolaContainer');
    const verMasBtn = document.getElementById('verMasGranola');

    if (!contenedor) return;

    const productosAMostrar = mostrandoTodosGranolas ? productos.granolas : productos.granolas.slice(0, 4);

    contenedor.innerHTML = productosAMostrar.map(producto => {
        // Convertir precio a nÃºmero si viene como string del backend
        const precio = typeof producto.precio === 'string' ? parseFloat(producto.precio) : producto.precio;
        
        return `
        <div class="producto">
            <img src="imagenes/${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="descripcion">${producto.descripcion}</p>
            <p class="precio">$${precio}</p>
            <button class="btnagregar" onclick="carritoModule.agregarAlCarrito('${producto.nombre}', ${precio})">
                Agregar al carrito
            </button>
        </div>
        `;
    }).join('');

    if (verMasBtn) {
        verMasBtn.style.display = mostrandoTodosGranolas ? 'none' : 'block';
    }
}

// Variables para el control del header
let isHeaderSmall = false;
let lastScrollY = 0;
let scrollTimer = null;
const SCROLL_THRESHOLD = 100;
const SCROLL_DELAY = 150; // ms entre actualizaciones

// FunciÃ³n throttled para el scroll
function handleHeaderScroll() {
    if (scrollTimer !== null) {
        return; // Si hay una actualizaciÃ³n pendiente, salimos
    }

    const currentScroll = window.scrollY;
    const header = document.querySelector('header');
    
    // Solo actualizamos si el cambio es significativo
    if (Math.abs(currentScroll - lastScrollY) > 10) {
        scrollTimer = setTimeout(() => {
            const shouldBeSmall = currentScroll > SCROLL_THRESHOLD;
            
            if (shouldBeSmall !== isHeaderSmall) {
                header.classList.toggle('header-small', shouldBeSmall);
                isHeaderSmall = shouldBeSmall;
            }
            
            lastScrollY = currentScroll;
            scrollTimer = null;
        }, SCROLL_DELAY);
    }
}

// ConfiguraciÃ³n de API - se adapta automÃ¡ticamente al entorno
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://kivra-nutrir-production.up.railway.app';

// FunciÃ³n para cargar productos desde el backend
function cargarProductosDesdeBackend() {
    console.log('ðŸ”„ Intentando cargar productos desde el backend...');
    console.log('ðŸŒ URL de API:', `${API_BASE_URL}/api/productos`);
    
    fetch(`${API_BASE_URL}/api/productos`)
        .then(res => {
            console.log('ðŸ“¡ Respuesta del backend recibida:', res.status, res.ok);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(productosBackend => {
            console.log('ðŸ“¦ Productos recibidos del backend:', productosBackend.length);
            console.log('ðŸ“‹ Lista completa de productos:', productosBackend);
            
            // Filtrar solo productos con stock disponible
            const productosConStock = productosBackend.filter(p => p.stock > 0);
            console.log('âœ… Productos con stock disponible:', productosConStock.length);
            
            // Reorganizar productos por categorÃ­a (solo los que tienen stock)
            productos.barritas = productosConStock.filter(p => p.categoria === 'barritas' || p.categoria === 'otros' || !p.categoria || p.categoria.trim() === '');
            productos.granolas = productosConStock.filter(p => p.categoria === 'granolas');
            productos.otros = productosConStock.filter(p => p.categoria === 'otros');
            
            console.log('ðŸ“Š Productos categorizados:');
            console.log('ðŸ« Barritas:', productos.barritas.length, productos.barritas.map(p => p.nombre));
            console.log('ðŸ¥£ Granolas:', productos.granolas.length, productos.granolas.map(p => p.nombre));
            console.log('ðŸ“¦ Otros:', productos.otros.length, productos.otros.map(p => p.nombre));
            
            // Renderizar productos
            renderPromos();
            renderGranolas();
            renderBarritas();
            console.log('âœ¨ Productos renderizados desde backend');
        })
        .catch(error => {
            console.error('ERROR: No se pudo conectar con el backend:', error);
            // Mostrar mensaje de error al usuario
            const barritasContainer = document.getElementById('barritasContainer');
            const granolaContainer = document.getElementById('granolaContainer');
            if (barritasContainer) {
                barritasContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #e74c3c;">
                        <h3>âŒ Error de conexiÃ³n</h3>
                        <p>No se pudieron cargar los productos. Intenta recargar la pÃ¡gina.</p>
                    </div>
                `;
            }
            if (granolaContainer) {
                granolaContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #e74c3c;">
                        <h3>âŒ Error de conexiÃ³n</h3>
                        <p>No se pudieron cargar los productos. Intenta recargar la pÃ¡gina.</p>
                    </div>
                `;
            }
        });
}

document.addEventListener('DOMContentLoaded', () => {
    // Cargar productos desde backend o usar datos estÃ¡ticos como fallback
    cargarProductosDesdeBackend();

    // AÃ±adir evento de scroll
    window.addEventListener('scroll', handleHeaderScroll);

    // Cargar el carrito al inicio
    cargarCarrito();

    // Inicializar carritos
    const initializeCart = (toggleId, contentId, chevronId) => {
        const toggleBtn = document.getElementById(toggleId);
        const content = document.getElementById(contentId);
        const chevron = document.getElementById(chevronId);

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (content.classList.contains("oculto")) {
                    content.classList.remove("oculto");
                    chevron.style.transform = "rotate(180deg)";
                } else {
                    content.classList.add("oculto");
                    chevron.style.transform = "rotate(0deg)";
                }
            });
        }
    };

    // Inicializar carritos
    initializeCart("toggle-header-carrito", "header-mini-carrito-contenido", "header-chevron-carrito");

    // Inicializar carrito modal
    const toggleCartModal = document.getElementById('toggle-carrito-modal');
    const cartModalContent = document.getElementById('carrito-modal-contenido');
    const closeCartModal = document.querySelector('.cerrar-carrito-modal');

    if (toggleCartModal && cartModalContent) {
        toggleCartModal.addEventListener('click', () => {
            cartModalContent.classList.toggle('activo');
            const isOpen = cartModalContent.classList.contains('activo');
            document.getElementById('chevron-carrito-modal').style.transform =
                isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    }

    if (closeCartModal) {
        closeCartModal.addEventListener('click', () => {
            cartModalContent.classList.remove('activo');
            document.getElementById('chevron-carrito-modal').style.transform = 'rotate(0deg)';
        });
    }

    // BotÃ³n seguir comprando
    document.getElementById('seguir-comprando-modal')?.addEventListener('click', () => {
        cartModalContent.classList.remove('activo');
        document.getElementById('chevron-carrito-modal').style.transform = 'rotate(0deg)';
    });    // Configurar botones de finalizar compra
    ["finalizar-compra-modal", "finalizar-compra-header", "finalizar-compra-sidebar"].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => {
            carritoModule.finalizarCompra();
        });
    });

    // Otros controladores de eventos
    document.getElementById("abrir-carrito")?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById("carrito-sidebar").classList.add("activo");
    });
    document.getElementById("cerrar-carrito")?.addEventListener('click', () => {
        document.getElementById("carrito-sidebar").classList.remove("activo");
    });

    // Inicializar buscador
    document.getElementById("buscador")?.addEventListener('input', productosModule.filtrarProductos);

    // Configurar botones "Ver mÃ¡s"
    // FunciÃ³n para mostrar el modal
    function mostrarModal() {
        document.getElementById('modal-productos').classList.add('activo');
        document.body.classList.add('modal-open');
    }

    // FunciÃ³n para ocultar el modal
    function ocultarModal() {
        document.getElementById('modal-productos').classList.remove('activo');
        document.body.classList.remove('modal-open');
    }

    // Event listeners para el modal
    document.getElementById('cerrar-modal')?.addEventListener('click', ocultarModal);
    document.getElementById('modal-productos')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-productos') {
            ocultarModal();
        }
    });

    document.getElementById("verMasBarritas")?.addEventListener('click', () => {
        modalPaginaActual = 1;
        document.getElementById('modal-titulo').textContent = 'Barritas Saludables';
        productosModule.mostrarPaginaModal('barritas');
        mostrarModal();
    });

    document.getElementById("verMasGranola")?.addEventListener('click', () => {
        modalPaginaActual = 1;
        document.getElementById('modal-titulo').textContent = 'Granolas Saludables';
        productosModule.mostrarPaginaModal('granolas');
        mostrarModal();
    });

    document.getElementById("verMasPromos")?.addEventListener('click', () => {
        modalPaginaActual = 1;
        document.getElementById('modal-titulo').textContent = 'Promociones Especiales';
        productosModule.mostrarPaginaModal('promos');
        mostrarModal();
    });

    // Event listeners para modal de selecciÃ³n
    document.getElementById('cerrar-modal-seleccion')?.addEventListener('click', () => {
        document.getElementById('modal-seleccion').classList.remove('activo');
    });
    
    document.getElementById('cancelar-seleccion')?.addEventListener('click', () => {
        document.getElementById('modal-seleccion').classList.remove('activo');
    });
    
    document.getElementById('confirmar-seleccion')?.addEventListener('click', confirmarSeleccionPromo);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('modal-seleccion')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-seleccion') {
            document.getElementById('modal-seleccion').classList.remove('activo');
        }
    });

});

// =============================
// ACTUALIZAR STOCK DESDE FRONTEND
// =============================
// Llama a este mÃ©todo para actualizar el stock de un producto en la base de datos MySQL
// Ejemplo: actualizarStockProducto(5, 10) // Actualiza el producto con id=5 a stock=10
function actualizarStockProducto(id, nuevoStock) {
    fetch(`${API_BASE_URL}/api/productos/${id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: nuevoStock })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            mostrarMensaje('Stock actualizado correctamente', 'exito');
        } else {
            mostrarMensaje('Error al actualizar stock', 'error');
        }
    })
    .catch(() => mostrarMensaje('Error de conexiÃ³n con el backend', 'error'));
}
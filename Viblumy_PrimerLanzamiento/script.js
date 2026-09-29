const nav = document.querySelector("#nav");
const abrir = document.querySelector("#abrir");
const cerrar = document.querySelector("#cerrar");

abrir.addEventListener("click", () => {
  nav.classList.add("visible");
});

cerrar.addEventListener("click", () => {
  nav.classList.remove("visible");
});

/*OPCIONAL para al tocar en lo sombreado se cierre el menú*/
/*document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !abrir.contains(e.target)) {
        nav.classList.remove("visible");
    }
});

document.querySelectorAll(".nav-list li a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
        nav.classList.remove("visible");
    });
});*/

let baseSeleccionada = null;

// =========================================================
// 1. LÓGICA DE FILTROS (Categorías y Subcategorías)
// =========================================================

const botonesCat = document.querySelectorAll('.btn-cat');
const listasSubcat = document.querySelectorAll('.pestañas-subcategorias');
const tarjetasCharm = document.querySelectorAll('.tarjeta-charm');

botonesCat.forEach(boton => {
  boton.addEventListener('click', () => {
    //A. Cambiar botón activo visualmente
    botonesCat.forEach(b => b.classList.remove('activa'));
    boton.classList.add('activa');

    const categoria = boton.dataset.cat;

    //B. Ocultar todas las categorías primero
    listasSubcat.forEach(sub => sub.style.display = 'none');

    //C. Mostrar solo la subcategoría correspondiente si existe
    const subcatActiva = document.getElementById(`subcategorias-${categoria}`);
    if (subcatActiva) {
      subcatActiva.style.display = 'block';
    }

    //D. Filtrar los charms en la cuadrícula
    tarjetasCharm.forEach(charm => {
      if (categoria === 'todos' || charm.dataset.cat === categoria) {
        charm.style.display = 'flex';
      } else {
        charm.style.display = 'none';
      }
    });
  });
});

//Filtro por subcategoria
const botonesSubcat = document.querySelectorAll('.btn-subcat');

botonesSubcat.forEach(boton => {
  boton.addEventListener('click', () => {
    // 1. Cambiar visualmente cuál botón de subcategoría está activo
    botonesSubcat.forEach(b => b.classList.remove('activa'));
    boton.classList.add('activa');

    const subcat = boton.dataset.sub;

    // 2. Mostrar únicamente los charms que coincidan con la subcategoría
    tarjetasCharm.forEach(charm => {
      if (charm.dataset.sub === subcat) {
        charm.style.display = 'block';
      } else {
        charm.style.display = 'none';
      }
    });
  });
});

// =========================================================
// 2. SELECCIONAR LA CADENA BASE (Paso 1 del cliente)
// =========================================================
const tarjetasPulsera = document.querySelectorAll('.tarjeta-pulsera');
const imgBaseVistaPrevia = document.getElementById('pulsera-actual');

tarjetasPulsera.forEach(tarjeta => {
  tarjeta.addEventListener('click', () => {
    // 1. Quitar selección previa y marcar la nueva
    tarjetasPulsera.forEach(t => t.classList.remove('activa'));
    tarjeta.classList.add('activa');

    // 2. Actualizar imagen en la vista previa principal
    const nuevaImg = tarjeta.dataset.img;
    if (imgBaseVistaPrevia && nuevaImg) {
      imgBaseVistaPrevia.src = nuevaImg;
    }

    // 3. Obtener datos de la tarjeta desde el HTML
    const nombre = tarjeta.dataset.nombre || tarjeta.querySelector('.nombre')?.textContent;
    const precioTexto = tarjeta.querySelector('.precio')?.textContent || "0";
    const precio = parseFloat(precioTexto.replace(/[^0-9.]/g, '')) || 0;
    
    // CAPTURAMOS EL TIPO DESDE EL HTML (o si no tiene, le asigna 'otro')
    const tipoBase = tarjeta.dataset.tipo || 'otro';

    // 4. Guardar los datos en el objeto baseSeleccionada
    baseSeleccionada = {
      nombre: nombre,
      precio: precio,
      tipo: tipoBase
    };

    // 5. MOSTRAR U OCULTAR EL BLOQUE DE ACOMODO EN PANTALLA
    // Busca el contenedor de las opciones de acomodo en tu HTML
    const contenedorAcomodo = document.querySelector('.seccion-acomodo'); 

    if (contenedorAcomodo) {
      if (tipoBase === 'pulsera') {
        contenedorAcomodo.style.display = 'block'; // Lo muestra si es pulsera
      } else {
        contenedorAcomodo.style.display = 'none';  // Lo oculta si es collar, colgante, etc.
      }
    }

    // 6. Actualizar el ticket y el mensaje de WhatsApp
    actualizarBandeja();
  });
});

// =========================================================
// 3. CONTADORES DE CHARMS (+ y -) Y BANDEJA
// =========================================================
const imgVistaPrevia = document.getElementById('pulsera-actual');

// Escuchar eventos en las tarjetas
tarjetasCharm.forEach(charm => {
  const btnSumar = charm.querySelector('.btn-sumar');
  const btnRestar = charm.querySelector('.btn-restar');
  const spanCant = charm.querySelector('.cant-num');

  // Evento para cambiar la foto grande principal al hacer clic en la tarjeta
  charm.addEventListener('click', () => {
    const nuevaRuta = charm.dataset.img;
    if (imgVistaPrevia && nuevaRuta) {
      imgVistaPrevia.src = nuevaRuta;
    }
  });

  let cantidad = 0;

  if (btnSumar) {
    btnSumar.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita interferencias de clics
      cantidad++;
      spanCant.textContent = cantidad;
      charm.dataset.cantidad = cantidad;
      actualizarBandeja();
    });
  }

  if (btnRestar) {
    btnRestar.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita interferencias de clics
      if (cantidad > 0) {
        cantidad--;
        spanCant.textContent = cantidad;
        charm.dataset.cantidad = cantidad;
        actualizarBandeja();
      }
    });
  }

  // Escuchar cambios en radio buttons (chaquiras/acabado) dentro de la tarjeta
  charm.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      actualizarBandeja();
    });
  });
});


// ACOMODO
let estiloAcomodo = "Agrupados (juntos al centro)";

// Escuchar cambios en la opción de acomodo
document.querySelectorAll('input[name="estilo_acomodo"]').forEach(input => {
  input.addEventListener('change', (e) => {
    // Cambiar clase activa visualmente
    document.querySelectorAll('.tarjeta-acomodo').forEach(t => t.classList.remove('activa'));
    e.target.closest('.tarjeta-acomodo').classList.add('activa');

    // Guardar valor elegido
    estiloAcomodo = e.target.value;
    actualizarBandeja();
  });
});

// =========================================================
// 4. FUNCIÓN CENTRAL: RECALCULAR Y REDIBUJAR BANDEJA
// =========================================================
function actualizarBandeja() {
  const listaPedido = document.getElementById('lista-pedido');
  const spanTotal = document.getElementById('precio-total');

  if (!listaPedido) return;

  // 1. Limpiar lista
  listaPedido.innerHTML = '';
  let total = 0;

  // 2. AGREGAR BASE Y ACOMODO (Solo si el usuario seleccionó una base)
  if (baseSeleccionada && baseSeleccionada.nombre) {
    const pBase = document.createElement('p');
    pBase.textContent = `🔗 Base: ${baseSeleccionada.nombre} ($${baseSeleccionada.precio} MXN)`;
    listaPedido.appendChild(pBase);
    total += parseFloat(baseSeleccionada.precio);

    // Muestra el acomodo ÚNICAMENTE si la base es de tipo 'pulsera'
    if (baseSeleccionada.tipo === 'pulsera' && typeof estiloAcomodo !== 'undefined' && estiloAcomodo) {
      const pAcomodo = document.createElement('p');
      pAcomodo.textContent = `🎨 Acomodo: ${estiloAcomodo}`;
      listaPedido.appendChild(pAcomodo);
    }
  }

  // 3. AGREGAR PRODUCTOS CON CONTADOR (+ / -) (Dijes, Cadenas sueltas, Llaveros, Pulseras)
  tarjetasCharm.forEach(charm => {
  const cantidad = parseInt(charm.dataset.cantidad || 0);

  if (cantidad > 0) {
    const nombre = charm.dataset.nombre || charm.querySelector('.nombre')?.textContent;
    const precioTexto = charm.querySelector('.precio')?.textContent || "0";
    const precioUnitario = parseFloat(precioTexto.replace(/[^0-9.]/g, '')) || 0;
    const subtotal = precioUnitario * cantidad;

    let detallesTexto = "";

    // Si el producto actual es el patrón de chaquiras, buscamos los radios en todo el documento
    if (nombre.toLowerCase().includes('chaquira')) {
      const radiosChecked = document.querySelectorAll('.colores-grid input[type="radio"]:checked');
      
      let acabado = "";
      let coloresChaquira = [];

      radiosChecked.forEach(radio => {
        const valorLimpio = radio.value ? radio.value.trim() : "";
        const nombreInput = radio.name ? radio.name.toLowerCase() : "";

        if (nombreInput.includes('joyeria') || nombreInput.includes('acabado') || nombreInput.includes('ajuste')) {
          if (valorLimpio !== "null" && valorLimpio !== "") {
            acabado = valorLimpio;
          }
        } else if (valorLimpio !== "null" && valorLimpio.toLowerCase() !== "ninguno" && valorLimpio !== "") {
          coloresChaquira.push(valorLimpio);
        }
      });

      let partes = [];
      if (acabado) partes.push(`Ajuste: ${acabado}`);
      if (coloresChaquira.length > 0) partes.push(`Chaquiras: ${coloresChaquira.join(', ')}`);

      if (partes.length > 0) {
        detallesTexto = `\n   └ ${partes.join(' | ')}`;
      }
    }

    const pCharm = document.createElement('p');
    pCharm.style.whiteSpace = "pre-wrap";
    pCharm.textContent = `✨ ${nombre} x${cantidad} ($${subtotal} MXN)${detallesTexto}`;
    listaPedido.appendChild(pCharm);

    total += subtotal;
  }
});

  // 4. Actualizar total en pantalla
  if (spanTotal) {
    spanTotal.textContent = `$${total} MXN`;
  }
}

// =========================================================
// 5. ENVIAR PEDIDO A WHATSAPP
// =========================================================

const NUMERO_WHATSAPP = "523151230377"; // Número de Viblumy

const btnWhatsapp = document.getElementById('btn-whatsapp');

if (btnWhatsapp) {
  btnWhatsapp.addEventListener('click', () => {
    // A. Encabezado del mensaje
    let mensaje = "✨ *¡Hola Viblumy! Quiero realizar un pedido:* ✨\n\n";

    // B. Detalle de la base seleccionada
    if (baseSeleccionada && baseSeleccionada.nombre) {
      mensaje += `📌 *Base:* ${baseSeleccionada.nombre} ($${baseSeleccionada.precio} MXN)\n`;

      // C. Muestra el estilo de acomodo ÚNICAMENTE si la base es una pulsera
      if (baseSeleccionada.tipo === 'pulsera' && typeof estiloAcomodo !== 'undefined' && estiloAcomodo) {
        mensaje += `🎨 *Acomodo:* ${estiloAcomodo}\n`;
      }
    }

    mensaje += `\n🧩 *Productos / Charms seleccionados:*\n`;

    let tieneCharms = false;

    // D. Recorrer los charms agregados a la bandeja
    tarjetasCharm.forEach(charm => {
      const cantidad = parseInt(charm.dataset.cantidad || 0);

      if (cantidad > 0) {
        tieneCharms = true;
        const nombre = charm.dataset.nombre || charm.querySelector('.nombre')?.textContent || "";
        const precioTexto = charm.querySelector('.precio')?.textContent || "0";
        const precioUnitario = parseFloat(precioTexto.replace(/[^0-9.]/g, '')) || 0;
        const subtotal = precioUnitario * cantidad;

        let detalleWhatsApp = "";

        // Si el producto incluye chaquiras en su nombre o categoría, busca en todo el documento
        if (nombre.toLowerCase().includes('chaquira') || charm.dataset.cat === 'chaquiras') {
          const radiosChecked = document.querySelectorAll('.colores-grid input[type="radio"]:checked');
          
          let acabado = "";
          let coloresChaquira = [];

          radiosChecked.forEach(radio => {
            const valorLimpio = radio.value ? radio.value.trim() : "";
            const nombreInput = radio.name ? radio.name.toLowerCase() : "";

            if (nombreInput.includes('joyeria') || nombreInput.includes('acabado') || nombreInput.includes('ajuste')) {
              if (valorLimpio !== "null" && valorLimpio !== "") {
                acabado = valorLimpio;
              }
            } else if (valorLimpio !== "null" && valorLimpio.toLowerCase() !== "ninguno" && valorLimpio !== "") {
              coloresChaquira.push(valorLimpio);
            }
          });

          if (acabado) detalleWhatsApp += `\n     - Ajuste: ${acabado}`;
          if (coloresChaquira.length > 0) detalleWhatsApp += `\n     - Colores: ${coloresChaquira.join(', ')}`;
        }

        mensaje += ` • *${nombre}* x${cantidad} -> $${subtotal} MXN${detalleWhatsApp}\n`;
      }
    });

    if (!tieneCharms) {
      mensaje += ` (Sin productos adicionales)\n`;
    }

    // E. Obtener el total directamente de la bandeja
    const spanTotal = document.getElementById('precio-total');
    const totalTexto = spanTotal ? spanTotal.textContent : '$0 MXN';

    mensaje += `\n💰 *Total estimado:* ${totalTexto}\n\n`;
    mensaje += `¿Me podrías confirmar disponibilidad y los datos para el pago, por favor? 💖`;

    // F. Convertir el texto a formato URL y abrir WhatsApp
    const urlWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsapp, '_blank');
  });
}
// Escuchar cuando el usuario cambia cualquier opción de radio (colores/acabado de chaquiras)
document.addEventListener('change', (event) => {
  if (event.target && event.target.matches('.colores-grid input[type="radio"]')) {
    actualizarBandeja();
  }
});

// =========================================================
// 6. COMPRA DIRECTA DESDE "DISPONIBLE AHORA"
// =========================================================

const botonesComprarDirecto = document.querySelectorAll('.btn-comprar-directo');

botonesComprarDirecto.forEach(boton => {
  boton.addEventListener('click', (e) => {
    e.preventDefault();

    // Capturar datos del producto desde los atributos data-
    const nombreProducto = boton.dataset.nombre || "Producto listo para enviar";
    const precioProducto = boton.dataset.precio || "0";

    // Encabezado del mensaje para stock disponible
    let mensaje = `✨ *¡Hola Viblumy! Me interesa un producto de Disponible Ahora:* ✨\n\n`;
    mensaje += `🛍️ *Producto:* ${nombreProducto}\n`;
    mensaje += `💰 *Precio:* $${precioProducto} MXN\n\n`;
    mensaje += `¿Aún lo tienes disponible para envío/entrega inmediata? 💖`;

    // Abrir WhatsApp con el número oficial
    const urlWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsapp, '_blank');
  });
});
// =========================================================
// 7. FILTRO PARA "DISPONIBLE AHORA" (Joyería / Diseños Viblumy)
// =========================================================

const botonesFiltroDA = document.querySelectorAll('.btn-filtro-da');
const tarjetasDisponible = document.querySelectorAll('.tarjeta-disponible');

botonesFiltroDA.forEach(boton => {
  boton.addEventListener('click', () => {
    // 1. Cambiar estilo del botón activo
    botonesFiltroDA.forEach(b => b.classList.remove('activa'));
    boton.classList.add('activa');

    const categoriaElegida = boton.dataset.cat;

    // 2. Filtrar las tarjetas
    tarjetasDisponible.forEach(tarjeta => {
      const categoriaProducto = tarjeta.dataset.cat;

      if (categoriaElegida === 'todos' || categoriaProducto === categoriaElegida) {
        tarjeta.style.display = 'flex'; // o 'block', según el layout de tu CSS
      } else {
        tarjeta.style.display = 'none';
      }
    });
  });
});
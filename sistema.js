(function () {
    'use strict';

    // ============================================================
    // PAGE ROUTER (sidebar navigation)
    // ============================================================
    function showPage(name) {
        const target = document.querySelector(`.page[data-page="${name}"]`);
        if (!target) return showPage('dashboard');
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        target.classList.add('active');
        document.querySelectorAll('.sidebar-link').forEach(l => {
            l.classList.toggle('active', l.dataset.page === name);
        });
        document.querySelector('.main').scrollTo({ top: 0, behavior: 'instant' });
        if (location.hash !== `#${name}`) {
            history.replaceState(null, '', `#${name}`);
        }
    }

    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            const page = link.dataset.page;
            if (!page) return;
            e.preventDefault();
            showPage(page);
        });
    });

    // ============================================================
    // GLOBAL CLICK DELEGATION (data-action handlers)
    // ============================================================
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;

        switch (action) {
            case 'goto':
                showPage(target.dataset.target);
                break;

            case 'open-modal':
                openModal(target.dataset.modal, target.dataset.name || '');
                break;

            case 'close-modal':
                closeModal();
                break;

            case 'confirm-modal':
                handleModalConfirm();
                break;

            case 'open-route':
                openModal('rutaDetail', target.dataset.id);
                break;

            case 'open-alert':
                toast('info', 'Alerta abierta', 'Detalle disponible en este mockup.');
                break;

            case 'map-pin':
                toast('info', 'Unidad seleccionada', `${target.dataset.name} · clic para detalle de ruta`);
                break;

            case 'mark-all-read':
                toast('success', 'Bandeja actualizada', '30 alertas marcadas como leídas (demo).');
                break;

            case 'filter-period':
                toast('info', 'Filtro de período', 'En la versión completa se abriría un selector de fechas.');
                break;

            case 'export':
                toast('success', 'Reporte generado', `Exportando "${target.dataset.target || 'Reporte'}"… (demo)`);
                break;
        }
    });

    // Filter chip toggle (visual only)
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const siblings = chip.parentElement.querySelectorAll('.filter-chip');
            siblings.forEach(s => s.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    // Filter input on tables (visual filter)
    document.querySelectorAll('[data-filter]').forEach(input => {
        input.addEventListener('input', () => {
            const tableId = input.dataset.filter;
            const tbody = document.querySelector(`#${tableId} tbody`);
            if (!tbody) return;
            const q = input.value.trim().toLowerCase();
            tbody.querySelectorAll('tr').forEach(tr => {
                tr.style.display = q && !tr.textContent.toLowerCase().includes(q) ? 'none' : '';
            });
        });
    });

    document.querySelectorAll('[data-filter-select]').forEach(sel => {
        sel.addEventListener('change', () => {
            const tableId = sel.dataset.filterSelect;
            const tbody = document.querySelector(`#${tableId} tbody`);
            if (!tbody) return;
            const v = sel.value.trim().toLowerCase();
            tbody.querySelectorAll('tr').forEach(tr => {
                tr.style.display = v && !tr.textContent.toLowerCase().includes(v) ? 'none' : '';
            });
        });
    });

    // Global search hits enter → toast
    const gs = document.getElementById('globalSearch');
    if (gs) {
        gs.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && gs.value.trim()) {
                toast('info', 'Búsqueda global', `Resultados para "${gs.value.trim()}" (demo).`);
                gs.value = '';
            }
        });
    }

    // ============================================================
    // MODAL CONTENT TEMPLATES
    // ============================================================
    const TEMPLATES = {
        newUnidad: {
            title: 'Registrar nueva unidad',
            body: `
                <div class="form-grid">
                    <div class="form-group"><label class="form-label">Placa <span class="req">*</span></label><input class="form-control" placeholder="P-123ABC"></div>
                    <div class="form-group"><label class="form-label">Tipo</label>
                        <select class="form-control"><option>Camión 3.5T</option><option>Camión 5T</option><option>Furgón</option><option>Pick-up</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Capacidad (kg)</label><input class="form-control" type="number" placeholder="3500"></div>
                    <div class="form-group"><label class="form-label">Año</label><input class="form-control" type="number" placeholder="2024"></div>
                    <div class="form-group"><label class="form-label">Vencimiento de documentación</label><input class="form-control" type="date"></div>
                    <div class="form-group"><label class="form-label">Tipo de carga soportada</label><input class="form-control" placeholder="General, refrigerada, frágil…"></div>
                </div>
                <div class="form-group" style="grid-column:1/-1"><label class="form-label">Observaciones</label><textarea class="form-control" placeholder="Notas internas"></textarea></div>
            `,
            confirmLabel: 'Registrar unidad',
            confirmToast: { type: 'success', title: 'Unidad registrada (demo)', body: 'En producción se guardaría en la base de datos.' }
        },
        newPiloto: {
            title: 'Registrar nuevo piloto',
            body: `
                <div class="form-grid">
                    <div class="form-group"><label class="form-label">Nombre completo <span class="req">*</span></label><input class="form-control" placeholder="Juan Pérez"></div>
                    <div class="form-group"><label class="form-label">DPI</label><input class="form-control" placeholder="1234 56789 0101"></div>
                    <div class="form-group"><label class="form-label">Tipo de licencia</label>
                        <select class="form-control"><option>A</option><option>B</option><option>C</option><option>D</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Vencimiento de licencia</label><input class="form-control" type="date"></div>
                    <div class="form-group"><label class="form-label">Teléfono</label><input class="form-control" placeholder="+502 5555 5555"></div>
                    <div class="form-group"><label class="form-label">Años de experiencia</label><input class="form-control" type="number" placeholder="5"></div>
                </div>
            `,
            confirmLabel: 'Registrar piloto',
            confirmToast: { type: 'success', title: 'Piloto registrado (demo)', body: 'El piloto aparecería disponible para asignar a rutas.' }
        },
        newRuta: {
            title: 'Programar nueva ruta',
            body: `
                <div class="form-grid">
                    <div class="form-group"><label class="form-label">Origen <span class="req">*</span></label><input class="form-control" placeholder="Guatemala"></div>
                    <div class="form-group"><label class="form-label">Destino <span class="req">*</span></label><input class="form-control" placeholder="Antigua"></div>
                    <div class="form-group"><label class="form-label">Unidad asignada</label>
                        <select class="form-control"><option>P-567MNO · Furgón (disponible)</option><option>P-890PQR · Camión 8T</option><option>P-678VWX · Camión 5T</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Piloto asignado</label>
                        <select class="form-control"><option>Sofía López (disponible)</option><option>Pedro Castillo</option><option>Diana Morales</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Hora de salida</label><input class="form-control" type="time"></div>
                    <div class="form-group"><label class="form-label">ETA</label><input class="form-control" type="time"></div>
                </div>
                <div class="form-group"><label class="form-label">Notas</label><textarea class="form-control" placeholder="Carga especial, paradas adicionales…"></textarea></div>
            `,
            confirmLabel: 'Programar ruta',
            confirmToast: { type: 'success', title: 'Ruta programada (demo)', body: 'El sistema validaría disponibilidad y crearía la ruta.' }
        },
        newEncomienda: {
            title: 'Registrar encomienda',
            body: `
                <div class="form-grid">
                    <div class="form-group"><label class="form-label">Cliente <span class="req">*</span></label><input class="form-control" placeholder="Empresa o persona"></div>
                    <div class="form-group"><label class="form-label">Tipo de paquete</label>
                        <select class="form-control"><option>Caja chica</option><option>Caja mediana</option><option>Caja grande</option><option>Paleta</option><option>Refrigerada</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Origen</label><input class="form-control" placeholder="Punto de recogida"></div>
                    <div class="form-group"><label class="form-label">Destino</label><input class="form-control" placeholder="Punto de entrega"></div>
                    <div class="form-group"><label class="form-label">Peso (kg)</label><input class="form-control" type="number"></div>
                    <div class="form-group"><label class="form-label">Ruta asignada</label>
                        <select class="form-control"><option>R-2406 · Guatemala → Escuintla</option><option>R-2407 · Guatemala → Huehue</option><option>Sin asignar aún</option></select>
                    </div>
                </div>
            `,
            confirmLabel: 'Registrar',
            confirmToast: { type: 'success', title: 'Encomienda registrada (demo)', body: 'Código asignado automáticamente: ENC-1050' }
        },
        newIncidencia: {
            title: 'Registrar incidencia',
            body: `
                <div class="form-grid">
                    <div class="form-group"><label class="form-label">Tipo <span class="req">*</span></label>
                        <select class="form-control"><option>Accidente / Choque</option><option>Avería mecánica</option><option>Retraso por tráfico</option><option>Encomienda dañada</option><option>Cliente / Reclamo</option><option>Otro</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Prioridad</label>
                        <select class="form-control"><option>Alta</option><option>Media</option><option>Baja</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Unidad relacionada</label><input class="form-control" placeholder="P-123ABC"></div>
                    <div class="form-group"><label class="form-label">Encomienda relacionada</label><input class="form-control" placeholder="ENC-XXXX (opcional)"></div>
                </div>
                <div class="form-group"><label class="form-label">Descripción <span class="req">*</span></label><textarea class="form-control" placeholder="Qué ocurrió, dónde, quiénes estuvieron involucrados…"></textarea></div>
                <div class="form-group"><label class="form-label">Asignar responsable</label>
                    <select class="form-control"><option>Roberto Sánchez (Supervisor Flota)</option><option>Fernando López (Analista)</option><option>Patricia Aguilar (Coord. Rutas)</option></select>
                </div>
            `,
            confirmLabel: 'Crear incidencia',
            confirmToast: { type: 'success', title: 'Incidencia registrada (demo)', body: 'ID: INC-303 · Estado: Nuevo · Asignado.' }
        },
        newMantenimiento: {
            title: 'Programar mantenimiento',
            body: `
                <div class="form-grid">
                    <div class="form-group"><label class="form-label">Unidad <span class="req">*</span></label>
                        <select class="form-control"><option>P-123ABC</option><option>P-456DEF</option><option>P-789GHI</option><option>P-234JKL</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Tipo</label>
                        <select class="form-control"><option>Preventivo</option><option>Correctivo</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Concepto</label>
                        <select class="form-control"><option>Cambio de aceite</option><option>Revisión general</option><option>Frenos</option><option>Llantas</option><option>Motor</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Taller</label>
                        <select class="form-control"><option>Taller Norte</option><option>Taller Central</option><option>Taller Sur</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Fecha programada</label><input class="form-control" type="date"></div>
                    <div class="form-group"><label class="form-label">Costo estimado (Q)</label><input class="form-control" type="number" placeholder="1500"></div>
                </div>
            `,
            confirmLabel: 'Programar',
            confirmToast: { type: 'success', title: 'Mantenimiento programado (demo)', body: 'Se enviaría recordatorio 24 h antes.' }
        },
        newUsuario: {
            title: 'Registrar usuario interno',
            body: `
                <div class="form-grid">
                    <div class="form-group"><label class="form-label">Nombre completo <span class="req">*</span></label><input class="form-control"></div>
                    <div class="form-group"><label class="form-label">Email corporativo</label><input class="form-control" type="email" placeholder="usuario@nova.com.gt"></div>
                    <div class="form-group"><label class="form-label">Rol</label>
                        <select class="form-control"><option>Gerente Operaciones</option><option>Supervisor Flota</option><option>Coordinador Rutas</option><option>Despachador</option><option>Analista Operaciones</option><option>Admin Sistemas</option></select>
                    </div>
                    <div class="form-group"><label class="form-label">Estado inicial</label>
                        <select class="form-control"><option>Activo</option><option>Inactivo</option></select>
                    </div>
                </div>
                <div class="form-hint">Recibirá un correo con su contraseña temporal para el primer acceso.</div>
            `,
            confirmLabel: 'Crear usuario',
            confirmToast: { type: 'success', title: 'Usuario creado (demo)', body: 'Se envió email con credenciales temporales.' }
        },

        // Detail modals (read-only)
        unidadDetail: (name) => ({
            title: `Unidad ${name || 'P-123ABC'}`,
            body: `
                <div class="detail-grid">
                    <div class="detail-item"><span class="label">Placa</span><div class="value"><strong>${name || 'P-123ABC'}</strong></div></div>
                    <div class="detail-item"><span class="label">Tipo</span><div class="value">Camión 3.5T</div></div>
                    <div class="detail-item"><span class="label">Capacidad</span><div class="value">3,500 kg</div></div>
                    <div class="detail-item"><span class="label">Estado</span><div class="value"><span class="badge success">En ruta</span></div></div>
                    <div class="detail-item"><span class="label">Piloto actual</span><div class="value">Carlos Méndez</div></div>
                    <div class="detail-item"><span class="label">Ruta actual</span><div class="value">R-2401 · Guatemala → Antigua</div></div>
                    <div class="detail-item"><span class="label">Último mantenimiento</span><div class="value">14/04/2026 · Cambio aceite</div></div>
                    <div class="detail-item"><span class="label">Próximo mant.</span><div class="value">22/06/2026 · Revisión</div></div>
                    <div class="detail-item"><span class="label">Doc. circulación</span><div class="value">Vence 22/11/2026</div></div>
                    <div class="detail-item"><span class="label">Kilometraje</span><div class="value">84,320 km</div></div>
                </div>
                <div class="panel" style="margin:0"><div class="panel-head"><div class="panel-title" style="font-size:.9rem">Historial reciente</div></div><div class="panel-body flush"><table class="tbl"><tbody>
                    <tr><td>Ruta R-2398 Guatemala → Sololá</td><td>16/05</td><td><span class="badge muted">Finalizada</span></td></tr>
                    <tr><td>Mantenimiento preventivo</td><td>14/04</td><td><span class="badge success">Completado</span></td></tr>
                    <tr><td>Ruta R-2380 Guatemala → Antigua</td><td>13/04</td><td><span class="badge muted">Finalizada</span></td></tr>
                </tbody></table></div></div>
            `,
            confirmLabel: 'Editar unidad',
            confirmToast: { type: 'info', title: 'Modo edición (demo)', body: 'En producción se abriría el formulario editable.' }
        }),
        pilotoDetail: (name) => ({
            title: name || 'Piloto',
            body: `
                <div class="detail-grid">
                    <div class="detail-item"><span class="label">Nombre</span><div class="value"><strong>${name || 'Piloto'}</strong></div></div>
                    <div class="detail-item"><span class="label">DPI</span><div class="value">2840 12345 0101</div></div>
                    <div class="detail-item"><span class="label">Tipo de licencia</span><div class="value">A</div></div>
                    <div class="detail-item"><span class="label">Vence licencia</span><div class="value">02/06/2026 <span class="badge warn no-dot">15 días</span></div></div>
                    <div class="detail-item"><span class="label">Años experiencia</span><div class="value">8 años</div></div>
                    <div class="detail-item"><span class="label">Estado actual</span><div class="value"><span class="badge success">En ruta</span></div></div>
                    <div class="detail-item"><span class="label">Rutas este mes</span><div class="value">23</div></div>
                    <div class="detail-item"><span class="label">Puntualidad</span><div class="value">94.2 %</div></div>
                </div>
                <div class="panel" style="margin:0"><div class="panel-head"><div class="panel-title" style="font-size:.9rem">Última actividad</div></div><div class="panel-body flush"><table class="tbl"><tbody>
                    <tr><td>R-2401 Guatemala → Antigua</td><td>Hoy</td><td><span class="badge success">En curso</span></td></tr>
                    <tr><td>R-2398 Guatemala → Sololá</td><td>16/05</td><td><span class="badge muted">Finalizada</span></td></tr>
                    <tr><td>R-2391 Guatemala → Antigua</td><td>15/05</td><td><span class="badge muted">Finalizada</span></td></tr>
                </tbody></table></div></div>
            `,
            confirmLabel: 'Editar piloto',
            confirmToast: { type: 'info', title: 'Modo edición (demo)', body: 'En producción se abriría el formulario editable.' }
        }),
        rutaDetail: (id) => ({
            title: `Ruta ${id || 'R-2401'}`,
            body: `
                <div class="detail-grid">
                    <div class="detail-item"><span class="label">ID</span><div class="value"><strong>${id || 'R-2401'}</strong></div></div>
                    <div class="detail-item"><span class="label">Estado</span><div class="value"><span class="badge success">En ruta</span></div></div>
                    <div class="detail-item"><span class="label">Origen</span><div class="value">Guatemala</div></div>
                    <div class="detail-item"><span class="label">Destino</span><div class="value">Antigua</div></div>
                    <div class="detail-item"><span class="label">Distancia</span><div class="value">44 km</div></div>
                    <div class="detail-item"><span class="label">Tiempo estimado</span><div class="value">2 h 42 min</div></div>
                    <div class="detail-item"><span class="label">Unidad</span><div class="value">P-123ABC · Camión 3.5T</div></div>
                    <div class="detail-item"><span class="label">Piloto</span><div class="value">Carlos Méndez</div></div>
                </div>
                <div class="tracking" style="background:transparent;border:none;padding:0;margin-top:1rem">
                    <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:.4rem">Progreso de la ruta</div>
                    <div class="tracking-steps">
                        <div class="tracking-line"><div class="tracking-line-fill" style="width:70%"></div></div>
                        <div class="tracking-step done"><div class="tracking-step-dot">✓</div><div class="tracking-step-label">Origen</div></div>
                        <div class="tracking-step done"><div class="tracking-step-dot">✓</div><div class="tracking-step-label">Salida</div></div>
                        <div class="tracking-step active"><div class="tracking-step-dot">●</div><div class="tracking-step-label">En tránsito</div></div>
                        <div class="tracking-step"><div class="tracking-step-dot">4</div><div class="tracking-step-label">Llegada</div></div>
                        <div class="tracking-step"><div class="tracking-step-dot">5</div><div class="tracking-step-label">Entrega</div></div>
                    </div>
                </div>
            `,
            confirmLabel: 'Ver en mapa',
            confirmToast: { type: 'info', title: 'Abriendo mapa', body: 'Cargando vista de monitoreo…' }
        }),
        encomiendaDetail: (id) => ({
            title: `Encomienda ${id || 'ENC-1042'}`,
            body: `
                <div class="detail-grid">
                    <div class="detail-item"><span class="label">Código</span><div class="value"><strong>${id || 'ENC-1042'}</strong></div></div>
                    <div class="detail-item"><span class="label">Cliente</span><div class="value">Distribuidora Sol</div></div>
                    <div class="detail-item"><span class="label">Origen</span><div class="value">Guatemala (CDC zona 12)</div></div>
                    <div class="detail-item"><span class="label">Destino</span><div class="value">Antigua (Av. del Desengaño)</div></div>
                    <div class="detail-item"><span class="label">Tipo</span><div class="value">Caja mediana</div></div>
                    <div class="detail-item"><span class="label">Peso</span><div class="value">12 kg</div></div>
                    <div class="detail-item"><span class="label">Ruta</span><div class="value">R-2401</div></div>
                    <div class="detail-item"><span class="label">Estado</span><div class="value"><span class="badge success">Entregada</span></div></div>
                </div>
                <div class="tracking" style="background:transparent;border:none;padding:0;margin-top:1rem">
                    <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:.4rem">Tracking interno</div>
                    <div class="tracking-steps">
                        <div class="tracking-line"><div class="tracking-line-fill" style="width:100%"></div></div>
                        <div class="tracking-step done"><div class="tracking-step-dot">✓</div><div class="tracking-step-label">Recibida</div></div>
                        <div class="tracking-step done"><div class="tracking-step-dot">✓</div><div class="tracking-step-label">Asignada</div></div>
                        <div class="tracking-step done"><div class="tracking-step-dot">✓</div><div class="tracking-step-label">En tránsito</div></div>
                        <div class="tracking-step done"><div class="tracking-step-dot">✓</div><div class="tracking-step-label">Entregada</div></div>
                    </div>
                </div>
                <div class="panel" style="margin-top:1rem"><div class="panel-head"><div class="panel-title" style="font-size:.9rem">Movimientos</div></div><div class="panel-body flush"><table class="tbl"><tbody>
                    <tr><td>Recepción en bodega</td><td>09:12</td><td>R. Sánchez</td></tr>
                    <tr><td>Asignada a ruta R-2401</td><td>09:35</td><td>P. Aguilar</td></tr>
                    <tr><td>Salida de bodega</td><td>09:00</td><td>C. Méndez</td></tr>
                    <tr><td>Entregada · Firmada</td><td>11:38</td><td>Cliente</td></tr>
                </tbody></table></div></div>
            `,
            confirmLabel: 'Generar comprobante',
            confirmToast: { type: 'success', title: 'Comprobante generado (demo)', body: 'PDF interno de entrega disponible.' }
        }),
        incidenciaDetail: (id) => ({
            title: `Incidencia ${id || 'INC-301'}`,
            body: `
                <div class="detail-grid">
                    <div class="detail-item"><span class="label">ID</span><div class="value"><strong>${id || 'INC-301'}</strong></div></div>
                    <div class="detail-item"><span class="label">Estado</span><div class="value"><span class="badge error">Nuevo</span></div></div>
                    <div class="detail-item"><span class="label">Prioridad</span><div class="value"><span class="badge error">Alta</span></div></div>
                    <div class="detail-item"><span class="label">Tipo</span><div class="value">Accidente / Choque</div></div>
                    <div class="detail-item"><span class="label">Unidad</span><div class="value">P-234JKL</div></div>
                    <div class="detail-item"><span class="label">Reportado por</span><div class="value">Andrés Ramírez (piloto)</div></div>
                    <div class="detail-item"><span class="label">Asignado a</span><div class="value">Roberto Sánchez</div></div>
                    <div class="detail-item"><span class="label">Hora</span><div class="value">Hace 18 min</div></div>
                </div>
                <div class="form-group"><label class="form-label">Descripción</label>
                    <div class="form-control" style="min-height:60px;background:rgba(255,255,255,.02)">Choque leve en CA-1 km 32 con otro vehículo. Sin lesionados. Cliente notificado, ruta continúa pero con retraso estimado de 45 min.</div>
                </div>
                <div class="form-group"><label class="form-label">Agregar seguimiento</label><textarea class="form-control" placeholder="Escribe una actualización…"></textarea></div>
            `,
            confirmLabel: 'Guardar seguimiento',
            confirmToast: { type: 'success', title: 'Seguimiento agregado (demo)', body: 'Se notificaría al supervisor por email.' }
        }),
        userDetail: (name) => ({
            title: name || 'Usuario',
            body: `
                <div class="detail-grid">
                    <div class="detail-item"><span class="label">Nombre</span><div class="value"><strong>${name || 'Usuario'}</strong></div></div>
                    <div class="detail-item"><span class="label">Email</span><div class="value">andrea.morales@nova.com.gt</div></div>
                    <div class="detail-item"><span class="label">Rol</span><div class="value"><span class="role-pill">Gerente Operaciones</span></div></div>
                    <div class="detail-item"><span class="label">Estado</span><div class="value"><span class="badge success">Activo</span></div></div>
                    <div class="detail-item"><span class="label">Último acceso</span><div class="value">Hace 5 min · 192.168.1.42</div></div>
                    <div class="detail-item"><span class="label">Creado</span><div class="value">12/01/2025</div></div>
                </div>
                <div class="panel" style="margin:0"><div class="panel-head"><div class="panel-title" style="font-size:.9rem">Permisos del rol</div></div><div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem">
                    <span class="badge success">Dashboard</span><span class="badge success">Flota — RW</span>
                    <span class="badge success">Pilotos — RW</span><span class="badge success">Rutas — RW</span>
                    <span class="badge success">Monitoreo</span><span class="badge success">Incidencias — RW</span>
                    <span class="badge success">Mantenimiento — RW</span><span class="badge success">Reportes</span>
                    <span class="badge success">Alertas</span><span class="badge muted">Usuarios — Solo lectura</span>
                </div></div>
            `,
            confirmLabel: 'Editar usuario',
            confirmToast: { type: 'info', title: 'Modo edición (demo)', body: 'En producción se abriría el formulario editable.' }
        })
    };

    let currentToastConfig = null;

    function openModal(key, name) {
        const tpl = TEMPLATES[key];
        if (!tpl) return;
        const resolved = typeof tpl === 'function' ? tpl(name) : tpl;
        document.getElementById('modalTitle').textContent = resolved.title;
        document.getElementById('modalBody').innerHTML = resolved.body;
        const foot = document.getElementById('modalFoot');
        foot.innerHTML = `
            <button class="btn btn-ghost btn-sm" data-action="close-modal">Cancelar</button>
            <button class="btn btn-primary btn-sm" data-action="confirm-modal">${resolved.confirmLabel || 'Guardar'}</button>
        `;
        currentToastConfig = resolved.confirmToast || null;
        document.getElementById('modalOverlay').classList.add('active');
    }

    function closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        currentToastConfig = null;
    }

    function handleModalConfirm() {
        if (currentToastConfig) {
            toast(currentToastConfig.type, currentToastConfig.title, currentToastConfig.body);
        }
        closeModal();
    }

    // Close modal on overlay click
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') closeModal();
    });

    // Close modal on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('modalOverlay').classList.contains('active')) {
            closeModal();
        }
    });

    // ============================================================
    // TOASTS
    // ============================================================
    function toast(type, title, body) {
        const stack = document.getElementById('toastStack');
        const el = document.createElement('div');
        el.className = `toast ${type || 'info'}`;
        el.innerHTML = `<strong>${title}</strong><span>${body || ''}</span>`;
        stack.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(30px)';
            el.style.transition = 'all .3s ease';
            setTimeout(() => el.remove(), 320);
        }, 3600);
    }

    // ============================================================
    // THEME TOGGLE (shared with index.html via localStorage)
    // ============================================================
    function applyTheme(t) {
        const theme = t === 'light' ? 'light' : 'dark';
        if (theme === 'light') {
            document.body.setAttribute('data-theme', 'light');
        } else {
            document.body.removeAttribute('data-theme');
        }
        try { localStorage.setItem('theme', theme); } catch (e) {}
    }

    const savedTheme = (function () {
        try { return localStorage.getItem('theme'); } catch (e) { return null; }
    })();
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(savedTheme || (prefersLight ? 'light' : 'dark'));

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = document.body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            applyTheme(current === 'light' ? 'dark' : 'light');
        });
    }

    // ============================================================
    // INITIAL ROUTE
    // ============================================================
    const initial = location.hash.slice(1);
    if (initial && document.querySelector(`.page[data-page="${initial}"]`)) {
        showPage(initial);
    }

    window.addEventListener('hashchange', () => {
        const name = location.hash.slice(1);
        if (name) showPage(name);
    });

    // Welcome toast (only once per session-ish, just a nice touch)
    setTimeout(() => {
        toast('info', '¡Bienvenido al mockup!', 'Explora los 10 módulos del sistema. Todo es clickeable.');
    }, 600);

})();

import React, { useMemo, useRef, useState } from 'react';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonList,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToast,
  IonToolbar,
  RefresherEventDetail,
} from '@ionic/react';
import {
  addOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  closeOutline,
  layersOutline,
  searchOutline,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';
import { FilterOption, Incident, IncidentPriority } from '../types/incident';

/* ------------------------------------------------------------------
   Datos de ejemplo (mismo dominio que la guía: SmartLab Incident Manager)
   ------------------------------------------------------------------ */
const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-101',
    title: 'Fallo de enlace en Switch Rack B',
    location: 'Aula 204 - Redes',
    description: 'Pérdida intermitente de paquetes en puertos Gigabit 12 al 16.',
    priority: 'alta',
    status: 'pendiente',
    createdAt: '09:15',
  },
  {
    id: 'INC-102',
    title: 'Actualización de imágenes Docker',
    location: 'Laboratorio DAM 2',
    description: 'Desplegar imagen base Node 22 Alpine en estaciones de trabajo.',
    priority: 'media',
    status: 'pendiente',
    createdAt: '10:30',
  },
  {
    id: 'INC-103',
    title: 'Calibración de proyector láser',
    location: 'Aula Magna',
    description: 'Ajuste trapezoidal y verificación de entrada HDMI.',
    priority: 'baja',
    status: 'resuelta',
    createdAt: 'Ayer',
  },
];

/* Etiquetas de prioridad: bloques de color plano con texto negro (contraste WCAG AA) */
const PRIORITY_STYLES: Record<IncidentPriority, string> = {
  alta: 'bg-alarm',
  media: 'bg-acid',
  baja: 'bg-signal',
};

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'criticas', label: 'Críticas' },
  { value: 'resuelta', label: 'Resueltas' },
];

const Home: React.FC = () => {
  // Estado principal de datos y controles UI
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('todas');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado controlado del formulario modal
  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<IncidentPriority>('media');

  // Referencia a IonList para cerrar elementos deslizados programáticamente
  const listRef = useRef<HTMLIonListElement | null>(null);

  // Cálculo memoizado de indicadores KPI
  const metrics = useMemo(() => {
    const total = incidents.length;
    const pending = incidents.filter((i) => i.status === 'pendiente').length;
    const resolved = incidents.filter((i) => i.status === 'resuelta').length;
    const critical = incidents.filter(
      (i) => i.status === 'pendiente' && i.priority === 'alta'
    ).length;
    return { total, pending, resolved, critical };
  }, [incidents]);

  const filterCounts: Record<FilterOption, number> = {
    todas: metrics.total,
    pendiente: metrics.pending,
    criticas: metrics.critical,
    resuelta: metrics.resolved,
  };

  // Filtrado combinado por estado y búsqueda textual
  const filteredIncidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return incidents.filter((item) => {
      const matchesStatus =
        activeFilter === 'todas' ||
        (activeFilter === 'criticas'
          ? item.status === 'pendiente' && item.priority === 'alta'
          : item.status === activeFilter);
      const matchesQuery =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [incidents, activeFilter, searchQuery]);

  // Gesto nativo Pull-to-Refresh
  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      setToastMessage('Estado sincronizado con el servidor');
      event.detail.complete();
    }, 700);
  };

  // Alternar estado pendiente / resuelta
  const handleToggleStatus = async (id: string) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'pendiente' ? 'resuelta' : 'pendiente' }
          : item
      )
    );
    await listRef.current?.closeSlidingItems();
    setToastMessage('Estado de incidencia actualizado');
  };

  // Eliminación de elemento
  const handleDeleteIncident = async (id: string) => {
    setIncidents((prev) => prev.filter((item) => item.id !== id));
    await listRef.current?.closeSlidingItems();
    setToastMessage(`Incidencia ${id} eliminada`);
  };

  // Creación de nueva incidencia desde IonModal
  const handleCreateIncident = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      setToastMessage('El título y la ubicación son obligatorios');
      return;
    }
    const newIncident: Incident = {
      id: `INC-${Math.floor(104 + Math.random() * 895)}`,
      title: title.trim(),
      location: location.trim(),
      description: description.trim() || 'Sin observaciones adicionales.',
      priority,
      status: 'pendiente',
      createdAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
    setIncidents((prev) => [newIncident, ...prev]);
    setTitle('');
    setLocation('');
    setDescription('');
    setPriority('media');
    setIsModalOpen(false);
    setToastMessage(`Incidencia ${newIncident.id} registrada`);
  };

  /* Tarjetas KPI: son botones, al pulsarlas aplican el filtro correspondiente */
  const kpis: {
    label: string;
    value: number;
    icon: string;
    filter: FilterOption;
    color: string;
  }[] = [
    { label: 'Total', value: metrics.total, icon: layersOutline, filter: 'todas', color: 'bg-white' },
    { label: 'Pendientes', value: metrics.pending, icon: timeOutline, filter: 'pendiente', color: 'bg-acid' },
    { label: 'Críticas', value: metrics.critical, icon: alertCircleOutline, filter: 'criticas', color: 'bg-alarm' },
    { label: 'Resueltas', value: metrics.resolved, icon: checkmarkCircleOutline, filter: 'resuelta', color: 'bg-go' },
  ];

  const tickerText = `PENDIENTES ${metrics.pending} /// CRÍTICAS ${metrics.critical} /// RESUELTAS ${metrics.resolved} /// TOTAL ${metrics.total} /// `;

  return (
    <IonPage>
      {/* Cabecera: barra negra con tipografía ácida y contador reactivo */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="brutal-toolbar">
          <IonTitle className="font-display text-lg font-black uppercase tracking-tighter sm:text-xl">
            SmartLab<span className="text-white">//</span>Monitor
          </IonTitle>
          <div slot="end" className="mr-3 flex items-center gap-2">
            <span className="hidden font-mono text-xs font-bold uppercase text-white sm:inline">
              Pendientes
            </span>
            <span
              aria-label={`${metrics.pending} incidencias pendientes`}
              className="grid h-10 min-w-[40px] place-items-center border-4 border-acid bg-acid px-2 font-mono text-lg font-black text-ink"
            >
              {metrics.pending}
            </span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="brutal-content">
        {/* Control táctil Pull-to-Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingText="Desliza para actualizar"
            refreshingSpinner="crescent"
            refreshingText="Sincronizando..."
          />
        </IonRefresher>

        {/* Cinta marquesina: refuerzo visual brutalista con datos en vivo */}
        <div className="overflow-hidden border-b-4 border-ink bg-acid py-2" aria-hidden="true">
          <div className="flex w-max animate-marquee whitespace-nowrap font-mono text-sm font-bold uppercase text-ink">
            <span>{tickerText.repeat(4)}</span>
            <span>{tickerText.repeat(4)}</span>
          </div>
        </div>

        {/* Fondo de retícula de puntos + contenedor responsivo */}
        <div className="min-h-[100vh] bg-[radial-gradient(#00000026_1.5px,transparent_1.5px)] [background-size:20px_20px]">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-32 pt-6 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
            {/* ======== COLUMNA IZQUIERDA: Hero + KPIs ======== */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:col-span-5 lg:self-start">
              {/* HERO: altura relativa al viewport (vh) */}
              <section
                aria-labelledby="hero-title"
                className="card-brutal flex min-h-[40vh] flex-col justify-between bg-ink p-5 text-white md:min-h-[35vh] md:p-8 lg:min-h-[45vh]"
              >
                <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-acid">
                  Centro de control · Aula DAM
                </p>
                <h1
                  id="hero-title"
                  className="my-4 font-display text-[clamp(2.25rem,10vw,6rem)] font-black uppercase leading-[0.95] tracking-tighter lg:text-[clamp(2.5rem,4.2vw,4.5rem)]"
                >
                  Panel de
                  <br />
                  <span className="bg-acid px-1 text-ink">Incidencias</span>
                </h1>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <p className="max-w-xs font-display text-sm font-bold text-neutral-200">
                    Registra, filtra y resuelve incidencias del laboratorio en tiempo real.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="btn-brutal border-acid bg-acid shadow-[4px_4px_0_0_#fff] hover:shadow-none"
                  >
                    <IonIcon icon={addOutline} aria-hidden="true" className="text-xl" />
                    Nueva incidencia
                  </button>
                </div>
              </section>

              {/* KPIs: rejilla 2x2 en móvil, 4 en tablet, 2x2 en escritorio (columna lateral) */}
              <section aria-label="Resumen de métricas">
                <h2 className="label-brutal mb-3">▍Estado operativo</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-2">
                  {kpis.map((kpi) => {
                    const isActive = activeFilter === kpi.filter;
                    return (
                      <button
                        key={kpi.label}
                        type="button"
                        onClick={() => setActiveFilter(kpi.filter)}
                        aria-pressed={isActive}
                        aria-label={`${kpi.label}: ${kpi.value}. Filtrar por ${kpi.label.toLowerCase()}`}
                        className={`${kpi.color} group flex min-h-[15vh] flex-col justify-between border-4 border-ink p-4 text-left text-ink transition-transform duration-100 hover:-rotate-1 hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-electric ${
                          isActive ? 'translate-x-[3px] translate-y-[3px] shadow-none ring-4 ring-inset ring-ink' : 'shadow-brutal hover:shadow-brutal-lg'
                        }`}
                      >
                        <span className="flex w-full items-center justify-between">
                          <span className="font-mono text-xs font-bold uppercase">{kpi.label}</span>
                          <IonIcon icon={kpi.icon} aria-hidden="true" className="text-2xl transition-transform group-hover:scale-125" />
                        </span>
                        <span className="font-display text-5xl font-black leading-none">{kpi.value}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* ======== COLUMNA DERECHA: búsqueda, filtros y listado ======== */}
            <div className="space-y-5 lg:col-span-7">
              <section aria-label="Filtros de búsqueda" className="space-y-4">
                <label htmlFor="search" className="label-brutal block">
                  ▍Buscar
                </label>
                <div className="relative">
                  <IonIcon
                    icon={searchOutline}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xl text-ink"
                  />
                  <input
                    id="search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Código, título o aula..."
                    className="field-brutal mt-0 pl-10"
                  />
                </div>

                <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-3">
                  {FILTERS.map((f) => {
                    const isActive = activeFilter === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setActiveFilter(f.value)}
                        aria-pressed={isActive}
                        className={`btn-brutal ${isActive ? 'translate-x-[3px] translate-y-[3px] bg-ink text-acid shadow-none' : ''}`}
                      >
                        {f.label}
                        <span className={`px-1.5 font-mono text-xs ${isActive ? 'bg-acid text-ink' : 'bg-ink text-white'}`}>
                          {filterCounts[f.value]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section aria-label="Listado de incidencias">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="label-brutal">▍Incidencias ({filteredIncidents.length})</h2>
                  <span className="font-mono text-xs text-neutral-700">← Desliza para acciones</span>
                </div>

                {/* En escritorio el listado tiene scroll propio con altura en vh */}
                <div className="lg:max-h-[70vh] lg:overflow-y-auto lg:pb-4 lg:pr-4">
                  {filteredIncidents.length === 0 ? (
                    <div className="flex min-h-[25vh] items-center justify-center border-4 border-dashed border-ink bg-white p-8 text-center">
                      <p className="font-display text-lg font-black uppercase">
                        Nada por aquí.
                        <br />
                        <span className="font-mono text-sm font-bold normal-case">
                          No hay incidencias que coincidan con el filtro.
                        </span>
                      </p>
                    </div>
                  ) : (
                    <IonList ref={listRef} lines="none" className="space-y-5 bg-transparent p-0">
                      {filteredIncidents.map((incident) => {
                        const resolved = incident.status === 'resuelta';
                        return (
                          <IonItemSliding
                            key={incident.id}
                            className="overflow-hidden border-4 border-ink bg-white shadow-brutal transition-transform duration-100 hover:-translate-y-1 hover:shadow-brutal-lg"
                          >
                            <IonItem className="incident-item">
                              <div className="w-full py-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-ink px-2 py-0.5 font-mono text-xs font-bold text-acid">
                                      {incident.id}
                                    </span>
                                    <span
                                      className={`border-2 border-ink px-2 py-0.5 font-mono text-xs font-bold uppercase text-ink ${PRIORITY_STYLES[incident.priority]}`}
                                    >
                                      {incident.priority}
                                    </span>
                                  </div>
                                  <span className="font-mono text-xs font-bold text-neutral-700">
                                    {incident.createdAt}
                                  </span>
                                </div>

                                <h3
                                  className={`mt-3 font-display text-xl font-black uppercase leading-tight tracking-tight sm:text-2xl ${
                                    resolved ? 'text-neutral-500 line-through decoration-4' : 'text-ink'
                                  }`}
                                >
                                  {incident.title}
                                </h3>
                                <p className="mt-1 font-display text-sm font-medium text-neutral-800">
                                  {incident.description}
                                </p>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-4 border-ink pt-3">
                                  <span className="font-mono text-xs font-bold uppercase text-ink">
                                    📍 {incident.location}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(incident.id)}
                                    aria-label={`Marcar ${incident.id} como ${resolved ? 'pendiente' : 'resuelta'}`}
                                    className={`btn-brutal min-h-[36px] px-3 py-1 text-xs ${resolved ? 'bg-go' : 'bg-acid'}`}
                                  >
                                    {resolved ? '✔ Resuelta' : '◷ Pendiente'}
                                  </button>
                                </div>
                              </div>
                            </IonItem>

                            {/* Opciones ocultas tras deslizamiento horizontal */}
                            <IonItemOptions side="end">
                              <IonItemOption
                                className="opt-done"
                                onClick={() => handleToggleStatus(incident.id)}
                                aria-label={`Cambiar estado de ${incident.id}`}
                              >
                                <IonIcon slot="icon-only" icon={checkmarkCircleOutline} />
                              </IonItemOption>
                              <IonItemOption
                                className="opt-delete"
                                onClick={() => handleDeleteIncident(incident.id)}
                                aria-label={`Eliminar ${incident.id}`}
                              >
                                <IonIcon slot="icon-only" icon={trashOutline} />
                              </IonItemOption>
                            </IonItemOptions>
                          </IonItemSliding>
                        );
                      })}
                    </IonList>
                  )}
                </div>
              </section>
            </div>
          </div>

          <footer className="border-t-4 border-ink bg-ink px-4 py-6 text-center font-mono text-xs font-bold uppercase text-acid">
            SmartLab Monitor · Ionic React + Tailwind CSS · DAM 0488
          </footer>
        </div>

        {/* Botón de acción flotante (FAB) accesible (área 64x64px) */}
        <IonFab slot="fixed" vertical="bottom" horizontal="end" className="mb-4 mr-4">
          <IonFabButton
            className="brutal-fab"
            onClick={() => setIsModalOpen(true)}
            aria-label="Registrar nueva incidencia"
          >
            <IonIcon icon={addOutline} className="text-3xl" />
          </IonFabButton>
        </IonFab>

        {/* Modal de alta de nueva incidencia (altura en vh) */}
        <IonModal
          isOpen={isModalOpen}
          onDidDismiss={() => setIsModalOpen(false)}
          className="brutal-modal"
        >
          <IonHeader className="ion-no-border">
            <IonToolbar className="brutal-toolbar">
              <IonTitle className="font-display font-black uppercase tracking-tight">
                Nueva incidencia
              </IonTitle>
              <div slot="end" className="mr-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Cerrar formulario"
                  className="btn-brutal min-h-[44px] min-w-[44px] border-acid bg-acid px-2"
                >
                  <IonIcon icon={closeOutline} aria-hidden="true" className="text-2xl" />
                </button>
              </div>
            </IonToolbar>
          </IonHeader>

          <IonContent className="brutal-content">
            <form onSubmit={handleCreateIncident} className="space-y-5 p-5 md:p-8" noValidate>
              <div>
                <label htmlFor="f-title" className="label-brutal">Título de la incidencia *</label>
                <input
                  id="f-title"
                  className="field-brutal"
                  placeholder="Ej. Error de compilación en SDK"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="f-location" className="label-brutal">Aula o ubicación *</label>
                <input
                  id="f-location"
                  className="field-brutal"
                  placeholder="Ej. Laboratorio 102"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <fieldset>
                <legend className="label-brutal">Nivel de prioridad</legend>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {(['alta', 'media', 'baja'] as IncidentPriority[]).map((p) => (
                    <label
                      key={p}
                      className={`btn-brutal cursor-pointer px-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-electric ${
                        priority === p ? `${PRIORITY_STYLES[p]} translate-x-[3px] translate-y-[3px] shadow-none` : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={priority === p}
                        onChange={() => setPriority(p)}
                        className="sr-only"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="f-desc" className="label-brutal">Descripción técnica</label>
                <textarea
                  id="f-desc"
                  rows={4}
                  className="field-brutal resize-none"
                  placeholder="Detalla los síntomas observados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-brutal w-full bg-acid py-4 text-lg shadow-brutal">
                Guardar incidencia →
              </button>
            </form>
          </IonContent>
        </IonModal>

        {/* Notificación Toast de confirmación */}
        <IonToast
          isOpen={toastMessage !== null}
          message={toastMessage ?? ''}
          duration={2200}
          position="bottom"
          className="brutal-toast"
          onDidDismiss={() => setToastMessage(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;

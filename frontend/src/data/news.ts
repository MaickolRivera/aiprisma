import type { News } from "@/types";

export const NEWS: News[] = [
  {
    id: "columna-carros",
    headline: "Columna: es hora de sacar los carros a gasolina del centro de nuestras ciudades",
    body: "Llevamos años aceptando como normal respirar humo en cada esquina del centro, y ya es momento de decir basta. Creo firmemente que las ciudades deberían prohibir la entrada de carros a gasolina a sus centros históricos antes de 2030. Quienes se oponen dicen que afectará al comercio, pero eso mismo se dijo en otras ciudades que hoy tienen calles más vivas, más seguras y con más clientes caminando. No se trata de castigar a nadie, sino de devolverle el espacio público a la gente. Las alcaldías deben tener el valor de decidir pensando en la salud de nuestros hijos y no en el próximo periodo electoral. El centro es de todos, no de los motores.",
    values: {
      politica: { x: 0.16, y: 0.21, c: 0.19 },
      intencion: { x: -0.92, y: -0.29, c: 0.8 },
      tono: { x: -0.78, y: 0.02, c: 0.94 },
      sustento: { x: -0.78, y: -0.97, c: 0.94 },
    },
    temas: [["seguridad", 0.52], ["politica", 0.21], ["sociedad", 0.12], ["economia", 0.07], ["medio_ambiente", 0.03]],
    alertas: [["clickbait", 0.29], ["nosotros_ellos", 0.17], ["ataque_personal", 0.08], ["generalizacion", 0.05], ["miedo", 0.04]],
  },
  {
    id: "plan-seguridad",
    headline: "¡ALERTA! Lo que nadie te cuenta del nuevo plan de seguridad que pondrá en riesgo a tu familia",
    body: "Prepárate, porque lo que viene es peor de lo que imaginas. El nuevo plan de seguridad que anunciaron con bombos y platillos esconde una verdad que los de siempre no quieren que conozcas. Una fuente que pidió no ser identificada asegura que los barrios quedarán desprotegidos y que la delincuencia se disparará en cuestión de semanas. Mientras ellos se reparten los cargos, la gente honesta queda a merced de los criminales. Todos sabemos cómo terminan estas promesas: con más miedo en las calles y menos policías donde de verdad se necesitan. No te quedes callado y comparte esto antes de que lo borren, porque mañana podría ser demasiado tarde.",
    values: {
      politica: { x: 0.08, y: 0.14, c: 0.08 },
      intencion: { x: -0.52, y: -0.26, c: 0.69 },
      tono: { x: 0.48, y: -0.34, c: 0.7 },
      sustento: { x: -0.23, y: -0.77, c: 0.75 },
    },
    temas: [["seguridad", 0.98], ["sociedad", 0.01], ["politica", 0.0], ["internacional", 0.0], ["economia", 0.0]],
    alertas: [["clickbait", 0.84], ["generalizacion", 0.76], ["nosotros_ellos", 0.5], ["ataque_personal", 0.27], ["miedo", 0.22]],
  },
  {
    id: "seleccion-sub20",
    headline: "La selección femenina sub-20 clasifica al Mundial con una remontada en el último minuto",
    body: "La selección femenina sub-20 consiguió este domingo su clasificación al Mundial de la categoría tras vencer 3-2 a su rival en un partido que parecía perdido. El equipo llegó al minuto 70 abajo por dos goles, pero un doblete de la delantera de 18 años y un cabezazo en el tiempo añadido desataron la celebración de las más de 20.000 personas que llenaron el estadio. La entrenadora destacó la entrega del grupo y dedicó el triunfo a las escuelas de fútbol de las regiones, de donde salieron nueve de las convocadas. Será la tercera participación del país en un Mundial sub-20 femenino y la primera desde 2018. El sorteo de grupos se realizará el próximo mes.",
    values: {
      politica: { x: 0.46, y: 0.0, c: 0.0 },
      intencion: { x: -0.99, y: -0.78, c: 0.94 },
      tono: { x: -1.0, y: -0.03, c: 0.99 },
      sustento: { x: -0.71, y: -0.99, c: 0.93 },
    },
    temas: [["deporte", 1.0], ["entretenimiento", 0.0], ["salud", 0.0], ["cultura", 0.0], ["sociedad", 0.0]],
    alertas: [["nosotros_ellos", 0.94], ["clickbait", 0.44], ["generalizacion", 0.26], ["lenguaje_cargado", 0.03], ["ataque_personal", 0.02]],
  },
  {
    id: "tasa-interes",
    headline: "El banco central mantiene la tasa de interés en 9,25 % por cuarto mes consecutivo",
    body: "La junta directiva del banco central decidió por mayoría de cinco votos contra dos mantener la tasa de interés de referencia en 9,25 %. En el comunicado oficial, la entidad explicó que la inflación anual se ubicó en 5,4 % en septiembre, todavía por encima de la meta del 3 %, y que prefiere esperar nuevos datos antes de iniciar recortes. Los dos codirectores que votaron en contra proponían una reducción de 25 puntos básicos. La encuesta mensual de expectativas a analistas privados anticipaba esta decisión en un 70 % de los casos. La próxima reunión de política monetaria está programada para el 30 de noviembre, cuando se conocerá además el informe trimestral de inflación.",
    values: {
      politica: { x: 0.0, y: 0.0, c: 0.03 },
      intencion: { x: -1.0, y: -0.03, c: 0.76 },
      tono: { x: -1.0, y: 0.0, c: 1.0 },
      sustento: { x: -0.96, y: -1.0, c: 0.99 },
    },
    temas: [["economia", 0.99], ["politica", 0.01], ["salud", 0.0], ["deporte", 0.0], ["cultura", 0.0]],
    alertas: [["clickbait", 0.0], ["lenguaje_cargado", 0.0], ["miedo", 0.0], ["nosotros_ellos", 0.0], ["ataque_personal", 0.0]],
  },
  {
    id: "reforma-tributaria",
    headline: "El Gobierno radica una reforma tributaria que sube el impuesto al patrimonio",
    body: "El Ministerio de Hacienda radicó este martes en el Congreso un proyecto de reforma tributaria que busca recaudar 18 billones de pesos en 2027. La propuesta eleva del 1,5 % al 2,5 % el impuesto al patrimonio para quienes declaren más de 3.000 millones de pesos y elimina exenciones a dividendos. Según cifras del propio ministerio, la medida afectaría a cerca de 52.000 contribuyentes. El ministro defendió el proyecto como necesario para financiar programas sociales, mientras gremios empresariales y partidos de oposición advirtieron que podría frenar la inversión. Analistas consultados coinciden en que el texto sufrirá cambios durante su trámite, que comenzará en las comisiones económicas la próxima semana.",
    values: {
      politica: { x: 0.4, y: 0.05, c: 0.09 },
      intencion: { x: -0.97, y: 0.76, c: 0.93 },
      tono: { x: -0.98, y: 0.0, c: 0.99 },
      sustento: { x: 0.37, y: -0.99, c: 0.84 },
    },
    temas: [["economia", 0.99], ["politica", 0.01], ["sociedad", 0.0], ["internacional", 0.0], ["salud", 0.0]],
    alertas: [["nosotros_ellos", 0.09], ["generalizacion", 0.02], ["clickbait", 0.0], ["lenguaje_cargado", 0.0], ["miedo", 0.0]],
  },
];

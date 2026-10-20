import type { Core } from '@strapi/strapi';

// Contenido de ejemplo para desarrollo. Se carga solo con CMS_SEED_EXAMPLE=true y la base vacía.
const EJEMPLOS = [
  { slug: 'coptv-en-vivo', titulo: 'COPTV en vivo', tipo: 'live', descripcion: 'La señal de COPTV las 24 horas.', generos: 'En vivo' },
  { slug: 'noticiero-central', titulo: 'Noticiero Central', tipo: 'series', descripcion: 'Las noticias del día con el equipo de COPTV.', generos: 'Noticias' },
  { slug: 'documental-raices', titulo: 'Raíces', tipo: 'movie', descripcion: 'Documental sobre la cultura y la historia de nuestra tierra.', generos: 'Documentales', duracionSeg: 5400, anio: 2025 },
] as const;

async function cargarEjemplos(strapi: Core.Strapi) {
  const contenidos = strapi.documents('api::contenido.contenido');
  if ((await contenidos.count({})) > 0) return;

  const creados: { slug: string; documentId: string }[] = [];
  for (const ejemplo of EJEMPLOS) {
    const { documentId } = await contenidos.create({ data: { ...ejemplo, acceso: 'free' }, status: 'published' });
    creados.push({ slug: ejemplo.slug, documentId });
  }
  const serie = creados.find((c) => c.slug === 'noticiero-central')!;
  for (const n of [1, 2]) {
    await contenidos.create({
      data: {
        slug: `noticiero-central-e${n}`,
        titulo: `Edición ${n}`,
        tipo: 'episode',
        acceso: 'free',
        generos: 'Noticias',
        temporada: 1,
        episodio: n,
        duracionSeg: 1800,
        serie: serie.documentId,
      },
      status: 'published',
    });
  }

  const ids = (...slugs: string[]) => creados.filter((c) => slugs.includes(c.slug)).map((c) => c.documentId);
  await strapi.documents('api::portada.portada').create({
    data: {
      carriles: [
        { titulo: 'Destacado', estilo: 'hero', contenidos: ids('coptv-en-vivo', 'documental-raices') },
        { titulo: 'En vivo', estilo: 'live', contenidos: ids('coptv-en-vivo') },
        { titulo: 'Programas', estilo: 'poster', contenidos: ids('noticiero-central') },
        { titulo: 'Documentales', estilo: 'landscape', contenidos: ids('documental-raices') },
      ],
    },
    status: 'published',
  });
  strapi.log.info('Contenido de ejemplo cargado');
}

// El catálogo es público: la API lo lee sin token. Escribir sigue requiriendo entrar al panel.
const LECTURA_PUBLICA = [
  'api::contenido.contenido.find',
  'api::contenido.contenido.findOne',
  'api::portada.portada.find',
];

async function permitirLecturaPublica(strapi: Core.Strapi) {
  const rol = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!rol) return;
  const permisos = strapi.db.query('plugin::users-permissions.permission');
  for (const action of LECTURA_PUBLICA) {
    if (!(await permisos.findOne({ where: { action, role: rol.id } }))) {
      await permisos.create({ data: { action, role: rol.id } });
    }
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await permitirLecturaPublica(strapi);
    if (process.env.CMS_SEED_EXAMPLE === 'true') await cargarEjemplos(strapi);
  },
};

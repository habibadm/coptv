import type { Schema, Struct } from '@strapi/strapi';

export interface PortadaCarril extends Struct.ComponentSchema {
  collectionName: 'components_portada_carriles';
  info: {
    description: 'Fila horizontal de la portada';
    displayName: 'Carril';
  };
  attributes: {
    contenidos: Schema.Attribute.Relation<
      'oneToMany',
      'api::contenido.contenido'
    >;
    estilo: Schema.Attribute.Enumeration<
      ['hero', 'landscape', 'poster', 'live']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'landscape'>;
    titulo: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'portada.carril': PortadaCarril;
    }
  }
}

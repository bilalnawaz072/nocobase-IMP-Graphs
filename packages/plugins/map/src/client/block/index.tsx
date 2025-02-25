import {
  SchemaComponent,
  SchemaComponentOptions,
  SchemaInitializerContext,
  SchemaInitializerProvider,
} from '@nocobase/client';
import React, { useContext, useEffect } from 'react';
import { generateNTemplate } from '../locale';
import { MapActionInitializers } from './MapActionInitializers';
import { MapBlock } from './MapBlock';
import { MapBlockDesigner } from './MapBlockDesigner';
import { MapBlockInitializer } from './MapBlockInitializer';
import { MapBlockProvider, useMapBlockProps } from './MapBlockProvider';

export const MapBlockOptions: React.FC = (props) => {
  const items = useContext(SchemaInitializerContext);
  const children = items.BlockInitializers.items[0].children;
  const schemaInitializer = useContext(SchemaInitializerContext);

  useEffect(() => {
    if (!children.find((item) => item.component === 'MapBlockInitializer')) {
      children.push({
        key: 'mapBlock',
        type: 'item',
        title: generateNTemplate('Map'),
        component: 'MapBlockInitializer',
      });
    }
  }, []);

  return (
    <SchemaInitializerProvider initializers={{ ...schemaInitializer, MapActionInitializers }}>
      <SchemaComponentOptions
        scope={{ useMapBlockProps }}
        components={{ MapBlockInitializer, MapBlockDesigner, MapBlockProvider, MapBlock }}
      >
        {props.children}
      </SchemaComponentOptions>
    </SchemaInitializerProvider>
  );
};

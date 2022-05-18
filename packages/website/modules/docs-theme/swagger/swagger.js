import { useEffect } from 'react';
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist';

export default function Swagger() {
  useEffect(() => {
    SwaggerUIBundle({
      url: '/schema.yml',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: 'StandaloneLayout',
    });
  }, []);
  return <div id="swagger-ui"></div>;
}

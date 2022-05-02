import { useEffect } from 'react';
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist';

export default function Swagger() {
  useEffect(() => {
    window.onload = function () {
      const ui = SwaggerUIBundle({
        url: '/schema.yml',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      });
      window.ui = ui;
    };
  }, []);
  return <div id="swagger-ui"></div>;
}

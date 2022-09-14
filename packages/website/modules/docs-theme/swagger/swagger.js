import { useEffect } from 'react';
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist';

export default function Swagger(props) {
  useEffect(() => {
    SwaggerUIBundle({
      url: props.url,
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: 'StandaloneLayout',
    });
  }, [props.url]);

  return <div id="swagger-ui"></div>;
}

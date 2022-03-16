import { RouterContext } from "next/dist/shared/lib/router-context"; 
import * as NextImage from "next/image";

import '!style-loader!css-loader!sass-loader!../styles/normalize.scss'
import '!style-loader!css-loader!sass-loader!../styles/variables.scss'
import '!style-loader!css-loader!sass-loader!../styles/grid/gridlex-2.7.1.scss'
import '!style-loader!css-loader!sass-loader!../modules/zero/components/components.scss'

export const parameters = {
  nextRouter: {
    Provider: RouterContext.Provider,
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

const OriginalNextImage = NextImage.default;

Object.defineProperty(NextImage, "default", {
  configurable: true,
  value: (props) => <OriginalNextImage {...props} unoptimized />,
});
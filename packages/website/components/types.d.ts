import { Breadcrumbs } from '../components/breadcrumbs/breadcrumbs';
export interface RestrictedRouteProps {
  callback?: boolean; // TODO: Remove if unused
  isRestricted?: boolean;
  redirectTo?: string;
  redirectIfFound?: boolean;
  requiresAuth?: boolean;
  pageBgColor?: string; // TODO: Remove if unused
  navBgColor?: string; // TODO: Remove if unused
  footerBgColor?: string; // TODO: Remove if unused
  data?: any; // TODO: Remove if unused
  highlightMessage?: string; // TODO: Remove if unused
}

export interface MetadataProps {
  title?: string;
  description?: string;
}

export type PageProps = RestrictedRouteProps &
  MetadataProps & {
    breadcrumbs?: Breadcrumbs[];
    authOnLoad?: boolean;
  };

export type PageAccountProps = PageProps & {
  stripePublishableKey?: string;
};

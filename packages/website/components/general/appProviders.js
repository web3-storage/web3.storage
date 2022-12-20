import { QueryClient, QueryClientProvider } from 'react-query';
import { useRouter } from 'next/router';

import { AuthorizationProvider } from 'components/contexts/authorizationContext';
import { UserProvider } from 'components/contexts/userContext';
import { UploadsProvider } from 'components/contexts/uploadsContext';
import { PinRequestsProvider } from 'components/contexts/pinRequestsContext';
import { TokensProvider } from 'components/contexts/tokensContext';
import { TabGroupChoiceProvider } from 'components/contexts/tabGroupChoiceContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

/**
 * @param {any} props
 * @returns
 */
const AppProviders = ({ authorizationProps, children }) => {
  const { pathname } = useRouter();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthorizationProvider {...authorizationProps}>
        <UserProvider loadStorage={pathname.indexOf('/account') !== -1}>
          <UploadsProvider>
            <PinRequestsProvider>
              <TokensProvider>
                <TabGroupChoiceProvider>{children}</TabGroupChoiceProvider>
              </TokensProvider>
            </PinRequestsProvider>
          </UploadsProvider>
        </UserProvider>
      </AuthorizationProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;

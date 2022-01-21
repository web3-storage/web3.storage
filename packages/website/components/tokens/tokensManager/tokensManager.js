import Link from 'next/link';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useQueryClient } from 'react-query';

import TokenRowItem from './tokenRowItem';
import countly from 'lib/countly';
import Loading from 'components/loading/loading';
import Button, { ButtonVariant } from 'components/button/button';
import { useTokens } from 'components/contexts/tokensContext';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Filterable from 'ZeroComponents/filterable/filterable';
import Sortable, { SortType, SortDirection } from 'ZeroComponents/sortable/sortable';
import Pagination from 'ZeroComponents/pagination/pagination';
import SearchIcon from 'assets/icons/search';

const TokensManager = () => {
  const { tokens, fetchDate, isFetchingTokens, deleteToken, getTokens, isCreating } = useTokens();
  const [deletingTokenId, setDeletingTokenId] = useState('');
  const queryClient = useQueryClient();

  const [filteredTokens, setFilteredTokens] = useState([]);
  const [sortedTokens, setSortedTokens] = useState([]);
  const [paginatedTokens, setPaginatedTokens] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(null);

  const deleteTokenCallback = useCallback(
    async id => {
      if (!window.confirm('Are you sure? Deleted tokens cannot be recovered!')) {
        return;
      }
      setDeletingTokenId(id);

      try {
        await deleteToken(id);
      } finally {
        await queryClient.invalidateQueries('get-tokens');

        countly.trackEvent(countly.events.TOKEN_DELETE, {
          ui: countly.ui.TOKENS,
        });

        await getTokens();
        setDeletingTokenId('');
      }
    },
    [queryClient, deleteToken, setDeletingTokenId, getTokens]
  );

  return (
    <div className="section tokens-manager-container">
      <div className="tokens-manager-header">
        <h4>API Tokens</h4>
        <Filterable
          items={tokens}
          icon={<SearchIcon />}
          filterKeys={['name']}
          placeholder="Search for a token"
          queryParam="filter"
          onChange={setFilteredTokens}
        />
        <Sortable
          items={filteredTokens}
          staticLabel={'Sort By'}
          options={[
            {
              label: 'Alphabetical A-Z',
              key: 'name',
              value: 'a-z',
              direction: SortDirection.ASC,
              compareFn: SortType.ALPHANUMERIC,
            },
            {
              label: 'Most Recently Added',
              value: 'newest',
              compareFn: items => items.sort((a, b) => a['created'].localeCompare(b['created'])),
            },
            {
              label: 'Least Recently Added',
              value: 'oldest',
              compareFn: items => items.sort((a, b) => b['created'].localeCompare(a['created'])),
            },
          ]}
          value="a-z"
          queryParam="order"
          onChange={setSortedTokens}
        />
      </div>
      <TokenRowItem name="Name" secret="Token" isHeader />
      <div className="tokens-manager-table-content">
        {isFetchingTokens || !fetchDate ? (
          <Loading className={'tokens-manager-loading-spinner'} />
        ) : !tokens.length ? (
          <span className="tokens-manager-upload-cta">
            You don't have any API Tokens created yet.{'\u00A0'}
            <Button
              className={clsx(isCreating && 'isDisabled')}
              href="/tokens?create=true"
              variant={ButtonVariant.TEXT}
              tracking={{ ui: countly.ui.TOKENS_EMPTY, action: 'New API Token' }}
            >
              <Link href="/tokens?create=true">Create your first API token.</Link>
            </Button>
          </span>
        ) : (
          paginatedTokens.map(({ name, secret, _id }) => (
            <TokenRowItem
              key={secret}
              id={_id}
              name={name}
              secret={secret}
              deletingTokenId={deletingTokenId}
              onTokenDelete={() => deleteTokenCallback(_id)}
            />
          ))
        )}
      </div>
      <div className="tokens-manager-footer">
        <Pagination
          items={sortedTokens}
          itemsPerPage={itemsPerPage}
          visiblePages={2}
          queryParam="page"
          onChange={setPaginatedTokens}
        />
        <Dropdown
          className="tokens-manager-result-dropdown"
          value="10"
          options={[
            { label: 'View 10 Results', value: '10' },
            { label: 'View 20 Results', value: '20' },
            { label: 'View 50 Results', value: '50' },
            { label: 'View 100 Results', value: '100' },
          ]}
          queryParam="items"
          onChange={value => setItemsPerPage(value)}
        />
      </div>
    </div>
  );
};

export default TokensManager;

import Link from 'next/link';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useQueryClient } from 'react-query';

import TokenRowItem from './tokenRowItem';
import countly from 'lib/countly';
import Loading from 'components/loading/loading';
import Button from 'components/button/button';
import { useTokens } from 'components/contexts/tokensContext';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Filterable from 'ZeroComponents/filterable/filterable';
import Sortable from 'ZeroComponents/sortable/sortable';
import Pagination from 'ZeroComponents/pagination/pagination';
import SearchIcon from 'assets/icons/search';

/**
 * @typedef {Object} TokensManagerProps
 * @property {object} [content]
 */

/**
 *
 * @param {TokensManagerProps} props
 * @returns
 */
const TokensManager = ({ content }) => {
  const { tokens, fetchDate, isFetchingTokens, deleteToken, getTokens, isCreating } = useTokens();
  const [deletingTokenId, setDeletingTokenId] = useState('');
  const queryClient = useQueryClient();

  const [filteredTokens, setFilteredTokens] = useState([]);
  const [sortedTokens, setSortedTokens] = useState([]);
  const [paginatedTokens, setPaginatedTokens] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(null);
  const tokenRowLabels = content.table.token_row_labels;

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
        <h4>{content.heading}</h4>
        <Filterable
          items={tokens}
          icon={<SearchIcon />}
          filterKeys={['name']}
          placeholder={content.ui.filter.placeholder}
          queryParam="filter"
          onChange={setFilteredTokens}
        />
        <Sortable
          items={filteredTokens}
          staticLabel={content.ui.sortby.label}
          options={content.ui.sortby.options}
          value="a-z"
          queryParam="order"
          onChange={setSortedTokens}
        />
      </div>
      <TokenRowItem name={tokenRowLabels.name} secret={tokenRowLabels.secret} isHeader />
      <div className="tokens-manager-table-content">
        {isFetchingTokens || !fetchDate ? (
          <Loading className={'tokens-manager-loading-spinner'} />
        ) : !tokens.length ? (
          <span className="tokens-manager-upload-cta">
            {content.table.message}
            {'\u00A0'}
            <Button
              className={clsx(isCreating && 'isDisabled')}
              href={content.table.cta.link}
              variant={content.table.cta.theme}
              tracking={{ ui: countly.ui[content.table.cta.ui], action: content.table.cta.action }}
            >
              <Link href={content.table.cta.link}>{content.table.cta.text}</Link>
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
          itemsPerPage={itemsPerPage || 10}
          visiblePages={2}
          queryParam="page"
          onChange={setPaginatedTokens}
        />
        <Dropdown
          className="tokens-manager-result-dropdown"
          value={content.ui.results.options[0].value}
          options={content.ui.results.options}
          queryParam="items"
          onChange={value => setItemsPerPage(value)}
        />
      </div>
    </div>
  );
};

export default TokensManager;

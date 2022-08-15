/**
 * @fileoverview Account Payment Settings
 */

import AccountPageData from '../../content/pages/app/account.json';

const PaymentSettingsPage = props => {
  const { dashboard } = AccountPageData.page_content;
  return (
    <>
      <>
        <div className="page-container account-container">
          <h1 className="table-heading">{dashboard.heading}</h1>
          <div className="account-content">{props.title}</div>
        </div>
      </>
    </>
  );
};

/**
 * @returns {{ props: import('components/types').PageProps}}
 */
export function getStaticProps() {
  return {
    props: {
      title: AccountPageData.seo.title,
      isRestricted: true,
      redirectTo: '/login/'
    },
  };
}

export default PaymentSettingsPage;

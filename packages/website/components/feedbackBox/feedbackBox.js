import EditThisPage from './editThisPage';
import Feedback from './feedback';

function EditMetaRow({ editUrl, lastUpdatedAt }) {
  return (
    <div>
      <div className="col">{editUrl && <EditThisPage editUrl={editUrl} />}</div>
      {lastUpdatedAt && <div className="last-updated">Last updated on {lastUpdatedAt}</div>}
    </div>
  );
}

export default function FeedbackBox(props) {
  const editUrl = 'https://github.com/web3-storage/web3.storage/tree/main/packages/website/pages/docs/';
  const lastUpdatedAt = 'FIX ME';
  const canDisplayEditMetaRow = !!(editUrl || lastUpdatedAt);

  if (!canDisplayEditMetaRow) {
    return <></>;
  }

  return (
    <footer className="docusaurus-mt-lg">
      <Feedback>{canDisplayEditMetaRow && <EditMetaRow editUrl={editUrl} lastUpdatedAt={lastUpdatedAt} />}</Feedback>
    </footer>
  );
}

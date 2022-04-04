const ISSUE_URL = 'https://github.com/web3-storage/web3.storage/issues/new/choose';
const SUGGEST_CONTENT_URL =
  'https://github.com/web3-storage/docs/issues/new?assignees=&labels=need%2Ftriage&template=content-or-feature-suggestion.md&title=%5BCONTENT+REQUEST%5D+%28add+your+title+here%21%29';

export default function EditThisPage({ editUrl }) {
  const editThisPage = (
    <a href={editUrl} target="_blank" rel="noreferrer noopener">
      Edit this page
    </a>
  );
  const openAnIssue = (
    <a href={ISSUE_URL} target="_blank" rel="noreferrer noopener">
      open an issue
    </a>
  );

  return (
    <>
      {editThisPage} on GitHub or {openAnIssue} for it
      <div>
        <a href={SUGGEST_CONTENT_URL} target="_blank" rel="noreferrer noopener">
          Suggest new content
        </a>
      </div>
    </>
  );
}

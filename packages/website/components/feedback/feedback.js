import React, { useState, useEffect, useRef } from 'react';

import { trackEvent, events } from '../../lib/countly';

function Feedback({ strings: { title, yes, no, thanks, helpUsImprove }, children }) {
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const lastUpdatedAt = 'FIX ME';
  const ISSUE_URL = 'https://github.com/web3-storage/web3.storage/issues/new/choose';
  const SUGGEST_CONTENT_URL = 'https://github.com/web3-storage/web3.storage/issues';
  const editUrl = useRef('https://github.com/web3-storage/web3.storage/tree/main/packages/website/pages/docs/');

  useEffect(() => {
    // grabbing the href from the template
    // @ts-ignore
    editUrl.current = document.querySelector('footer.mt-24 .mt-24 .text-sm')?.getAttribute('href');
  }, [editUrl]);

  const editThisPage = (
    <a href={editUrl.current} target="_blank" rel="noreferrer noopener">
      Edit this page
    </a>
  );

  const openAnIssue = (
    <a href={ISSUE_URL} target="_blank" rel="noreferrer noopener">
      open an issue
    </a>
  );

  const sendFeedback = (answer, answerText) => {
    trackEvent(events.FEEDBACK_HELPFUL, {
      path: window.location.pathname,
      question: title,
      answer,
      answerText,
    });
    setVoteSubmitted(true);
  };

  const actions = (
    <div>
      <button onClick={() => sendFeedback('yes', yes)}>{yes}</button>
      <button onClick={() => sendFeedback('no', no)}>{no}</button>
    </div>
  );

  const thanksView = <div className="feedback-result">{thanks}</div>;
  return (
    <div className="docs-feedback">
      <h3>{title}</h3>
      {voteSubmitted ? thanksView : actions}
      <h4>{helpUsImprove}</h4>
      <div>
        {editUrl.current && editThisPage} on GitHub or {openAnIssue} for it
        <div>
          <a href={SUGGEST_CONTENT_URL} target="_blank" rel="noreferrer noopener">
            Suggest new content
          </a>
        </div>
        {lastUpdatedAt && <div className="last-updated">Last updated on {lastUpdatedAt}</div>}
      </div>
    </div>
  );
}

Feedback.defaultProps = {
  strings: {
    title: 'Was this information helpful?',
    yes: 'Yes',
    no: 'No',
    thanks: 'Thanks! We will use your feedback to prioritize future work.',
    helpUsImprove: 'Help us improve this site!',
  },
};

export default Feedback;

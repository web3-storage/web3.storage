import React, { useState } from 'react';
import { useRouter } from 'next/router';

import { events, saEvent } from '../../../lib/analytics';

function Feedback({ strings: { title, yes, no, thanks, helpUsImprove } }) {
  const router = useRouter();
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const ISSUE_URL = 'https://github.com/web3-storage/web3.storage/issues/new/choose';
  const SUGGEST_CONTENT_URL = 'https://github.com/web3-storage/web3.storage/issues';
  const editUrl = `https://github.com/web3-storage/web3.storage/tree/main/packages/website/pages${router.pathname}.md`;

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
  const sendFeedback = (answer, answerText) => {
    saEvent(events.FEEDBACK_HELPFUL, {
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
        {editUrl && editThisPage} on GitHub or {openAnIssue} for it
        <div>
          <a href={SUGGEST_CONTENT_URL} target="_blank" rel="noreferrer noopener">
            Suggest new content
          </a>
        </div>
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

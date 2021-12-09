import Link from 'next/link';

import TokenCreator from 'components/tokens/tokenCreator/tokenCreator';
import Button, { ButtonVariant } from 'components/button/button';

const Tokens = () => {
  return (
    <div className="page-container tokens-container">
      <div>
        <h3>API Tokens</h3>
        <TokenCreator />
      </div>
      <div className="section tokens-content"></div>
      <div>
        <Button href="/account" variant={ButtonVariant.TEXT}>
          <Link href="/account">Return to dashboard</Link>
        </Button>
        <span>
          Want to test the token quickly? Paste it in{'\u00A0'}
          <Button url="/account" variant={ButtonVariant.TEXT}>
            this demo website{'\u00A0\u00A0'}❯
          </Button>
        </span>
      </div>
    </div>
  );
};

export default Tokens;

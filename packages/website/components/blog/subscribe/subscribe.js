import { useEffect, useState } from 'react';
import Link from 'next/link';

import Button from 'ZeroComponents/button/button';
// import { subscribe } from '../../lib/subscribe.js';

export function getStaticProps() {
  return {
    props: {
      title: 'Subscribe - NFT Storage',
      description: 'Subscribe to the Web3.Storage blog',
      altLogo: true,
    },
  };
}

/**
 * Subscribe Page
 */
export default function Subcribe() {
  const [status, setStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => setStatus(''), [email]);
  useEffect(() => {
    if (status === '') setDisabled(false);
    setErrorMsg('');
  }, [status]);

  /**
   * @param {import('react').ChangeEvent<HTMLFormElement>} e
   */
  const onSubmit = async e => {
    e.preventDefault();
    const userMail = email;

    if (status === 'pending' || !userMail) return;

    setStatus('pending');
    if (errorMsg) {
      setErrorMsg('You could not subscribe to the list');
    }
    setDisabled(true);
    // try to subscribe user
    try {
      // await subscribe(userMail);
      setStatus('success');
    } catch (/** @type {any} */ error) {
      console.error('ERROR SUBSCRIBING USER: ', error);
      setDisabled(false);
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again later.');
    }
  };

  let content = (
    <form onSubmit={onSubmit}>
      <h1>Subscribe</h1>
      <label id="email-entry-label" htmlFor="email">
        Enter Your Email
      </label>
      <input
        aria-labelledby="email-entry-label"
        type="email"
        name="email"
        required
        placeholder="Enter your email"
        onChange={e => setEmail(e.target.value)}
        disabled={status === 'pending'}
        value={email}
      />

      <Button disabled={disabled} type="submit">
        Subscribe
      </Button>
      <br />
      {errorMsg && <p className="error">{errorMsg}</p>}
    </form>
  );

  if (status === 'success') {
    content = (
      <div>
        <h1>Success!</h1>
        <p>You are subscribed to the Mailing List.</p>
        <br />
        <Link href="/blog">Go Back to Reading</Link>
      </div>
    );
  }

  return <div>{content}</div>;
}

import { useState } from 'react';

import Button, { ButtonVariant } from '../../../components/button/button';
import constants from '../../../lib/constants';
import Img from '../../../components/cloudflareImage';
import ImageZigzag from '../../../public/images/illustrations/zigzag-tiny.png';

/**
 * Subscribe Modal
 */
export default function Subscribe() {
  const [status, setStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [email, setEmail] = useState('');
  const API = constants.API;

  const subscribe = async () => {
    const subscribeURL = '/blog/subscription';
    const res = await fetch(API + subscribeURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    });
    if (res.status !== 200 && res.status !== 404) {
      throw new Error();
    }
  };

  /**
   * @param {import('react').ChangeEvent<HTMLFormElement>} e
   */
  const onSubmit = async e => {
    e.preventDefault();
    if (status === 'pending') return;
    setStatus('pending');
    try {
      await subscribe();
      setStatus('success');
    } catch (/** @type {any} */ error) {
      console.error('ERROR SUBSCRIBING USER');
      setDisabled(false);
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="file-uploader-container">
      {status !== 'success' && <h5>Subscribe to our blog</h5>}
      {status === 'success' && <h5>You’re subscribed!</h5>}
      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
        aperiam, eaque ipsa illo
      </p>
      {status === 'success' && (
        <div className="blog-thanks">
          <p>Thank you!</p>
          <Img src={ImageZigzag} />
        </div>
      )}
      {status !== 'success' && (
        <form onSubmit={onSubmit}>
          <div className="blog-search-input">
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
          </div>
          <Button variant={ButtonVariant.TEXT_ARROW} disabled={disabled} type="submit">
            Subscribe
          </Button>
          <br />
          {errorMsg && <p className="error">{errorMsg}</p>}
        </form>
      )}
    </div>
  );
}

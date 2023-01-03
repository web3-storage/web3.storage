import { useEffect, useLayoutEffect } from 'react';
import kwesforms from 'kwesforms';

const CustomStorageForm = ({ onClose }) => {
  useEffect(() => {
    kwesforms.init();
  }, []);

  useLayoutEffect(() => {
    const form = document.getElementById('kwesForm');
    form?.addEventListener('kwSubmitted', function () {
      // do we need to do any custom logic?
    });
  }, []);

  return (
    <form
      id="kwesForm"
      className="kwes-form custom-storage-form text-left max-w-lg text-lg mx-auto mt-12"
      action="https://kwesforms.com/api/foreign/forms/rJbS5DK02SKLzypcNzJ3"
    >
      <h3>Enterprise user inquiry</h3>
      <div className="fields">
        <div className="input-wrapper">
          <label htmlFor="auth">
            Please share the user authentication method (Github, Email) associated with your account.
            <span className="text-red">*</span>
          </label>
          <input
            id="auth"
            name="auth"
            type="text"
            placeholder="email address or github username"
            // @ts-ignore
            rules="required"
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="size">
            Please provide a ballpark estimate for your data volume (both in aggregate and over a given month).
          </label>
          <input id="size" name="size" type="text" placeholder="10Gib or ~1Gib/mo" />
        </div>
        <div className="input-wrapper full">
          <label htmlFor="links">Please share links (Github, website, etc) for what you’re building.</label>
          <textarea id="links" name="links" rows={2}></textarea>
        </div>
        <div className="input-wrapper full">
          <label htmlFor="reading_data">
            How do you plan on reading data uploaded to web3.storage (E.g., w3link gateway, other gateway, directly over
            bitswap, etc.)? How frequently do you plan on reading data?
          </label>
          <textarea id="reading_data" name="reading_data"></textarea>
        </div>
        <div className="input-wrapper full">
          <label htmlFor="anything_else">Is there any additional usage information we should know about?</label>
          <textarea id="anything_else" name="anything_else"></textarea>
        </div>
      </div>
      <div className="sm:col-span-6">
        <button type="submit" className="button outline-light cta Button">
          Send
        </button>
      </div>
    </form>
  );
};

export default CustomStorageForm;

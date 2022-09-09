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
      className="kwes-form text-left max-w-lg text-lg mx-auto mt-12"
      action="https://kwesforms.com/api/foreign/forms/rJbS5DK02SKLzypcNzJ3"
    >
      <h3>Enterprise user inquiry</h3>
      <div className="fields">
        <div className="input-wrapper">
          <label htmlFor="first-name">
            First name<span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="first-name"
            id="first-name"
            autoComplete="given-name"
            // @ts-ignore
            rules="required"
            className="px-2 py-1 focus:ring-indigo-500 focus:border-blue block w-full border-black border-2 rounded-md"
          />
        </div>

        <div className="input-wrapper">
          <label htmlFor="last-name">
            Last name<span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="last-name"
            id="last-name"
            // @ts-ignore
            rules="required"
            autoComplete="family-name"
            className="px-2 py-1 focus:ring-indigo-500 focus:border-blue block w-full border-black border-2 rounded-md"
          />
        </div>

        <div className="input-wrapper">
          <label htmlFor="email">
            Email address associated with your web3.storage account
            <span className="text-red">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@email.com"
            // @ts-ignore
            rules="required|email"
            className="px-2 py-1 focus:ring-indigo-500 focus:border-blue block w-full border-black border-2 rounded-md"
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="size">Estimated amount of storage in GiB</label>
          <input
            id="size"
            name="size"
            type="text"
            placeholder="10,000"
            className="px-2 py-1 focus:ring-indigo-500 focus:border-blue block w-full border-black border-2 rounded-md"
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="company_name">Company Name (if applicable)</label>
          <input
            id="company_name"
            name="company_name"
            type="text"
            placeholder=""
            className="px-2 py-1 focus:ring-indigo-500 focus:border-blue block w-full border-black border-2 rounded-md"
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="anything_else">Any other details we should know about</label>
          <input
            id="anything_else"
            name="anything_else"
            type="text"
            placeholder=""
            className="px-2 py-1 focus:ring-indigo-500 focus:border-blue block w-full border-black border-2 rounded-md"
          />
        </div>
        <div className="sm:col-span-6">
          <button type="submit" className="button outline-light cta Button">
            Send
          </button>
        </div>
      </div>
    </form>
  );
};

export default CustomStorageForm;

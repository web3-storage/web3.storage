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
          <label htmlFor="size">Please share links for what you’re building.</label>
          <input
            id="links"
            name="links"
            type="text"
            placeholder="Github, website, etc"
            // @ts-ignore
            rules="required"
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
            // @ts-ignore
            rules="required"
            className="px-2 py-1 focus:ring-indigo-500 focus:border-blue block w-full border-black border-2 rounded-md"
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="company_name">How do you plan on reading data uploaded to web3.storage?</label>
          <input
            id="how_read"
            name="how_read"
            type="text"
            placeholder="w3link gateway, other gateway, directly over bitswap, etc."
            // @ts-ignore
            rules="required"
            className="px-2 py-1 focus:ring-indigo-500 focus:border-blue block w-full border-black border-2 rounded-md"
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="anything_else">How frequently do you plan on reading data?</label>
          <input
            id="read_freq"
            name="read_freq"
            type="text"
            placeholder="1 GiB / day"
            // @ts-ignore
            rules="required"
            className="px-2 py-1 focus:ring-indigo-500 focus:border-blue block w-full border-black border-2 rounded-md"
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="anything_else">Is there any additional usage information we should know about?</label>
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

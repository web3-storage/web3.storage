import { useEffect } from 'react';
import kwesforms from 'kwesforms';

const W3linkForm = () => {
  useEffect(() => {
    kwesforms.init();
  }, []);

  return (
    <form
      className="kwes-form w3-link-form text-left max-w-lg text-lg mx-auto mt-12"
      action="https://kwesforms.com/api/foreign/forms/YKmGgxCJeFWb8c9zWtDk"
    >
      <p>
        If you’re interested in being added to the waitlist for SuperHot, fill out the form below and we will reach out
        to discuss plans and pricing.
      </p>
      <br />
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
            Email address associated with your NFT.Storage account
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
          <label htmlFor="email">Estimated number of files you&apos;d like to cache</label>
          <input
            id="size"
            name="size"
            type="text"
            placeholder="10,000"
            className="px-2 py-1 focus:ring-indigo-500 focus:border-blue block w-full border-black border-2 rounded-md"
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="email">Organization</label>
          <input
            id="org"
            name="org"
            type="text"
            placeholder="Acme Corp."
            className="px-2 py-1 focus:ring-indigo-500 focus:border-blue block w-full border-black border-2 rounded-md"
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="email">Job Title</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Engineer"
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

export default W3linkForm;

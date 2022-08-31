import { useEffect } from 'react';
import kwesforms from 'kwesforms';

const CustomStorageForm = () => {
  useEffect(() => {
    kwesforms.init();
  }, []);

  return (
    <form
      className="kwes-form text-left max-w-lg text-lg mx-auto mt-12"
      action="https://kwesforms.com/api/foreign/forms/rJbS5DK02SKLzypcNzJ3"
    >
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
          <label htmlFor="email">Estimated amount of storage</label>
          <input
            id="size"
            name="size"
            type="text"
            placeholder="10,000"
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

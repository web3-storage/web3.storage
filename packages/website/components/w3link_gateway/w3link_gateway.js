import { useState } from 'react';

const W3linkForm = () => {
  const [cid, setCid] = useState('bafybeiedv7sowwxamly4oicivudp45rsfvbklnf3fvbvonxrwoxqylhtwq/0.json');
  // QmcMBwDT8wEjNaVgFpQjhZMKPEgHAwNHTErpZTvPzLdvvi
  const handleCIDLink = e => {
    e.preventDefault();
    window.open(`https://w3s.link/ipfs/${cid}`, '_blank');
  };

  return (
    <form className="w3link_gateway">
      <span className="w3link_gateway--preinput">https://w3s.link/ipfs/</span>
      <input
        type="text"
        name="cid"
        id="cid"
        onChange={e => setCid(e.target.value)}
        value={cid}
        className="truncate flex-1 min-w-0 block w-full px-3 py-3 rounded sm:rounded-none sm:rounded-r-md md:text-lg border-2 border-black text-black placeholder:text-gray-500 focus:ring-blue focus:border-blue"
        placeholder="cid..."
      />
      <button
        type="submit"
        onClick={e => handleCIDLink(e)}
        className="btn inline-flex items-center px-5 py-2 rounded-lg sm:ml-4 bg-orange text-white sm:text-sm md:text-lg font-semibold hover:bg-blue transition-colors"
      >
        GO
      </button>
    </form>
  );
};

export default W3linkForm;

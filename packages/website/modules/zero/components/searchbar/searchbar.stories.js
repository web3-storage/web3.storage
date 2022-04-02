import React from 'react';
import useState from 'storybook-addon-state';

import SearchBar from './searchbar';
import SearchIcon from '../../assets/search';

export default {
  title: 'Zero/SearchBar',
};

export const Default = () => {
  const [value, setValue] = useState('value', null);

  return (
    <>
      <SearchBar
        className="customBar"
        value="initial search"
        placeholder="Enter filter text"
        icon={<SearchIcon />}
        onChange={value => setValue(value)}
      />
      <br />
      <br />
      Search content: {value}
    </>
  );
};

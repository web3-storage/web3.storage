import React from 'react';

import Filterable from './filterable';
import SearchIcon from '../../assets/search';

export default {
  title: 'Zero/Filterable',
};

export const Default = () => (
  <Filterable
    className="customBar"
    value="initial search"
    placeholder="Enter filter text"
    icon={<SearchIcon />}
    onChange={value => console.log(value)}
  />
);

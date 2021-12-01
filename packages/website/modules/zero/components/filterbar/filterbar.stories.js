import React, { createElement, useCallback } from 'react'
import useState from 'storybook-addon-state';
import FilterBar from './filterbar';
import { ReactComponent as SearchIcon } from '../../assets/search.svg'

export default {
  title: 'Zero/Filterbar'
};

export const Default = () => (
  <FilterBar
    className="customBar"
    value="initial search"
    placeholder="Enter filter text"
    icon={<SearchIcon />}
    onChange={(value) => console.log(value)}
  />
);


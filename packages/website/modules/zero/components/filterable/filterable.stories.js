import React, { createElement, useCallback } from 'react'
import useState from 'storybook-addon-state';
import Filterable from './filterable';
import { ReactComponent as SearchIcon } from '../../assets/search.svg'

export default {
  title: 'Zero/Filterable'
};

export const Default = () => (
  <Filterable
    className="customBar"
    value="initial search"
    placeholder="Enter filter text"
    icon={<SearchIcon />}
    onChange={(value) => console.log(value)}
  />
);


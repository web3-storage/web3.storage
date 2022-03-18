/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react'
import Translate from '@docusaurus/Translate'
import Interpolate from '@docusaurus/Interpolate'

const ISSUE_URL = 'https://github.com/web3-storage/web3.storage/issues/new/choose'
const SUGGEST_CONTENT_URL = 'https://github.com/web3-storage/docs/issues/new?assignees=&labels=need%2Ftriage&template=content-or-feature-suggestion.md&title=%5BCONTENT+REQUEST%5D+%28add+your+title+here%21%29'

export default function EditThisPage ({ editUrl }) {
  const editThisPage = (
    <a href={editUrl} target='_blank' rel='noreferrer noopener'>
      <Translate
        id='theme.common.editThisPage'
        description='The link label to edit the current page'
      >
        Edit this page
      </Translate>
    </a>
  )
  const openAnIssue = (
    <a href={ISSUE_URL} target='_blank' rel='noreferrer noopener'>
      open an issue
    </a>
  )

  return (
    <>
      <Interpolate values={{ editThisPage, openAnIssue }}>
        {'{editThisPage} on GitHub or {openAnIssue} for it'}
      </Interpolate>
      <div>
        <a href={SUGGEST_CONTENT_URL} target='_blank' rel='noreferrer noopener'>
          Suggest new content
        </a>
      </div>
    </>
  )
}

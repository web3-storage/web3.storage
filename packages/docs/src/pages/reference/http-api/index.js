
import React from 'react'

import RedocPage from '../../../components/RedocPage'
import Layout from '@theme/Layout'


function HttpApi(props) {
  return (
    <Layout {...props} title="HTTP API | Web3.Storage" description="HTTP API Reference docs for Web3.Storage" >
      <RedocPage  />
    </Layout>
  )
}

export default HttpApi
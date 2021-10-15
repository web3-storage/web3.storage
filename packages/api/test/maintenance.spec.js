/* eslint-env mocha, browser */
import assert from 'assert'
import {
  withMode,
  READ_WRITE,
  READ_ONLY,
  NO_READ_OR_WRITE
} from '../src/maintenance.js'

describe('maintenance middleware', () => {
  it('should throw error when in maintenance for a READ_ONLY route', () => {
    const routeHandler = () => new Response()
    const handler = withMode(routeHandler, READ_ONLY)
    const block = (request, env) => {
      handler(request, env)
    }

    // READ WRITE MODE
    assert.doesNotThrow(() => block(() => {}, {
      MODE: READ_WRITE
    }))

    // READ ONLY MODE
    assert.doesNotThrow(() => block(() => {}, {
      MODE: READ_ONLY
    }))

    // NO READ OR WRITE MODE
    assert.throws(() => block(() => { }, {
      MODE: NO_READ_OR_WRITE
    }), /API undergoing maintenance/)
  })

  it('should throw error when in maintenance and READ_ONLY for a READ_WRITE route', () => {
    const routeHandler = () => new Response()
    const handler = withMode(routeHandler, READ_WRITE)
    const block = (request, env) => {
      handler(request, env)
    }

    // READ WRITE MODE
    assert.doesNotThrow(() => block(() => { }, {
      MODE: READ_WRITE
    }))

    // READ ONLY MODE
    assert.throws(() => block(() => { }, {
      MODE: READ_ONLY
    }), /API undergoing maintenance/)

    // NO READ OR WRITE MODE
    assert.throws(() => block(() => { }, {
      MODE: NO_READ_OR_WRITE
    }), /API undergoing maintenance/)
  })

  it('should throw for invalid maintenance mode', () => {
    const routeHandler = () => new Response()
    const handler = withMode(routeHandler, READ_WRITE)
    const block = (request, env) => {
      handler(request, env)
    }

    const invalidModes = ['', null, undefined, ['r', '-'], 'rwx']
    invalidModes.forEach((m) => {
      assert.throws(() => block(() => {}, {
        MODE: m
      }, /invalid maintenance mode/))
    })
  })

  it('should not allow invalid handler mode', () => {
    assert.throws(
      () => withMode(() => new Response(), NO_READ_OR_WRITE),
      /invalid mode/
    )
  })
})

/**
 * An email provider that does nothing.
 */
export default class DummyEmailProvider {
  async sendEmail (...args) {
    return Promise.resolve(`${Math.random()}`)
  }
}

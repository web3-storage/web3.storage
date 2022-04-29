/**
 * An email provider that does nothing.
 */
export default class DummyEmailProvider {
  async sendEmail () {
    return Promise.resolve(`${Math.random()}`)
  }
}

import Button, { ButtonVariant } from 'components/button/button';

/* eslint-disable react/no-unescaped-entities */
const styles = {
  lightText: {
    color: 'white',
  },
  mediumLineHeight: {
    lineHeight: '1.5em',
  },
  centeredContainer: /** @type {const} */ ({
    maxWidth: '24.6875rem',
    margin: '0 auto',
    zIndex: 0,
    padding: '1em',
  }),
  textMargin: {
    marginBottom: '1em',
  },
};

function TryW3up() {
  return (
    <div
      className="page-try-w3up"
      style={{ ...styles.centeredContainer, ...styles.lightText, ...styles.mediumLineHeight }}
    >
      <div>
        <header style={styles.textMargin}>
          <h1>Sign up for our new stuff instead.</h1>
        </header>
        <p style={styles.textMargin}>We're no longer accepting new signups here at old.web3.storage.</p>
        <p style={styles.textMargin}>
          We've launched a new web3.storage experience called w3up, and you should check it out.
        </p>
        <Button href="https://console.web3.storage" variant={ButtonVariant.OUTLINE_LIGHT}>
          Try w3up
        </Button>
      </div>
    </div>
  );
}

export default TryW3up;

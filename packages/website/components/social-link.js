/**
 * Social Link Component
 *
 * @param {Object} props
 * @param {URL} props.url
 * @param {any} [props.Icon]
 * @param {Record<string, any>} [props.params]
 * @returns {JSX.Element}
 */

const SocialLink = ({ url, Icon, params }) => {
  if (params) {
    Object.entries(params).map(([k, v]) => url.searchParams.append(k, v));
  }
  return (
    <a href={url.href} target="_blank" rel="noreferrer" aria-label="social media icon">
      <Icon className="text-current" />
    </a>
  );
};

export default SocialLink;

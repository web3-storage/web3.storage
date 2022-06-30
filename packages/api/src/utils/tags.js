/**
 * @param {import('@web3-storage/db/db-client-types').UserOutput} user
 * @param {string} tagName
 * @param {string} [defaultValue]
 * @returns {string|undefined}
 */
export function getTagValue (user, tagName, defaultValue) {
  return (
    user.tags?.find((tag) => tag.tag === tagName && !tag.deleted_at)?.value ||
    defaultValue
  )
}

/**
 * @param {Array<import('@web3-storage/db/db-client-types').UserTagInfo>} userTags
 * @param {string} tagName
 * @param {string} value
 * @returns {boolean}
 */
export function hasTag (userTags, tagName, value) {
  return Boolean(
    userTags?.find(
      (tag) => tag.tag === tagName && tag.value === value && !tag.deleted_at
    )
  )
}

export function hasPendingTagProposal (tagProposals, tagName) {
  return Boolean(
    tagProposals?.find(
      (proposal) =>
        proposal.tag === tagName &&
        !proposal.admin_decision_type &&
        !proposal.deleted_at
    )
  )
}

export function getTagValue (user, tagName, defaultValue) {
  return (
    user.tags?.find((tag) => tag.tag === tagName && !tag.deleted_at)?.value ||
    defaultValue
  )
}

export function hasTag (user, tagName, value) {
  return Boolean(
    user.tags?.find(
      (tag) => tag.tag === tagName && tag.value === value && !tag.deleted_at
    )
  )
}

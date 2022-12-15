export async function main() {
  console.error('generating did document');
  const didDocument = createDidDocument();
  console.log(JSON.stringify(didDocument, null, 2));
}

main();

function createDidDocument(env=process.env) {
  return {
    id: env.DID_DOCUMENT_ID,
    alsoKnownAs: env.DID_DOCUMENT_ALSO_KNOWN_AS,
  };
}

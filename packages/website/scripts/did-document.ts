export async function main() {
  console.error('generating did document');
  const didDocument = createDidDocument();
  console.log(JSON.stringify(didDocument, null, 2));
}

main();

function createDidDocument(env = process.env) {
  const id = env.DID_DOCUMENT_ID;
  const context: Array<string | Record<string, string>> = ['https://www.w3.org/ns/did/v1'];
  if (id) {
    context.push({
      '@base': id,
    });
  }
  return {
    '@context': context,
    id,
    alsoKnownAs: env.DID_DOCUMENT_PRIMARY_DID_KEY,
  };
}

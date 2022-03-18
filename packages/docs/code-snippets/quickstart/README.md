# Quickstart code snippets

This directory has some sample code that's included in the docs via [a `CodeSnippet` component](../../CONTRIBUTING.md#importing-code-snippets-from-files).

The `put-files.js` and `package-example.json` files are included in the Quickstart guide.

There's also a real `package.json` so you can `npm install` and test the scripts. Eventually it would be cool to actually write a smoke test that gets run in CI so we can make sure new versions of the client don't break the example. 

For now, you can `npm install` here and run `node put-files.js --token=<your-token> path-to-file` to test things manually.

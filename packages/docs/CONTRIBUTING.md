# Contributing

Thank you for your interest in contributing to Web3.Storage!

For help building and running the site locally, as well as previewing your work on Fleek, please visit our [Readme](README.md#for-site-developers). 

## Content Guidelines

The guidelines below can help you create content that's clear, compelling, and valuable to the reader.

### Types of content

Content on docs.web3.storage falls into four categories, all designed to help readers understand topics but each taking a slightly different approach to doing so:
- [Concept guides](#concept-guides)
- [Tutorials](#tutorials)
- [How-tos](#how-tos)
- [Reference materials](#reference-materials)

#### Concept guides

**Concept guides** are written with the intent to inform and explain something. Unlike tutorials or how-tos, they don't contain any steps or actions that the reader has to perform _right now_ in order to succeed.

Because concept guides often deal with challenging topics, including diagrams or other visualizations can make them significantly more helpful for the reader. When writing a concept guide, please use the following basic structure for consistency with other concept guides:

1. Introduction to the concept you're about to explain.
2. What the concept is.
3. Why it's essential.
4. What other concepts it relates to, including tutorials or how-tos if appropriate.
5. A summary review.

#### Tutorials

When writing a **tutorial**, you're teaching a reader how to achieve a complex goal. Because of this, the best tutorials are a mix of a concept guide and one or more how-tos. They may need to be structured into several pages or sections to make them more easily digestible to the reader.

When designing a tutorial, keep in mind any other concept guides and how-tos that already exist; leveraging them can make your writing task easier, as well as provide a more consistent experience for readers.

#### How-tos

A **how-to** does what it says: It explains to the reader _how_ to do something. It doesn't need to explain a concept or convince the reader of something; it's simply a set of instructions the reader must follow to achieve a process or function.

How-tos are short (aim for 2-10 minutes reading time), process-oriented, and teach the reader by doing — they present the reader with concrete steps on where to go, what to type, and things they should click on. Use numbered lists and other hierarchical organization when possible to help establish sequence, and remember that screenshots and code examples go a long way to clearly convey actions to the reader.

Because how-tos are so goal-oriented, they are often the content used most frequently by novices. Keep this in mind, and create as simple of content as possible; you can always point the reader to more complex material that they can explore if they wish.

When writing a how-to, please use the following basic structure:

1. What we're about to do.
2. The steps we need to do.
3. Summary of what we just did plus potential next steps.

#### Reference materials

Think of **reference materials** like you would a dictionary or encyclopedia: Resources to quickly help you find your way or solve a problem, but not items you might read end-to-end.

Reference materials are often in list, tabular, or a similar form, so think carefully about how the reader might scan or search for information, and prioritize accordingly. Having a clear hierarchy of information can make a complex reference guide like metatdata documentation significantly easier to visually scan and use.

### Grammar, formatting, and style

Below is a summary of grammatical and style guidance for creating content for Web3.Storage docs. Adhering to the guidelines below helps make content on the site consistent, professional, and easy to uderstand and use.

#### Grammar and spelling

##### American English

For the sake of consistency, Web3.Storage documentation uses American English spelling. Some basic rules for converting other styles of English into American English:

1. Swap the `s` for a `z` in words like _categorize_ and _pluralize_.
2. Remove the `u` from words like _color_ and _honor_.
3. Swap `tre` for `ter` in words like _center_.

##### The Oxford comma
Follow each list of three or more items with a comma `,`:

| Use                           | Do not use                    |
| ----------------------------- | ---------------------------- |
| One, two, three, and four.    | One, two, three and four.    |
| Henry, Elizabeth, and George. | Henry, Elizabeth and George. |

##### Acronyms

If you have to use an acronym, spell the full phrase first and include the acronym in parentheses `()` the first time it is used in a document. Exception: This generally isn't necessary for commonly encountered acronyms like _NFT_.

> virtual vachine (VM), decentralized web (DWeb).

#### Formatting

Web3.Storage follows the _GitHub Flavored Markdown_ syntax. This way, readers have the option to view articles on either the main Web3.Storage docs site or [its GitHub repo](https://github.com/web3-storage/docs).

We use the rules set out in the [VSCode Markdownlint](https://github.com/DavidAnson/vscode-markdownlint) extension. You can import these rules into any text editor like Vim or Sublime. All rules are listed [within the Markdownlint repository](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md).

##### Relative links

If you include internal (relative) links to other content on the Web3.Storage docs site, please link to them using full relative paths (e.g. use `../` for climbing a directory) and specifying the file's full name (e.g. `awesome-tutorial.md#subheading`). This ensures that users who read Web3.Storage docs content directly in-repo on GitHub's web UI are able to follow relative links correctly.

#### Text style

In addition to the [rules](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md) found within the [Markdownlinter extension](https://github.com/DavidAnson/vscode-markdownlint), our Web3.Storage docs also observe the following style guidelines.

##### Titles

All titles follow sentence structure. Only _names_ and _places_ are capitalized, along with the first letter of the title. All other letters are lowercase:

   ```markdown
   ## This is a title

   ### Only capitalize names and places

   #### The capital city of France is Paris
   ```

Every article starts with a _frontmatter_ title and description:

   ```markdown
   ---
   title: Example article
   description: This is a brief description that shows up in link teasers in services like Twitter and Slack.
   ---

   ## This is a subtitle

   Example body text.
   ```

   In the above example, `title:` serves as a `<h1>` or `#` tag. There is only ever one title of this level in each article.

Titles do not contain punctuation. If you have a question within your title, rephrase it as a statement:

   ```markdown
   <!-- This title is wrong. -->

   ## What is IPFS?

   <!-- This title is better. -->

   ## IPFS explained
   ```

##### Bold text

Use bold text when the reader must interact with something displayed as text: buttons, hyperlinks, images with text in them, window names, and icons.

```markdown
In the **Login** window, enter your email into the **Username** field and click **Sign in**.
```

##### Italics

Style the names of things in italics, except input fields or buttons:

```markdown
Here are some American things:

- The _Spirit of St Louis_.
- The _White House_.
- The United States _Declaration of Independence_.

Try entering them into the **American** field and clicking **Accept**.
```

Quotes or sections of quoted text are styled in italics and surrounded by double quotes `"`:

```markdown
In the wise words of Winnie the Pooh, _"People say nothing is impossible, but I do nothing every day."_
```

##### Code blocks

Tag code blocks with the syntax of the core they are presenting:

````markdown
    ```javascript
    console.log(error);
    ```
````


##### Importing code snippets from files

This project includes a `<CodeSnippet>` component that supports extracting named regions from a source file, so that you can optionally display just a small part of a larger file.

To use it, you need to add a bit of javascript to your Markdown file to import the component and the contents of the file to display:

```js
import CodeSnippet from '@theme/CodeSnippet'
import MyCodeSnippet from '!!raw-loader!./code-snippets/example.js'
```

The first line imports the `CodeSnippet` component. You'll only need to do this once, even if you're importing multiple files.

The second line imports a file from `./code-snippets/example.js`, relative to the root directory of the repository. The `!!raw-loader!` prefix is important; it makes sure the source code is imported as text and not interpreted as JavaScript code. 

Once you've imported the component and source file you want to show, use a `<CodeSnippet />` tag to display the snippet:

```js
<CodeSnippet src={MyCodeSnippet} lang='javascript' />
```

To only show a portion of the file, add [VSCode `#region` comments](https://marketplace.visualstudio.com/items?itemName=maptz.regionfolder) to your source file around the region you want to include, and use the `region` prop in your `<CodeSnippet />` tag:

`code-snippets/example.js`:

```js
function example() {
  // ... stuff we don't care about ...

  // #region interestingBit
  foo().then(bar)
  // #endregion interestingBit

  // ... more boring stuff ...
}
```

With the above example, we can show just the stuff between the `interestingBit` markers like so:

```jsx
import Example from '!!raw-loader!./code-snippets/example.js'
<CodeSnippet src={Example} lang='javascript' region='interestingBit' />
```

And your doc will render:

```js
  foo().then(bar)
```

##### Command-line examples

Write command-line inputs without any other characters. Precede outputs from the command line with a greater-than sign `>`. Include an empty line between the input and output of a command-line example:

````markdown
    ```bash
    ping ipfs.io

    > PING ipfs.io (209.94.90.1): 56 data bytes
    > 64 bytes from 209.94.90.1: icmp_seq=0 ttl=53 time=15.830 ms
    > 64 bytes from 209.94.90.1: icmp_seq=1 ttl=53 time=19.779 ms
    > 64 bytes from 209.94.90.1: icmp_seq=2 ttl=53 time=20.778 ms
    > 64 bytes from 209.94.90.1: icmp_seq=3 ttl=53 time=20.578 ms
    > --- ipfs.io ping statistics ---
    > 4 packets transmitted, 4 packets received, 0.0% packet loss
    ```
````

Command-line examples can be truncated with three periods `...` to remove extraneous information:

````markdown
    ```bash
    ping ipfs.io

    > PING ipfs.io (209.94.90.1): 56 data bytes
    > 64 bytes from 209.94.90.1: icmp_seq=0 ttl=53 time=15.830 ms
    > ...
    > 4 packets transmitted, 4 packets received, 0.0% packet loss
    ```
````

##### Inline code tags
Surround directories, file names, and version numbers between inline code tags `` ` ``.

```markdown
Version `1.2.0` of the program is stored in `~/code/examples`. Open `exporter.exe` to run the program.
```

##### Lists

All list items follow sentence structure. Only _names_ and _places_ are capitalized, along with the first letter of the list item. All other letters are lowercase:

1. Never leave Nottingham without a sandwich.
2. Brian May played guitar for Queen.
3. Oranges.

List items end with a period `.`, or a colon `:` if the list item has a sub-list:

1. Charles Dickens novels:
   1. Oliver Twist.
   2. Nicholas Nickelby.
   3. David Copperfield.
2. J.R.R Tolkien non-fiction books:
   1. The Hobbit.
   2. Silmarillion.
   3. Letters from Father Christmas.


##### Special characters

Whenever possible, spell out the name of a special character, followed by an example of the character itself within a code block.

```markdown
Use the dollar sign `$` to enter debug-mode.
```

##### Keyboard shortcuts

When instructing the reader to use a keyboard shortcut, surround individual keys in code tags:

```bash
Press `ctrl` + `c` to copy the highlighted text.
```

The plus symbol `+` stays outside the code tags.

#### Image guidelines

##### Alt text

All images contain alt text so that screen-reading programs can describe the image to users with limited sight:

```markdown
![Screenshot of an image being uploaded through the IPFS desktop application.](images/ipfs-desktop-image-upload-screen.png)
```

##### Storage location

Store images in a folder called `images` within the same directory as the article in which the image is presented. If there are several articles within the same directory, create a new folder within `images` for each article. For example, the article `upload-a-photo.md` contains the following line:

```markdown
![Screenshot of an image being uploaded through the IPFS desktop application.](images/upload-a-photo/ipfs-desktop-image-upload-screen.png)
```

The directory structure of this article looks like this:

```
ipfs-desktop/
├── download-the-config.md
├── images
│   └── upload-a-photo
│       └── ipfs-desktop-image-upload-screen.png
└── upload-a-photo.md
```

There are no images within the `download-the-config.md` article, so there is no folder within the `images` directory for that article.

##### File names

All file names are lowercase with dashes `-` between words, including image files:

```
ipfs-desktop/
├── add-a-user.md
├── enable-debug-mode.md
├── images
│  ├── additional-information-screen.png
│  ├── dark-mode-enabled.png
│  └── user-profile-image.png
├── log-into-the-application.md
└── upload-a-photo.md
```

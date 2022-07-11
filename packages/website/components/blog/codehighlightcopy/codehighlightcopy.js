import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import shell from 'highlight.js/lib/languages/shell';
import go from 'highlight.js/lib/languages/go';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('go', go);
hljs.registerLanguage('json', json);

export default function CodeHighlightCopy(el) {
  hljs.highlightAll();

  async function copyCode(event) {
    const button = event.srcElement;
    const pre = button.parentElement;
    let code = pre.querySelector('code');
    let text = code.innerText;
    await navigator.clipboard.writeText(text);

    console.log(button);
    button.querySelector('.cp-copy-message').innerText = 'Copied!';
    setTimeout(() => {
      button.querySelector('.cp-copy-message').innerText = '';
    }, 1000);
  }

  let blocks = document.querySelectorAll(el);
  blocks.forEach(block => {
    // only add a button if browser supports Clipboard API
    if (navigator.clipboard) {
      let copyDiv = document.createElement('div');
      copyDiv.className = 'cp-copy-icon';
      const html =
        '<div class="cp-copy-message"></div><svg xmlns="http://www.w3.org/2000/svg" width="11.712" height="13.881"><path data-name="Path 19084" d="M7.682.126 7.552 0h-3a1.518 1.518 0 0 0-1.516 1.518V2.6H1.518A1.518 1.518 0 0 0 0 4.121v8.242a1.518 1.518 0 0 0 1.518 1.518h5.639a1.518 1.518 0 0 0 1.518-1.518v-1.085h1.518a1.518 1.518 0 0 0 1.519-1.518v-5.6l-.126-.13Zm.126 1.353L10.233 3.9H8.459a.651.651 0 0 1-.651-.651Zm0 9.8v1.084a.651.651 0 0 1-.651.651H1.518a.651.651 0 0 1-.651-.651V4.121a.651.651 0 0 1 .651-.651H3.9v2.386a1.518 1.518 0 0 0 1.522 1.518h2.386ZM4.772 5.856V4.082L7.2 6.507H5.422a.651.651 0 0 1-.65-.651Zm6.073 3.9a.651.651 0 0 1-.651.651H8.676V6.763l-.126-.13-3.9-3.9-.134-.133H3.9V1.518a.651.651 0 0 1 .655-.65h2.386v2.385a1.518 1.518 0 0 0 1.518 1.518h2.386Z" fill="white" /></svg>';
      copyDiv.innerHTML = html;
      copyDiv.addEventListener('click', copyCode);
      block.appendChild(copyDiv);
    }
  });
}

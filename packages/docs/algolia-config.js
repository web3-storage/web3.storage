{
  "index_name": "web3storage-docs",
  "start_urls": [
    "https://web3.storage/docs"
  ],
  "stop_urls": [],
  "selectors": {
    "lvl0": {
      "selector": "p.sidebar-heading.open",
      "global": true,
      "default_value": "Documentation"
    },
    "lvl1": ".theme-default-content h1",
    "lvl2": ".theme-default-content h2",
    "lvl3": ".theme-default-content h3",
    "lvl4": ".theme-default-content h4",
    "lvl5": ".theme-default-content h5",
    "text": ".theme-default-content p, .theme-default-content li",
    "lang": {
      "selector": "/html/@lang",
      "type": "xpath",
      "global": true,
      "default_value": "en-US"
    }
  },
  "selectors_exclude": [
    ".table-of-contents"
  ],
  "strip_chars": " .,;:#",
  "custom_settings": {
    "attributesForFaceting": [
      "lang"
    ]
  }
}

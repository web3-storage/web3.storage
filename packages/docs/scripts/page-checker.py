import sys
import re
import requests
import os
import json
import http.client
from bs4 import BeautifulSoup

markdownToTest = sys.argv[1]
langToolsUsername = sys.argv[2]
langToolsApiKey = sys.argv[3]

htmlToTest = markdownToTest.replace("docs/","build/").replace("_index.md","index.html").replace("index.md","index.html").replace(".md","/index.html")

with open(htmlToTest, 'r') as content_file:
    content = content_file.read()
soup = BeautifulSoup(content, 'html.parser')
for codeBlock in soup.find_all("pre"):
    codeBlock.decompose()
for heading in soup.find_all("h1"):
    heading.decompose()
for heading in soup.find_all("h2"):
    heading.decompose()
for heading in soup.find_all("h3"):
    heading.decompose()
for heading in soup.find_all("h4"):
    heading.decompose()
for heading in soup.find_all("h5"):
    heading.decompose()
for heading in soup.find_all("h6"):
    heading.decompose()
foundDiv = soup.find_all('div', attrs={'class': 'theme-default-content'}, limit=1)
pageText = foundDiv[0].get_text()

strippedText = pageText.strip().encode('utf-8')

# check links

outputHeader = '### `' + markdownToTest + '`:'
outputText = ""
links = soup.find_all('a')
checkedLinks = ''
for link in links:
    linkUrl = link['href'].split('#')[0]
    if ("http" in linkUrl and
    "docs.web3.storage" not in linkUrl and
    "https://github.com/web3-storage/docs" not in linkUrl and
    (linkUrl + "|") not in checkedLinks):
        #print(linkUrl)
        checkedLinks += linkUrl + "|"
        try:
            r = requests.head(linkUrl)
            if (r.status_code != 200):
                outputText += "- The following link returned HTTP status code " + str(r.status_code) + " (" + http.client.responses[r.status_code] + "):\n"
                outputText += "  " + linkUrl + "\n"
        except requests.ConnectionError:
            outputText += "- The following link failed to connect:" + "\n"
            outputText += "  " + linkUrl + "\n"

URL = "https://api.languagetoolplus.com/v2/check"

disable_rules = [
    "PUNCTUATION_PARAGRAPH_END", "WHITESPACE_RULE", "WORD_CONTAINS_UNDERSCORE",
    "UPPERCASE_SENTENCE_START", "MISSING_COMMA_AFTER_YEAR",
    "ENGLISH_WORD_REPEAT_BEGINNING_RULE", "ENGLISH_WORD_REPEAT_RULE",
    "COMMA_PARENTHESIS_WHITESPACE", "MORFOLOGIK_RULE_EN_US", "SINGLE_CHARACTER",
    "SENTENCE_WHITESPACE", "DATE_NEW_YEAR", "COMMA_COMPOUND_SENTENCE", "EN_QUOTES"
]
data = {'text':strippedText,
        'enabledOnly': False,
        'language':'en-US',
        'username':langToolsUsername,
        'disabledRules': ",".join(disable_rules),
        'apiKey':langToolsApiKey}

resp = requests.post(url = URL, data = data)
data = resp.json()
for match in data['matches']:
    outputText += "- " + match['message'] + "<!--CategoryID:"+ match['rule']['category']['id'] +", RuleID: "+ match['rule']['id'] +"-->\n"
    outputText += "  ```" + "\n"
    if (len(match['context']['text']) > 82):
        outputText += "  " + match['context']['text'][:79] + "...\n"
    else:
        outputText += "  " + match['context']['text'] + "\n"
    contextString = ''
    for i in range(match['context']['offset']):
        contextString += ' '
    for i in range(match['context']['length']):
        contextString += '^'
    outputText += "  " + contextString + "\n"
    outputText += "  ```" + "\n"

if (len(outputText) > 0):
    print(outputHeader)
    print(outputText)
else:
    print('- Check of `'+ markdownToTest +'` came back clean!')

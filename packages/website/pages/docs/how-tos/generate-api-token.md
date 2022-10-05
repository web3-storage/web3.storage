---
title: How to generate an API token
description: Learn how to get an API token for using web3.storage programmatically in this quick how-to guide.
---

import Callout from 'components/callout/callout';
import Img from 'components/cloudflareImage';
import ImgNoToken from '../../../public/images/docs/account-page-no-tokens.png';
import ImgNameToken from '../../../public/images/docs/account-page-name-token.png';
import ImgToken from '../../../public/images/docs/tokens-page.png';
import ImgAccountMenu from '../../../public/images/docs/account-menu-create-token-desktop.png';
import ImgAccountMenuMobile from '../../../public/images/docs/account-menu-create-token-mobile.png';

# How to generate an API token

In this how-to guide, **you'll learn how to generate a web3.storage API token** so that you can interact with the service programmatically through the [JavaScript client library](/docs/reference/js-client-library) or using the command line.

You'll need a free web3.storage account in order to generate an API token. If you already have an account, read on. If not, have a look at the [quickstart guide](/docs/intro#quickstart) to get up and running in just a few minutes.

## Create a new token

1. From the web3.storage navigation menu, open the **Account** menu by hovering over the **Account** menu item.

<Img src={ImgAccountMenu} alt="Screenshot of the Account menu, with 'Create API Token' highlighted" />

On a mobile device, open the menu by tapping the icon in the top-right corner, then tap on **Account** to expand the **Account** menu.

<Img src={ImgAccountMenuMobile} alt="Screenshot of the Account menu on a mobile device" />

2. In the **Account** menu, click **Create an API token**. (If you've never created an API token on web3.storage before, you'll also see an invitation to do this from the **Getting started** section of your account page.)

<Img src={ImgNoToken} alt="Screenshot of a web3.storage account page" />

3. Give your new API token a descriptive name that will be easy for you to remember later.

<Img src={ImgNameToken} alt="Screenshot of a web3.storage page for naming a new API token" />

<Callout type="info">
##### Tip
You don't have to use the same API token for all of your projects! Creating an individual API token for each of your applications or services makes it easier to change or revoke access in the future to a specific project. You can have as many tokens as you need on web3.storage for free.
</Callout>

4. Click **Create**. You'll then be taken to your [API Tokens](https://web3.storage/tokens) page, where you can manage all of your web3.storage API tokens.

<Img src={ImgToken} alt="Screenshot of a web3.storage page showing a user's API tokens" />

5. Make a note of the **Token** field somewhere secure where you know you won't lose it. You can click **Copy** to copy your new API token to your clipboard.

<Callout type="warning">
##### Keep your API token private
Do not share your API token with anyone else. This key is specific to your account.
</Callout>

## Delete a token

If you no longer need a particular web3.storage API token — for example, you've sunsetted a project using a particular token — you may wish to delete it for security reasons. To do so, simply visit your [API Tokens](https://web3.storage/tokens) page and click **Delete** to remove it.

<Callout type="warning">
##### Deleting a token is permanent
Remember that if you delete an API token, it's removed permanently and cannot be restored. Delete a token only if you're sure you won't need it again.
</Callout>

## Next steps

Now that you have an API token, you can store and retrieve data from your apps and services, as well as from the command line. If you haven't yet explored in depth how to store data using web3.storage, check out the [storage how-to guide](/docs/how-tos/store) for a deep dive on how to upload files using the [JavaScript client library](/docs/reference/js-client-library).

To learn in greater detail how to fetch your data using the web3.storage client, or directly from IPFS using a gateway or the IPFS command line, see the [how-to guide on retrieval](/docs/how-tos/retrieve).

You can also use the JavaScript client library to get more information about the status of your data. See the [query how-to guide](/docs/how-tos/query) to learn how to get more details about your data, including the status of any Filecoin storage deals.

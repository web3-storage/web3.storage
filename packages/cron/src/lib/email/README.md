Email
=====

This folder contains an `EmailService` for sending emails to users.
It has a dependency on the `@web3-storage/db` package for storing records of sent emails in the DB,
and it is aware of the concept of a "user", but it is designed to be generic enough that it can
be used for other parts of the web3.storage site if necessary; it's not specific to the 'cron'
package.

The service is designed such that all other parts of the application can be agnostic to which email
provider we're using to do the actual sending, and we could in theory switch email provider in
future without affecting any other parts of the application. Hence the workings of the
"email provider" are kept separate to the `EmailService`. For now we're using Mailchimp/Mandrill.

The code is aware of the different "email types" which we send, in order that it can validate they
are being sent with the correct variables and so that it can track their sending.


Adding new email types
----------------------

To add a new email:
* Create a new subclass of `EmailType` in `types.js` to provide the necessary subject and any variable formatting.
* Add the new email type to `EMAIL_TYPE` in `packages/db/constants.js`. It name should match that of the class in `types.js`.
* Add the new template using the instructions below.


Adding or editing templates
---------------------------

Creating a new template, or editing an existing one, is a slightly involved process.
Mailchimp provides a visual template editor, which is good insofar as it saves you the pain of having to write your own HTML emails from scratch,
but the templates that you create in Mailchimp can't be used directly for transactional emails because
(1) they need to be exported to Mandrill first, and
(2) they need some manual adaptations and fixes in order to fully work.

To add or edit a template:

* If you're editing an existing template and you want to keep the same template ID (so that you don't have to update it in the code), then you'll need to first delete the existing template from Mandrill so that its ID isn't already taken. But note that doing so will cause any attempts to send that email to break until you replace the template.
* Go to the [templates page in Mailchimp](https://us5.admin.mailchimp.com/templates/) and create/edit your template.
* Export the template from Mailchimp to Mandrill using the "Send to Mandrill" option.
* Go to the [templates page in Mandrill](https://mandrillapp.com/templates)
* Click on the template to edit the HTML, and make the following changes/fixes:
  - Add `background: linear-gradient` to `#bodyTable` (see below), the Mailchimp editor restricts you to a hex code only.
  - Edit the `#bodyCell` style from `padding: 30px` to `padding:30px` (this doesn't seem to be editable in the Mailchimp editor).
  - Swap the Mailchimp placeholders such as `*|SUBJECT|*` and `<!--*|IF:MC_PREVIEW_TEXT|*-->` for their Handlebars equivalents, e.g. `{{SUBJECT}}` or `{{#if MC_PREVIEW_TEXT}}`. Mailchimp doesn't support Handlebars, but Mandrill does, and Handlebars supports logic (if/else/for/etc), which the Mailchimp tags don't; so we have to convert.
  - If the template uses any `{{#each users}}...{{/each}}` tags then you'll need to fix their placement so that they're actually wrapping the HTML fragment which we want to repeat. Mailchimp moves these tags when you save the template, which breaks them.
  - If you're editing the `AdminStorageExceeded` email, add `id="usersQuotaTable"` to the `<table>` containing the list of users, and then add the CSS below into the `<style>` section somewhere.
* If you're adding a new template, or if you didn't delete the old template first, then get the new template ID/slug from the URL and add/update it in the `MailchimpEmailProvider.templates` object.
* Ensure that any variables which you've used or changed in the template are correctly specified in the corresponding `EmailType` subclass.

```css
body,#bodyTable{
  background: linear-gradient(to top left, #d169db, rgba(199, 166, 251, 0), #5da9e7), linear-gradient(to top right, #5a69da, rgba(199, 166, 251, 0), #d4a8e7) rgba(199, 166, 251, 1);
}
```

For the `AdminStorageExceeded` email:
```css
#usersQuotaTable {
  border-spacing: 5px;
  border-collapse: separate;
  border-color: transparent;
}
```

### A note about CSS

It would be nice to be able to use the `background-clip: text` style to get the colour gradient text
which is used on the web3.storage site.
But unfortunately, Chrome currently (April 2022) supports the `-webkit-` prefixed version of
`background-clip: text`, and [Gmail only allows](https://developers.google.com/gmail/design/reference/supported_css)
the unprefixed version. So between the two we can't (yet) support it.

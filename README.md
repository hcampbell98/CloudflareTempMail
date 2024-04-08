# Cloudflare Temporary Email Service

![Page Demo](https://i.hcampbell.dev/yz55oj8lfw.png)

This project utilises Cloudflare's workers and KV storage to provide a temporary email service. For most use-cases, this should be able to operate within the free tier allowance.

All emails received are stored in a KV storage object and are publicly accessible if the email address is known.

# Demo

A live version of this project can be found at https://temp-email.hcampbell.workers.dev/

# Installation

Configure the environment variables within the `wrangler.toml` file before installing.

-   `FORWARD_EMAIL` - Email address to route all mail to
-   `EMAIL_DOMAIN` - Domain you're using
-   `EMAIL_TIMEOUT` - # of seconds to store emails (Default 1 Day)

Create a KV namespace using `wrangler kv:namespace create Inboxes` and copy the output into the `wrangler.toml` file. Update `<YOUR_BINDING>` to `INBOXES`.

Run `npx install` to initialise the project and then `npx wrangler deploy` to publish the worker.

Set up Email Routing in the Cloudflare dashboard, setting a catch-all rule to send all mail to your newly created worker.

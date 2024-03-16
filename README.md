# Cloudflare Temporary Email Service

This project utilises Cloudflare's workers and KV storage to provide a temporary email service. For most use-cases, this should be able to operate within the free tier allowance.

All emails received are stored in a KV storage object and are publicly accessible if the email address is known.

# Installation

Configure the environment variables within the `wrangler.toml` file before installing.

-   `FORWARD_EMAIL` - Email address to route all mail to
-   `EMAIL_DOMAIN` - Domain you're using
-   `EMAIL_TIMEOUT` - # of seconds to store emails (Default 1 Day)

You will also have to create a KV storage object in the Cloudflare dashboard before continuing. Update the `kv_namespaces` property with your KV object name and ID.

Run `npx install` to initialise the project and then `npx wrangler deploy` to publish the service.

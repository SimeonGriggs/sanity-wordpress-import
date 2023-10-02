# Sanity Studio with WordPress Import CLI Scripts

An example set of CLI scripts to import tags, categories, users and posts from WordPress into a Sanity Studio.

This is a companion piece to the "Scripting content migrations into Sanity" training module.

The scripts here demonstrate:

1. Writing a CLI script
2. Programatically creating references between documents
3. Creating documents using transactions to reduce API usage
4. Uploading assets in a queue to avoid rate limits
5. Committing transactions in batches to avoid max size limits
6. Converting HTML to Block Content

To test:

1. Configure this Studio's `sanity.config.ts` with your own Project ID and Dataset
2. Update the settings of `./scripts/lib/constants` to use your WordPress' REST API URL
3. Execute the script with:

```sh
npx sanity@latest exec scripts/importWordPress-04.ts --with-user-token
```

import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// For debugging the script's imports
async function resetImport() {
  console.log(`Deleting imported documents`)
  await client
    .delete({
      query: `*[_type in ["author", "category", "post", "tag", "sanity.imageAsset"]]`,
    })
    .then(console.log)
    .catch(console.error)
}

resetImport()

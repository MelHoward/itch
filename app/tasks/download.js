
let Transition = require('./errors').Transition

let log = require('../util/log')('tasks/download')
let butler = require('../util/butler')
let noop = require('../util/noop')

let CaveStore = require('../stores/cave-store')
let CredentialsStore = require('../stores/credentials-store')

function ensure (predicate, reason) {
  if (!predicate) {
    throw new Transition({
      to: 'find-upload',
      reason
    })
  }
}

async function start (opts) {
  let id = opts.id
  let onprogress = opts.onprogress || noop
  let logger = opts.logger
  let emitter = opts.emitter

  let cave = await CaveStore.find(id)

  ensure(cave.upload_id, 'need upload id')
  ensure(cave.uploads, 'need cached uploads')

  let upload = cave.uploads[cave.upload_id]
  ensure(upload, 'need upload in upload cache')

  // Get download URL
  let client = CredentialsStore.get_current_user()
  let url

  try {
    if (cave.key) {
      url = (await client.download_upload_with_key(cave.key.id, cave.upload_id)).url
    } else {
      url = (await client.download_upload(cave.upload_id)).url
    }
  } catch (e) {
    if (e.errors && e.errors[0] === 'invalid upload') {
      await new Promise((resolve, reject) => setTimeout(resolve, 1500))
      throw new Transition({
        to: 'find-upload',
        reason: 'upload-gone'
      })
    }
    throw e
  }

  let parsed = require('url').parse(url)
  log(opts, `downloading from ${parsed.hostname}`)

  let dest = CaveStore.archive_path(cave.install_location, upload)

  emitter.on('cancelled', async (e) => {
    log(opts, `killed the butler with a wrench in the living room`)
    log(opts, `wiping ${dest}`)
    await butler.wipe(dest)
  })

  await butler.dl({ url, dest, onprogress, logger, emitter })
}

module.exports = { start }

import { accessComponents } from './access'
import { memeComponents } from './meme'
import { otherComponents } from './other'
import { protectComponents } from './protect'
import { serverComponents } from './server'
import { statComponents } from './stat'

export const components = async () => {
  const results = await Promise.all([
    serverComponents(),
    memeComponents(),
    accessComponents(),
    protectComponents(),
    statComponents(),
    otherComponents()
  ])

  return results.flat()
}

export {
  accessComponents,
  memeComponents,
  otherComponents,
  protectComponents,
  serverComponents,
  statComponents
}

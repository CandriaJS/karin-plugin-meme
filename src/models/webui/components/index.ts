import { accessComponents } from './access'
import { memeComponents } from './meme'
import { otherComponents } from './other'
import { protectComponents } from './protect'
import { serverComponents } from './server'
import { statComponents } from './stat'

export const components = async () => [
  ...serverComponents(),
  ...memeComponents(),
  ...(await accessComponents()),
  ...(await protectComponents()),
  ...statComponents(),
  ...otherComponents()
]

export {
  accessComponents,
  memeComponents,
  otherComponents,
  protectComponents,
  serverComponents,
  statComponents
}

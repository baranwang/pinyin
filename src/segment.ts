import { execFile } from 'child_process'
import * as path from 'path'

export function segmentFunc(text: string): Promise<string[]> {
  const { platform, arch } = process
  let binName = 'gse-cmd-'
  switch (platform) {
    case 'darwin':
      binName += 'darwin-'
      break;
    case 'win32':
      binName += 'win32-'
      break
    case 'linux':
      binName += 'linux-'
      break
    default:
      return Promise.reject(new Error('Unsupported platform'))
  }

  switch (arch) {
    case 'x32':
    case 'ia32':
    case 'arm':
      binName += 'x32'
      break
    case 'x64':
      binName += 'x64'
      break;
    case 'arm64':
      binName += 'arm64'
      break
    default:
      return Promise.reject(new Error('Unsupported arch'))
  }

  if (platform === 'win32') {
    binName += '.exe'
  }

  const bin = path.resolve(__filename, '..', '..', 'bin', binName)
  return new Promise((resolve, reject) => {
    const delimiter = 'a3d4a2ca-2f6a-4217-b31b-80739ea48e98'
    execFile(bin, ['--delimiter', delimiter, text], (err, stdout, stderr) => {
      if (err) {
        return reject(err)
      }
      return resolve(stdout.split(delimiter))
    })
  })
}
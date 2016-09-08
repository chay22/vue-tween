const root = typeof window !== 'undefined' ? window : global
const vendor = ['ms', 'moz', 'webkit', 'o']
let requestAnimationFrame
let cancelAnimationFrame
let lastTime = 0

if (!('performance' in root)) {
  root.performance = {}
}

if (!Date.now) {
  Date.now = () => (new Date()).getTime()
}

if (!('now' in root.performance)) {
  let nowOffset = Date.now()

  if (
    root.performance.timing &&
    root.performance.timing.navigationStart
  ) {
    nowOffset = root.performance.timing.navigationStart
  }

  root.performance.now = () => Date.now() - nowOffset
}

for (let i = 0; i < vendor.length && !root.requestAnimationFrame; ++i) {
    root.requestAnimationFrame = root[`${vendor[i]}RequestAnimationFrame`]
    root.cancelAnimationFrame = root[`${vendor[i]}CancelAnimationFrame`] ||
        root[`${vendor[i]}CancelRequestAnimationFrame`]
}

if (!root.requestAnimationFrame) {
  root.requestAnimationFrame = (callback) => {
      const currTime = Date.now()
      const timeToCall = Math.max(0, 16 - (currTime - lastTime))
      const id = setTimeout(function () {
          callback(currTime + timeToCall)
      }, timeToCall)

      lastTime = currTime + timeToCall
      return id
  }
}

if (!root.cancelAnimationFrame) {
  root.cancelAnimationFrame = (id) => clearTimeout(id)
}

export { root as default }

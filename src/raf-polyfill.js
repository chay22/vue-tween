const root = window || {}
const vendor = ['ms', 'moz', 'webkit', 'o']
const perf = root.performance || {}
let raf = root.requestAnimationFrame
let caf = root.cancelAnimationFrame ||
    root.cancelRequestAnimationFrame
let lastTime = 0

if (!Date.now) {
  Date.now = () => (new Date()).getTime()
}

if (!perf.now) {
  let nowOffset = Date.now()

  if (
    perf.timing &&
    !!perf.timing.navigationStart
  ) {
    nowOffset = perf.timing.navigationStart
  }

  perf.now = () => Date.now() - nowOffset
}

for (let i = 0; i < vendor.length && !raf; ++i) {
  raf = root[`${vendor[i]}RequestAnimationFrame`]
  caf = root[`${vendor[i]}CancelAnimationFrame`] ||
      root[`${vendor[i]}CancelRequestAnimationFrame`]
}

if (!raf) {
  raf = (callback) => {
    const currTime = Date.now()
    const timeToCall = Math.max(0, 16 - (currTime - lastTime))
    const id = setTimeout(() => {
      callback(currTime + timeToCall)
    }, timeToCall)

    lastTime = currTime + timeToCall
    return id
  }
}

if (!caf) {
  caf = (id) => clearTimeout(id)
}

export default (function () {
  root.performance = perf
  root.requestAnimationFrame = raf
  root.cancelAnimationFrame = caf
})()

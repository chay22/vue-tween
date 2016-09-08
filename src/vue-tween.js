import Tweezer from 'tweezer.js'

/**
 * Default data for tweening.
 * @type {Object}
 */
const DEFAULT = {
  start: 0,
  end: 1000,
  duration: 1000
}

/**
 * Bind a function with argument appended
 * without context.
 * @param  {Function} fn  Function to bind to.
 * @param  {Mixed}    arg Argument
 * @return {Function}     Bound function.
 */
function appendArgs (fn, arg) {
  return function () {
    return fn.apply(
      null,
      [].slice.call(arguments).concat(arg)
    )
  }
}

/**
 * A wrapper for tweezer.js.
 * @param  {Number}   start
 * @param  {Number}   end
 * @param  {Number}   duration
 * @param  {Function} tick
 * @param  {Function} done
 * @return {Function}
 */
function tween (
  start = DEFAULT.start,
  end = DEFAULT.end,
  duration = DEFAULT.duration,
  easing = null,
  tick = () => {},
  done = () => {}
) {
  return (e) => {
    return new Tweezer({
      start,
      end,
      duration,
      easing
    })
    .on('tick', appendArgs(tick, e))
    .on('done', appendArgs(done, e))
    .begin()
  }
}

/**
 * Shorten a function type check.
 * @param  {Function} fn
 * @return {Boolean}
 */
function isFn (fn) {
  return typeof fn === 'function'
}

/**
 * Directive definition
 */
function definition (Vue, opts) {
  const { warn, isPlainObject, bind } = Vue.util
  const isNewVersion = +(Vue.version.slice(0, 1)) >= 2
  let on

  if (!isNewVersion) {
    on = Vue.directive('on')
  }

  const listener = {}

  return {
    isFn: true,

    priority: !isNewVersion ? on.priority + 1 : undefined,

    keyCodes: !isNewVersion ? on.keyCodes : undefined,

    bind () {
      let el, arg, handler, rawName, modifier, context

      if (isNewVersion) {
        el = arguments[0]
        arg = arguments[1].arg
        handler = arguments[1].value
        rawName - arguments[1].rawName
        modifier = arguments[1].modifiers
        context = arguments[2].context
      } else {
        arg = this.arg
        handler = this.vm[this.descriptor.raw]
        rawName = this.descriptor.raw
        context = this.vm
      }

      if (!arg) {
        warn(
          `v-${opts.name} missing required event name.`,
          context
        )
        return
      }

      // call the handler if it's defined as a method
      if (isFn(handler)) {
        handler = handler()
      }

      if (!isPlainObject(handler)) {
        const type = Array.isArray(handler)
            ? 'array' : typeof handler

        warn(
          `v-${opts.name} expects '${rawName}' to be an ` +
          `object or a function returning an object ` +
          `instead of ${type}.`,
          context
        )
        return
      }

      if (!isFn(handler.tick)) {
        warn(
          `v-${opts.name} expects 'tick' to be a ` +
          `function instead of ${type}.`,
          context
        )
        return
      }

      // 'done' callback is optional
      if (!handler.done) {
        handler.done = () => {}
      }

      let easing

      if (typeof handler.easing === 'string') {
        easing = opts.easing[handler.easing]
      } else if (isFn(handler.easing)) {
        easing = handler.easing
      }

      handler = tween(
        handler.start,
        handler.end,
        handler.duration,
        easing,
        bind(handler.tick, context),
        bind(handler.done, context)
      )

      if (isNewVersion) {
        const useCapture = !!modifier.capture

        listener[arg] = [handler, useCapture]
        el.addEventListener(arg, handler, useCapture)
      } else {
        // using already registered 'on' directive
        // seems reliable
        on.update.call(this, handler)
      }
    },

    componentUpdated (el, h, vn, ovn) {
      // is this hook even necessary for this?
      if (el === ovn.elm) {
        return
      }

      el.removeEventListener(
        h.arg, listener[h.arg][0], listener[h.arg][1]
      )

      animate(Vue, opts).bind(el, h, vn)
    },

    unbind (el, value) {
      if (isNewVersion) {
        const arg = value.arg

        el.removeEventListener(
          arg, listener[arg][0], listener[arg][1]
        )

        listener[arg] = undefined
      } else {
        this.reset()
      }
    },

    reset () {
      on.reset.call(this)
    }
  }
}

/**
 * - name     : directive name.
 * - default  : default tween data which are start, end
 *              and duration.
 * - easing   : easing stash.
 * - install  : install method for Vue.
 */
export default {
  name: 'tween',

  version: '1.0.0',

  default: DEFAULT,

  easing: {},

  install (Vue, { name = '', easing = {}} = {}) {
    const { extend, warn } = Vue.util

    this.name = name || this.name
    extend(this.easing, easing)

    // easing value must be a function, so let's check
    for (const key in this.easing) {
      if (!isFn(this.easing[key])) {
        warn(
          `v-${this.name} Value of easing '${key}' ` +
          `must be a function instead of ` +
          typeof this.easing[key]
        )
        this.easing[key] = undefined
      }
    }

    Vue.directive(
      this.name,
      definition(
        Vue, {
          name: this.name,
          easing: this.easing
        }))
  }
}

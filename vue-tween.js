/* Vue Tween version 0.1.0 sign:11|32|49 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
  ? module.exports = factory(require('tweezer.js'))
  : typeof define === 'function' && define.amd
  ? define(['tweezer.js'], factory)
  : (global.VueTween = factory(global.Tweezer))
}(this, (function (Tweezer) { // eslint-disable-line
  'use strict'

  Tweezer = 'default' in Tweezer ? Tweezer['default'] : Tweezer

  /**
   * Default data for tweening.
   * @type {Object}
   */
  var DEFAULT = {
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
    start,
    end,
    duration,
    easing,
    tick,
    done
  ) {
    if (start === void 0) start = DEFAULT.start
    if (end === void 0) end = DEFAULT.end
    if (duration === void 0) duration = DEFAULT.duration
    if (easing === void 0) easing = null
    if (tick === void 0) tick = function () {}
    if (done === void 0) done = function () {}

    return function (e) {
      return new Tweezer({
        start: start,
        end: end,
        duration: duration,
        easing: easing
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
    var ref = Vue.util
    var warn = ref.warn
    var isPlainObject = ref.isPlainObject
    var bind = ref.bind
    var isNewVersion = +(Vue.version.slice(0, 1)) >= 2
    var on

    if (!isNewVersion) {
      on = Vue.directive('on')
    }

    var listener = {}

    return {
      isFn: true,

      priority: !isNewVersion ? on.priority + 1 : undefined,

      keyCodes: !isNewVersion ? on.keyCodes : undefined,

      bind: function bind$1 () {
        var el, arg, handler, rawName, modifier, context

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
            'v-' + opts.name + ' missing required event name.',
            context
          )
          return
        }

        // call the handler if it's defined as a method
        if (isFn(handler)) {
          handler = handler()
        }

        if (!isPlainObject(handler)) {
          var type_ = Array.isArray(handler)
              ? 'array' : typeof handler

          warn(
            'v-' + opts.name + " expects '" + rawName + "' to be an " +
            'object or a function returning an object ' +
            'instead of ' + type_ + '.',
            context
          )
          return
        }

        if (!isFn(handler.tick)) {
          warn(
            'v-' + opts.name + " expects 'tick' to be a " +
            'function instead of ' + type + '.',
            context
          )
          return
        }

        // 'done' callback is optional
        if (!handler.done) {
          handler.done = function () {}
        }

        var easing

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
          var useCapture = !!modifier.capture

          listener[arg] = [handler, useCapture]
          el.addEventListener(arg, handler, useCapture)
        } else {
          // using already registered 'on' directive
          // seems reliable
          on.update.call(this, handler)
        }
      },

      componentUpdated: function componentUpdated (el, h, vn, ovn) {
        // is this hook even necessary for this?
        if (el === ovn.elm) {
          return
        }

        el.removeEventListener(
          h.arg, listener[h.arg][0], listener[h.arg][1]
        )

        animate(Vue, opts).bind(el, h, vn)
      },

      unbind: function unbind (el, value) {
        if (isNewVersion) {
          var arg = value.arg

          el.removeEventListener(
            arg, listener[arg][0], listener[arg][1]
          )

          listener[arg] = undefined
        } else {
          this.reset()
        }
      },

      reset: function reset () {
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
  return {
    name: 'tween',

    version: '1.0.0',

    default: DEFAULT,

    easing: {},

    install: function install (Vue, ref) {
      var self = this
      if (ref === void 0) ref = {}

      var name = ref.name
      if (name === void 0) name = ''

      var easing = ref.easing
      if (easing === void 0) easing = {}

      var extend = Vue.util.extend
      var warn = Vue.util.warn

      this.name = name || this.name
      extend(this.easing, easing)

      // easing value must be a function, so let's check
      for (var key in this.easing) {
        if (!isFn(self.easing[key])) {
          warn(
            'v-' + self.name + " Value of easing '" + key + "' " +
            'must be a function instead of ' +
            typeof self.easing[key]
          )
          self.easing[key] = undefined
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
}))) // eslint-disable-line
/* Created by Cahyadi Nugraha */

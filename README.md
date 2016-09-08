# Vue Tween

Simple Vue.js library to apply Javascript tweening. Based on [jaxgeller/tweezer.js](https://github.com/jaxgeller/tweezer.js/).

## Demo
[Color Lord](https://jsfiddle.net/chay22/e4oq3fg6/)

## Requirements
- Vue => 1.x - 2.x
- and maybe `requestAnimationFrame` polyfill (for module)

## Installation
### 1) Download the package through npm
```shell
npm install vue-tween --save
```
> Note: All codes here will be written in ES6. But that doesn't mean any version or type of Javascript not applicable.

Then install it,
```javascript
import Vue from 'vue'
import VueTween from 'vue-tween'

Vue.use(VueTween)
```
There are couple options you can fill in within installation.
* **`name`** : Change the name of the directive.
* **`default`** : Change default value for animation `start`, `end` and `duration` time.
* **`easing`** : Include easing globally.

#### Example
```javascript
import Vue from 'vue'
import VueTween from 'vue-tween'

Vue.use(VueTween, {
  name: 'animate', //default: tween
  default: {
    start: -500, //default: 0
    end: 500, //default: 1000
    duration: 2000 //default: 1000
  },
  easing: { // default easing is only easeInOut which is provided by tweezer.js
    easeOutQuad (t, b, c, d) { 
      return -c * (t /= d)*(t - 2) + b;
    }
  }
})
```

### 2) With CDN.
Dependency and `requestAnimationFrame` polyfill already bundled in CDN script. It will also perform an auto-install on Vue.
```html
<script src="https://cdn.rawgit.com/chay22/vue-tween/master/vue-tween.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/vue-tween@1.0.0/vue-tween.min.js"></script>
```
## Usage
```html
<template>
  <div v-tween:click.capture="myTweening">
    <span :style="style"></span>
  </div>
</template>
```
#### 1) Directive name <sup>required</sup>
<code>&lt;div <strong>v-tween</strong>:click.capture="myTweening"&gt;</code>

This could be renamed during installation

#### 2) Arguments <sup>required</sup>
<code>&lt;div v-tween<strong>:click</strong>.capture="myTweening"&gt;</code>

DOM event. For Vue 1.x, it is based on built-in `on` directive.

#### 3) Modifier
<code>&lt;div v-tween:click<strong>.capture</strong>="myTweening"&gt;</code>

Available modifiers for Vue 1.x are on the [docs](http://vuejs.org/guide/events.html). For Vue 2.x `capture` is the only valid modifier.

#### 4) Handler
<code>&lt;div v-tween:click.capture="<strong>myTweening</strong>"&gt;</code>

The handler must return an object containing the following:
    
* `start` <sup>integer | default: 0</sup>
    
  Start of tween.
* `end` <sup>integer | default: 1000</sup>

  End of tween.
* `duration` <sup>integer | default: 1000</sup>

  Duration of tween.
* `easing` <sup>function/string | default: easeInOut</sup>

  Local component easing function. This can be a function that return an integer or a string specifying a name of globally registered easing during installation.
* `tick` <sup>function | **required**</sup>

  A function handler used to do animation. There are two parameters passed to this function, first is `value` which indicates current value between
  `start` to `end`. Each value is updated within 16ms through `requestAnimationFrame`. And the second parameter is `event handler` which passed by
  DOM `addEventListener` and can be used to do, i.e `e.preventDefault()` (to complement the lack of modifier for Vue 2.x).
* `done` <sup>function</sup>
  
  A function handler that fired when tweening has reached the `end` value. Parameters passed are all the same as `tick` handler.

> Consider to consult to [jaxgeller/tweezer.js](https://github.com/jaxgeller/tweezer.js/) directly for more information and real example.

## Example
```javascript
<template>
  <div v-tween:click.capture="myTweening">
    <span :style="style"></span>
  </div>
</template>

<script>
export default {
  data () {
    return {
      style: {
        position: 'absolute',
        left: ''
      }
    }
  },
  methods () {
    myTweening () {
      return {
        start: 0,
        end: 1000,
        duration: 1000,
        tick (v, e) {
          e.preventDefault()
          this.style.left = `${v / 10}px`,
          this.style.opacity = `${(v / -1000) + 1}`
        },
        done (v, e) {
          this.style.opacity = '0'
        }
      }
    }
  }
}
</script>
```

## License

[MIT License](https://github.com/chay22/vue-tween/blob/master/LICENSE)

Copyright (c) 2016 Cahyadi Nugraha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

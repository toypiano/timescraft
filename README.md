# TimesCraft (for Ethan)

A multiplication quiz PWA for my son who is a big fan of Minecraft.

- [Live Demo 🚀](https://timescraft.netlify.app/)

## What I Learned

### Snowpack

Snowpack is fast, but setting up Jest to work properly can be a pain.

### Jest with ESM

- ESM modules can access $ defined in global (loaded with CDN)
- When you're running ESM module via Jest, you get "$ is undefined".
- You get access to the global variable only within the functions inside modules.
- $ used outside function block becomes undefined (in test)

### Avoid setInterval

- It doesn't care whether the callback is still running, so they are not guaranteed to run in order! (callback executed earlier can finish later)
- It will keep running even with an error thrown in one of the callback

```js
// Suggested implementation
function interval(func, wait, times) {
  var interv = (function (w, t) {
    // returns a new function with wait and time bound to the context
    return function () {
      if (typeof t === 'undefined' || t-- > 0) {
        // t decrements after comparison
        setTimeout(interv, w);
        try {
          func.call(null); // default this(window) is automatically used if not in strict mode
        } catch (err) {
          t = 0; // stop on error (no need to manually clear timeout, no need to keep ids)
          throw err;
        }
      }
    };
  })(wait, times); // called immediately to return a new function dynamically bound with args

  setTimeout(interv, wait);
}

// Usage
interval(
  function () {
    // Code block goes here
  },
  1000,
  10
);
```

### Play Audio without user action

- Use [Howler](https://github.com/goldfire/howler.js#documentation)
- This also solves many cross-browser issues with HTML5 audio (mostly Safari).

### Safari & iOS support

If it works with Chrome/Firefox, chances are it will work on Android as well. It is almost always iOS/Safari that breaks your CSS in unexpected way. Therefore:

- Dev with old iPhone + Desktop Safari

  - connect iPhone to Mac via usb
  - go to settings(mac) > sharing > internet sharing to connect to your iPhone and set computer name for mac.
  - open safari from iPhone and go to `COMPUTER_NAME.local:PORT`

- Stick to flex as much as possible.
  - far too many unexpected behavior from using grid in Safari

### Sometimes it's not Safari

There was this bug only in Safari where class animation is not getting applied after first time (was working fine in other browsers.), but it turned out that I was removing wrong className on `animationend` and that Chrome and Firefox still applies animation even when the same className is added to the existing one. Maybe they are diffing the whole classList array and reapplies the entire classes when it gets updates.

`index.js`

```js
function fix() {
  const beginFix = () => {
    setState({
      currentIndex: 7,
    });
    setCurrentQuestion();
    goTo('play');
  };

  $('.btn-again').off('click', handleAgainButtonClick).on('click', beginFix);
  goTo('results');
}

fix();
```

`results.js`

```js
export function showLevelUpMessage() {
  console.log('showLevelUpMessage');
  console.log('Before:', $('.levelup-img')[0].classList.toString());
  $('.levelup-img')
    .removeClass('hidden')
    .one('animationend', function () {
      console.log('levelup animationend');
      $(this).removeClass(
        'animate__animated **animate__zoomInUp** animate__delay-1s animate__faster'
      );
      $('.clear-img')
        .one('animationend', function () {
          console.log('clear animationend');
          $(this)
            .removeClass('animate__animated animate__fadeOutUp')
            .css('opacity', 0); // not using 'hidden' because we want the container to keep its height.
        })
        .addClass('animate__animated animate__fadeOutUp');
    })
    .addClass(
      'animate__animated animate__zoomInDown animate__delay-1s animate__faster'
    );
  console.log('After: ', $('.levelup-img')[0].classList.toString());
}
```

Safari Dev Console

```bash
[Log] showLevelUpMessage (results.js, line 95)
[Log] Before: – "levelup-img hidden" (results.js, line 96)
[Log] After:  – "levelup-img animate__animated animate__zoomInDown animate__delay-1s animate__faster" (results.js, line 116)
[Warning] HTML5 Audio pool exhausted, returning potentially locked audio object. (howler.min.js, line 2)
[Log] Service Worker Registered (index.js, line 112)
[Log] levelup animationend (results.js, line 100)
[Log] clear animationend (results.js, line 106)
[Log] showLevelUpMessage (results.js, line 95)
[Log] Before: – "levelup-img animate__zoomInDown hidden"  (results.js, line 96) #animate__zoomInDown is supposed to be removed from the last call!
[Log] After:  – "levelup-img animate__zoomInDown animate__animated animate__delay-1s animate__faster" (results.js, line 116)

```

### user-select: none

User-select on buttons and other element can cause unexpected error.  
If it's game, just do this:

```css
*,
*::before,
*::after {
  box-sizing: inherit;
  user-select: none;
}
```

### Live Sass Error: Incompatible units: 'vw' and 'rem'.

Workaround: wrap min | max function inside calc()

```scss
margin: calc(min(0.5rem, 2vw));
```

## jQuery Tips & Gotchas

### `.on()` vs `.one()`

jQuery allows multiple handlers on the same element.
Unless manually removed with `.off()`, all attached event handler will be called in the same order that they were added.
<br/>
In the follow example, additional `endCallback` will be registered to `animationend` event every time `showModal` is called. As a result, endCallback will run as many times as showModal has been called.

```js
function showModal() {
  $('.modal')
    .on('animationend', endCallback)
    .addClass('animate__animated animate__slideInLeft');
}
```

So typically, you would want to use `.one()` with `animationend`

```js
function showModal() {
  $('.modal')
    // endCallback will be .off() -ed after it gets invoked.
    .one('animationend', endCallback)
    .addClass('animate__animated animate__slideInLeft');
}
```

But you can do the same thing by passing `{once: true}` option to `addEventListener()`  
(One less reason to use jQuery 🤷 )

```js
function showModal() {
  const modal = document.querySelector('.modal');
  modal.addEventListener('animationend', endCallback, { once: true });
  modal.classList.add('animate__animated animate__slideInLeft');
}
```

### Adding or removing multiple classes

```js
$('.modal').addClass('show').addClass('warning').addClass('slide-down');

// would be same as:

$('.modal').addClass('show warning slide-down');
```

### .hide() vs .addClass('hidden')

jQuery provides .hide() and .show() but you could achieve the same effect with adding and removing 'hidden' class with some added advantages:

- Making adjustments to CSS becomes much easier with 'hidden' class since you don't have to go to your js file to show your element (especially at the later stage of development.
- You can set the initial 'hidden' state with class, but if you were to do it with `.hide()` the element will only be hidden after the script is loaded.
- It's generally better to keep to presentation side of the things within HTML and CSS as much as possible, and only use js when you can't do it with pure CSS.

## Questions

### OOP vs FP

Currently, I ended up with lots of functions placed in a module with no hierarchy.  
Here are some of the pros and cons of OOP and FP I can think of:

- OOP allows you to organize code in more clear way.
- FP is easier and simpler to unit-test.

How can I decide on choosing either style depending on the project?

### jQuery vs React

I would normally work with React for any project that is more than simple brochure page, and this is one of the biggest project I've worked without using framework.

I've encountered with the following challenges working without using React:

- Markup, logics and data being separated into different modules make it harder to think in terms of "components". Having to go between multiple files doesn't feel as efficient (especially when refactoring).

- Without virtual DOM, users can see the rendering & updating as it happens on the screen. Maybe it's my lack of knowledge on how to solve this problem with jQuery.

- If I try to "mount" the component with `$('#root').append(component)`, user can see all the document reflow as the new element is being inserted into the placeholder. So I had to included as much markups as possible and only update the part that's actually changing. I think it's o.k. with the size of this project, but the size of initial markup the browser has to load will increase as the project gets bigger which will lead to the longer wait time.

- Hard to remember API interfaces as the number of functions grow larger which in turn, makes debugging a greater pain. This is something that can be improved with TypeScript (or jsDoc) but setting up TypeScript manually feels like a hassle you don't have to go through with create-react-app or Gatsby.

- Also, not being able to use CSS in JS (e.g. styled-components) is a minor inconvenience, but this can be mitigated with Sass live compiler and scss modules. As the project grow, managing all the css classes and specificity manually would become a big challenge.

So when should jQuery be preferred over React and vice versa?

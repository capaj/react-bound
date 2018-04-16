# react-bound
a react HOC for binding inputs to a model. Model can be a POJO or a mobx observable.
It does the same thing as https://facebook.github.io/react/docs/two-way-binding-helpers.html. Links the value from your model to your inputs so that you don't have to wire up every single input manually.
With react-bound you can forget what property of an `event.target` carries the actual value. No matter if it's a checkbox, radio or a file input. All of the DOM api quirks are hardcoded in react-bound and you get the actual values laid out into your model.

![showcase login form](https://raw.githubusercontent.com/capaj/react-bound/master/img/showcase-login-form.gif)

## supported html tags

```
input
textarea
select
```

### supported input element types

```
text
url
search
checkbox
radio
password
color
email
date
time
file
datetime-local
number
```

## form extra API
Currently you get an object available for your children callback with these props:
- `dirty` boolean flag indicating if any of the bound inputs had any change event
- `reset` this function reverts your state object to the state it was in when `<Bound>` rendered first
- `set` this function sets a property on your state to the supplied value and changes dirty from false to true

Also inspired by angular form controller I want to add support for validation to be able to indicate `valid` and `invalid` on the whole state object.

## Motivation

Main motivation is to avoid handling raw events for each input. Having a `<Bound>` saves quite a bit of code. This approach violates the often touted one-way data flow-the great react.js strength, but I don't really care. It works well enough for all the forms I've created with it so far.

## Showcase

To run a showcase, use: `npm run showcase`

## Usage

You can bound a single input:
```javascript
<Bound to={state}>
  <textarea name='unicornInput' />
</Bound>
```

Or a whole form:
```javascript
const state = observable({
  first: '',
  second: '',
})
// in render
<Bound to={state}>
   <form>
    <label>
      First
      <input
        name='first'
        onChange={ev => {
          console.log('onchange still works as always', ev)
        }}
      />
    </label>

    <label>
      Second
      <input name='second' />
    </label>
   <form>
</Bound>
```
All you have to do is match the name of input to the property in your state. The React element tree is recursively traversed, so even if you hide the input 20 layers deep, it will still hook it up.

You can bind multiple forms inside a single `Bound` element, but I'd advise you to at least namespace your inputs, so that your model remains somewhat tidy.
For example:

```javascript
const state = observable({
  formA: {
    unicornInput: ''
  },
  formB: {
    unicornInput: ''
  }

})
<Bound to={state}>
  <textarea name='formA.unicornInput' />
  <textarea name='formB.unicornInput' />
</Bound>
```

## With inputs wrapped in custom elements

So a lot of inputs you use are wrapped in a react component. For example [react-select](https://github.com/JedWatson/react-select). To bind these, you can utilize a `bound` prop on any element which accepts a `value` and `onChange` handler. Example:

```javascript
<Bound to={state}>
  <Select bound='unicornInput'/>
</Bound>
```

## Children as function
By using function a direct child, you can get `dirty`, `reset` and `set` form utils. These utils are backed by a Weakmap-so if you have multiple <Bound/> elements where `to` is the same, `dirty` will be changed to true if any of the two forms is touched.

```javascript
<Bound to={state}>
  {({dirty, reset, set}) => {
    return <div>
      <textarea name='a' />
      <textarea name='b' />
      <span>has been touched: {dirty}</span>
      <button onClick={reset}>
        reset form
      </button>
      <button onClick={() => {
        set('a', 1)  // sets a value to model programatically-same as doin a = 1 but "dirty" gets switched
      }}>
        reset form
      </button>
    </div>
  }}
</Bound>
```

## Props

### to
a reference to s state object

### onChange
is called for any change in the state object. Callback is called with 3 params: state, statePropPath, castedValue

### TBD
Sometimes you'd get a react warning when you do this-if you do the wrapped element is forwarding the bound prop to the child. If you can't make sure that the prop `bound` is not passed, you'll want to use `<BindElement>` like this to avoid getting the error:

```javascript
<Bound to={state}>
  <BindElement>
    <Select name='unicornInput'/>
  </BindElement>
</Bound>
```

## With mobx
Make sure you initialize your fields, otherwise an error is thrown if your state is mobx observable.

```javascript
const state = observable({
  unicornInput: ''
})
// in render
<Bound to={state}>
  <textarea name='unicornInput' />
</Bound>
```

## formsExtraState

In raw cases you might need to be able to get the state for `dirty` and `reset` imperatively. In those cases, just `import {formsExtraState} from 'react-bound'` and you should be able to get any form state from it

## Browser compatibility

Any browser with a Weakmap will do.
# react-bound
a react HOC for binding inputs to a model. Model can be a POJO or a mobx observable.
It does the same thing as https://facebook.github.io/react/docs/two-way-binding-helpers.html. Links the value from your model to your inputs so that you don't have to wire up every single input manually.

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
password
color
email
date
time
datetime-local
number
```

## planned in future versions
```
file
```
Also inspired by angular form controller I want to add support for validation to be able to indicate `$valid` and `$invalid` on the whole state object. Currently only `$dirty` is added to your state.

## Motivation

Main motivation is to escape from handling raw events for forms. For 90% of the forms I create I find that going to the low level and writing event handlers for each of my input is overkill. Having a `<Bound>` saves quite a bit of needless code. This approach probably violates the often touted one-way data flow-the great react.js strength, but I don't care. It works well enough for all the forms I've created so far.

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
  $dirty: false // this is added automatically on mount. It will be turned to false when any input is touched-just like in angular
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

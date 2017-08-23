# react-bound
a react HOC for binding inputs to a model. Model can be a POJO or a mobx observable. Inspired by angular form controller.

It does the same thing as https://facebook.github.io/react/docs/two-way-binding-helpers.html. Links the value from your model to your inputs so that you don't have to wire up every single input manually.

## supported tags types

```
input
textarea
select
```

### supported input types

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
Also to add support for validation to be able to indicate `$valid` and `$invalid` on the whole state object

## Motivation

Main motivation is to escape from handling raw events for forms. For 90% of the form I create, I find that going to the low level and writing event handlers for each of my input is overkill. This probably violates the touted one-way data flow, but I don't care. It works wonders for all the forms I've created so far.

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
  second: ''
})
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
All you have to do is match the name of input to the property in your state.

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

## With mobx
Make sure you initialize your fields, otherwise an error is thrown if your state is mobx observable.

```javascript
const state = observable({
  unicornInput: ''
})
// later
<Bound to={state}>
  <textarea name='unicornInput' />
</Bound>
```
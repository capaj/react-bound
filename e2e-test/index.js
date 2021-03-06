import ReactDOM from 'react-dom'
import React, { Component } from 'react'
import Bound from '../src/react-bound'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import ReactJson from 'react-json-view'

const state = observable({
  a: {
    first: 'some default value'
  },
  second: '',
  third: '',
  wrapped: 'wrapped value',
  wrappedCheck: false,
  color: '#5c1111',
  gender: null, // radio btns
  number: 10,
  checkbox: true,
  file: null,
  date: new Date(),
  time: '10:55',
  datetime: new Date(),
  aSelect: 'value2'
})
window.state = state
const state2 = {}
window.state2 = state2

const WrappedInputCheckbox = ({ bound, onChange, value }) => {
  return (
    <div>
      Wrapped checkbox
      <input type="checkbox" onChange={onChange} checked={value} />
    </div>
  )
}
const WrappedInputText = ({ bound, onChange, value }) => {
  return (
    <div>
      Wrapped input
      <input onChange={onChange} value={value} />
    </div>
  )
}

const refTest = React.createRef()
window.refTest = refTest
class Test extends Component {
  render() {
    return (
      <div>
        <Bound
          to={state}
          onChange={(val, path, newValue) => {
            console.log('on change is called', path, newValue)
          }}
        >
          <form role="form">
            <label>
              First
              <input
                name="a.first"
                onChange={ev => {
                  console.log('onchange still works', ev)
                }}
              />
            </label>

            <label>
              Second
              <input name="second" />
            </label>
            <br />
            <br />

            <label>
              number input
              <input type="number" name="number" />
            </label>
            <br />
            <br />

            <label>
              checkbox input
              <input name="checkbox" type="checkbox" />
            </label>
            <br />
            <br />

            <label>
              date input
              <input type="date" name="date" />
            </label>
            <br />
            <br />
            <label>
              time input
              <input type="time" name="time" />
            </label>
            <br />
            <br />
            <label>
              color input
              <input type="color" name="color" />
            </label>
            <br />
            <br />
            <label>
              datetime-local input
              <input type="datetime-local" name="datetime" />
            </label>
            <div>
              Gender choice
              <input
                type="radio"
                id="genderChoice1"
                name="gender"
                value="male"
              />
              <label htmlFor="genderChoice1">Male</label>
              <input
                type="radio"
                id="genderChoice2"
                name="gender"
                value="female"
              />
              <label htmlFor="genderChoice2">Female</label>
            </div>
            <br />
            <br />
            <input name="file" type="file" />
          </form>
        </Bound>
        <Bound to={state}>
          <textarea
            name="third"
            ref={el => {
              console.log('el', el)
            }}
          />
          <WrappedInputText bound="wrapped" />
          <WrappedInputCheckbox bound="wrappedCheck" />
        </Bound>
        <br />
        <br />
        <Bound to={state}>
          {({ dirty, reset, set, setClean }) => {
            return (
              <div ref={refTest}>
                <select
                  name="aSelect"
                  className="aaa"
                  ref={el => {
                    console.log('elem', el)
                  }}
                >
                  <option value="value1">Value 1</option>
                  <option value="value2">Value 2</option>
                  <option value="value3">Value 3</option>
                </select>
                <br />
                <button onClick={reset}>reset to initial state</button>
                <button
                  onClick={() => {
                    setClean(state)
                  }}
                >
                  set current as clean
                </button>
                <button
                  onClick={() => {
                    set('second', 'aaa')
                  }}
                >
                  set test
                </button>
                <br />
                Dirty: {JSON.stringify(dirty)}
              </div>
            )
          }}
        </Bound>
        <br />
        {/* <ReactJson src={state} /> */}
        <br />
        State: {JSON.stringify(state)}
        <br />
        <Bound to={state2}>
          <textarea name="formA.unicornInput" />
          <textarea name="formB.unicornInput" />
        </Bound>
      </div>
    )
  }
}
const TestObserver = observer(Test)

ReactDOM.render(<TestObserver />, window.reactApp)

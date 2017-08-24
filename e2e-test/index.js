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
  color: '#5c1111',
  number: 10,
  date: new Date(),
  time: '10:55',
  datetime: new Date(),
  aSelect: 'value2'
})

const WrappedInput = ({bound, onChange, value}) => {
  return <div>
    Wrapped input
    <input onChange={onChange} value={value} />
  </div>
}

class Test extends Component {
  render () {
    return (
      <div>
        <Bound to={state}>
          <form role='form'>
            <label>
              First
              <input
                name='a.first'
                onChange={ev => {
                  console.log('onchange still works', ev)
                }}
              />
            </label>

            <label>
              Second
              <input name='second' />
            </label>
            <br />
            <br />

            <label>
              number input
              <input type='number' name='number' />
            </label>
            <br />
            <br />

            <label>
              date input
              <input type='date' name='date' />
            </label>
            <br />
            <br />
            <label>
              time input
              <input type='time' name='time' />
            </label>
            <br />
            <br />
            <label>
              color input
              <input type='color' name='color' />
            </label>
            <br />
            <br />
            <label>
              datetime-local input
              <input type='datetime-local' name='datetime' />
            </label>
          </form>
        </Bound>
        <Bound to={state}>
          <textarea name='third' />
          <WrappedInput bound='wrapped' />
        </Bound>
        <Bound to={state}>
          <select name='aSelect'>
            <option value='value1'>Value 1</option>
            <option value='value2'>Value 2</option>
            <option value='value3'>Value 3</option>
          </select>
        </Bound>
        <br />
        <br />
        <ReactJson src={state} />
        <br />        
        State: {JSON.stringify(state)}
        <br />
        Dirty: {JSON.stringify(state.$dirty)}
      </div>
    )
  }
}
const TestObserver = observer(Test)

ReactDOM.render(<TestObserver />, window.reactApp)

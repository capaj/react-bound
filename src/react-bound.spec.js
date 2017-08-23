import Bound from './react-bound'
import test from 'ava'
import React from 'react'

test('renders', t => {
  t.snapshot(<Bound to={{}}>
    <textarea name='formA.unicornInput' />
    <textarea name='formB.unicornInput' />
  </Bound>)
})

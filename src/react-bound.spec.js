import Bound from './react-bound'
import 'jest'
import React from 'react'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { mount } from 'enzyme'

Enzyme.configure({ adapter: new Adapter() })

describe('react-bound', () => {
  it('renders', async () => {
    const mounted = mount(
      <Bound to={{}}>
        <textarea name="formA.unicornInput" />
        <textarea name="formB.unicornInput" />
      </Bound>
    )
    expect(mounted.html()).toMatchSnapshot()
  })
})

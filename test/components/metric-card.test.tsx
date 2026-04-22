import React from 'react'
import { render, screen } from '../utils/render'

import { MetricCard } from '@/components/metric-card/metric-card'

test('MetricCard displays title and value', () => {
  render(<MetricCard title="Revenue" value="$1,234" />)
  expect(screen.getByText('Revenue')).toBeInTheDocument()
  expect(screen.getByText('$1,234')).toBeInTheDocument()
})

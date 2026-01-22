'use client'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchWeekSchedule } from '../schedule'

const mockQuery = {
  select: vi.fn(),
  gte: vi.fn(),
  lte: vi.fn(),
  order: vi.fn(),
}

const mockSupabase = {
  from: vi.fn(() => mockQuery),
}

vi.mock('../supabase', () => ({
  getSupabaseClient: () => mockSupabase,
}))

beforeEach(() => {
  vi.clearAllMocks()

  mockQuery.select.mockReturnValue(mockQuery)
  mockQuery.gte.mockReturnValue(mockQuery)
  mockQuery.lte.mockReturnValue(mockQuery)
})

describe('Schedule API', () => {
  it('fetchWeekSchedule returns scheduled articles', async () => {
    mockQuery.order.mockResolvedValue({
      data: [
        {
          id: '1',
          title: 'Scheduled Article',
          scheduled_publish_time: new Date().toISOString(),
        },
      ],
      error: null,
    })

    const result = await fetchWeekSchedule()

    expect(mockSupabase.from).toHaveBeenCalledWith('articles')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Scheduled Article')
  })
})

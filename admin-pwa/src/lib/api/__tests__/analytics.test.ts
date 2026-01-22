'use client'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchViewsData } from '../analytics'

const mockQuery = {
  select: vi.fn(),
  eq: vi.fn(),
  gte: vi.fn(),
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
  mockQuery.eq.mockReturnValue(mockQuery)
  mockQuery.gte.mockReturnValue(mockQuery)
})

describe('Analytics API', () => {
  it('fetchViewsData returns 30-day series', async () => {
    mockQuery.order.mockResolvedValue({
      data: [{ published_at: new Date().toISOString() }],
      error: null,
    })

    const result = await fetchViewsData()

    expect(mockSupabase.from).toHaveBeenCalledWith('articles')
    expect(result).toHaveLength(30)
    expect(result[0]).toHaveProperty('date')
  })
})

'use client'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { approveArticle, fetchPendingArticles } from '../articles'

const mockQuery = {
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  update: vi.fn(),
  single: vi.fn(),
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
  mockQuery.order.mockReturnValue(mockQuery)
  mockQuery.update.mockReturnValue(mockQuery)
})

describe('Articles API', () => {
  it('fetchPendingArticles returns pending articles', async () => {
    mockQuery.limit.mockResolvedValue({
      data: [{ id: '1', status: 'pending_review' }],
      error: null,
    })

    const result = await fetchPendingArticles()

    expect(mockSupabase.from).toHaveBeenCalledWith('articles')
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('pending_review')
  })

  it('approveArticle updates status to approved', async () => {
    mockQuery.single.mockResolvedValue({
      data: { id: '1', status: 'approved' },
      error: null,
    })

    const result = await approveArticle('1', 'tester')

    expect(mockQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'approved' }),
    )
    expect(result.status).toBe('approved')
  })
})

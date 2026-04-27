import { NextResponse } from 'next/server';
import { getBreakingNews, getTopStories, searchNews, getNewsByCategory } from '@/lib/news-aggregator';
import { NewsFilters } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action') || 'top';
    const category = searchParams.get('category') || undefined;
    const query = searchParams.get('q') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const country = searchParams.get('country') || undefined;
    const language = searchParams.get('language') || undefined;
    
    let data;
    
    switch (action) {
      case 'breaking':
        data = await getBreakingNews(limit);
        break;
      
      case 'top':
        data = await getTopStories(category, limit);
        break;
      
      case 'search':
        const searchFilters: NewsFilters = {
          category: category,
          country: country,
          language: language,
        };
        data = await searchNews(query || '', searchFilters, page, limit);
        break;
      
      case 'category':
        data = await getNewsByCategory(category || 'general', page, limit);
        break;
      
      default:
        data = await getTopStories(category, limit);
    }
    
    return NextResponse.json({ 
      success: true, 
      data,
      meta: {
        action,
        page,
        limit,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

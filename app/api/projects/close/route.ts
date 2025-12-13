import { NextResponse } from 'next/server';
import { getNotionClient } from '@/lib/notion';

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const notion = getNotionClient();

    // 更新 Notion 頁面的 state 欄位為「已結案」
    await notion.pages.update({
      page_id: projectId,
      properties: {
        'state': {
          rich_text: [
            {
              text: {
                content: '已結案',
              },
            },
          ],
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error closing project:', error);
    return NextResponse.json(
      { error: 'Failed to close project' },
      { status: 500 }
    );
  }
}

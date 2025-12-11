import { Client } from '@notionhq/client';
import { cache } from './cache';

// 延遲初始化，避免構建時出錯
let notionClient: Client | null = null;

export function getNotionClient(): Client {
  if (!notionClient) {
    notionClient = new Client({
      auth: process.env.NOTION_API_KEY || '',
    });
  }
  return notionClient;
}

export function getDatabaseId(): string {
  return process.env.NOTION_DATABASE_ID || '';
}

export interface ProjectProperty {
  專案名稱: string;
  專案型態: string[];
  責任編輯: string[];
  責任設計: string[];
  通知狀態: string;
  工作執行區間: { start: string | null; end: string | null } | null;
  補充說明: string;
  單元名稱: string;
  尺寸規格: string;
  進廠時間: string;
  檔案路徑: string;
  最後更新時間: string;
  id: string;
}

function extractRichText(richText: any[]): string {
  if (!richText || richText.length === 0) return '';
  return richText.map((text: any) => text.plain_text).join('');
}

function extractMultiSelect(multiSelect: any[]): string[] {
  if (!multiSelect) return [];
  return multiSelect.map((item: any) => item.name);
}

function extractDate(date: any): { start: string | null; end: string | null } | null {
  if (!date) return null;
  return {
    start: date.start || null,
    end: date.end || null,
  };
}

function extractStatus(status: any): string {
  if (!status) return '未知';
  return status.name || '未知';
}

export function parseNotionPage(page: any): ProjectProperty {
  const props = page.properties;

  return {
    id: page.id,
    專案名稱: props['專案名稱']?.title ? extractRichText(props['專案名稱'].title) : '',
    專案型態: props['專案型態']?.multi_select ? extractMultiSelect(props['專案型態'].multi_select) : [],
    責任編輯: props['責任編輯']?.multi_select ? extractMultiSelect(props['責任編輯'].multi_select) : [],
    責任設計: props['責任設計']?.multi_select ? extractMultiSelect(props['責任設計'].multi_select) : [],
    通知狀態: props['通知狀態']?.status ? extractStatus(props['通知狀態'].status) : '未知',
    工作執行區間: props['工作執行區間']?.date ? extractDate(props['工作執行區間'].date) : null,
    補充說明: props['補充說明']?.rich_text ? extractRichText(props['補充說明'].rich_text) : '',
    單元名稱: props['單元名稱']?.rich_text ? extractRichText(props['單元名稱'].rich_text) : '',
    尺寸規格: props['尺寸規格']?.rich_text ? extractRichText(props['尺寸規格'].rich_text) : '',
    進廠時間: props['進廠時間']?.rich_text ? extractRichText(props['進廠時間'].rich_text) : '',
    檔案路徑: props['檔案路徑']?.rich_text ? extractRichText(props['檔案路徑'].rich_text) : '',
    最後更新時間: props['最後更新時間']?.last_edited_time || '',
  };
}

export async function getProjects(): Promise<ProjectProperty[]> {
  try {
    const notion = getNotionClient();
    const databaseId = getDatabaseId();

    let allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    // 使用分頁獲取所有資料
    while (hasMore) {
      const response: any = await notion.databases.query({
        database_id: databaseId,
        page_size: 100,
        start_cursor: startCursor,
      });

      allResults = allResults.concat(response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    console.log(`已獲取 ${allResults.length} 個專案`);
    return allResults.map(parseNotionPage);
  } catch (error) {
    console.error('Error fetching projects from Notion:', error);
    throw error;
  }
}

export async function queryProjects(filter?: any, sorts?: any): Promise<ProjectProperty[]> {
  try {
    const notion = getNotionClient();
    const databaseId = getDatabaseId();

    let allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    // 使用分頁獲取所有資料
    while (hasMore) {
      const response: any = await notion.databases.query({
        database_id: databaseId,
        filter,
        sorts,
        page_size: 100,
        start_cursor: startCursor,
      });

      allResults = allResults.concat(response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    console.log(`查詢獲取 ${allResults.length} 個專案`);
    return allResults.map(parseNotionPage);
  } catch (error) {
    console.error('Error querying projects from Notion:', error);
    throw error;
  }
}

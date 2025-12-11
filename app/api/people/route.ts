import { NextResponse } from 'next/server';
import { getAllProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const projects = await getAllProjects();

    // 收集所有設計師和編輯，記錄每個人的角色
    const peopleMap = new Map<string, Set<string>>();

    projects.forEach(project => {
      project.責任設計.forEach(d => {
        if (!peopleMap.has(d)) {
          peopleMap.set(d, new Set());
        }
        peopleMap.get(d)!.add('設計師');
      });

      project.責任編輯.forEach(e => {
        if (!peopleMap.has(e)) {
          peopleMap.set(e, new Set());
        }
        peopleMap.get(e)!.add('編輯');
      });
    });

    // 將 Map 轉換為陣列，合併多個角色
    const people = Array.from(peopleMap.entries()).map(([name, roles]) => ({
      name,
      role: Array.from(roles).join('、'), // 如果同時是設計師和編輯，顯示為 "設計師、編輯"
      roles: Array.from(roles),
    })).sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));

    return NextResponse.json(people);
  } catch (error) {
    console.error('Error in people API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch people' },
      { status: 500 }
    );
  }
}

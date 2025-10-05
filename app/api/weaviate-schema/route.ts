import { NextResponse } from 'next/server';
import { client } from '@/config/weaviate.config';

export async function GET() {
  try {
    const schema = await client.schema.getter().do();

    return NextResponse.json({
      success: true,
      classes: schema.classes?.map((cls: any) => ({
        className: cls.class,
        properties: cls.properties?.map((prop: any) => ({
          name: prop.name,
          dataType: prop.dataType
        }))
      })) || []
    });
  } catch (error) {
    console.error('Schema inspection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get schema'
    }, { status: 500 });
  }
}
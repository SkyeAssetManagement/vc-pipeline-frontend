import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/config/weaviate.config';

export async function GET() {
  try {
    console.log('=== Inspecting All Weaviate Schemas ===');
    
    // Get all classes
    const schema = await client.schema.getter().do();
    
    const result: any = {
      totalClasses: schema.classes.length,
      classes: {}
    };
    
    for (const cls of schema.classes) {
      result.classes[cls.class] = {
        description: cls.description || 'No description',
        vectorizer: cls.vectorizer || 'Not specified',
        propertyCount: cls.properties.length,
        properties: cls.properties.map((prop: any) => ({
          name: prop.name,
          type: prop.dataType,
          tokenization: prop.tokenization
        }))
      };
      
      // Try to get a count of objects in each class
      try {
        const count = await client.graphql
          .aggregate()
          .withClassName(cls.class)
          .withFields('meta { count }')
          .do();
          
        result.classes[cls.class].objectCount = count.data.Aggregate[cls.class]?.[0]?.meta?.count || 0;
      } catch (countError: any) {
        result.classes[cls.class].objectCount = 'Error counting objects';
      }
    }
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error: any) {
    console.error('Error inspecting all schemas:', error);
    return NextResponse.json(
      { error: 'Failed to inspect all schemas', details: error.message },
      { status: 500 }
    );
  }
}
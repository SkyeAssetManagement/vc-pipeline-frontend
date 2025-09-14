// Simple schema inspection script
import { client } from '@/config/weaviate.config';

async function inspectSchema() {
  try {
    console.log('=== Inspecting Weaviate Schema ===\n');
    
    // Get all classes
    const schema = await client.schema.getter().do();
    
    console.log('Available classes:');
    schema.classes.forEach((cls: any) => {
      console.log(`- ${cls.class}`);
    });
    console.log('\n');
    
    // Find the VC_PE_Voyage_Binary_Production class
    const targetClass = schema.classes.find((cls: any) => cls.class === 'VC_PE_Voyage_Binary_Production');
    
    if (targetClass) {
      console.log('=== VC_PE_Voyage_Binary_Production Schema ===');
      console.log(`Class: ${targetClass.class}`);
      console.log(`Description: ${targetClass.description || 'No description'}`);
      console.log(`Vectorizer: ${targetClass.vectorizer || 'Not specified'}`);
      console.log('\nProperties:');
      
      targetClass.properties.forEach((prop: any) => {
        console.log(`  - ${prop.name}`);
        console.log(`    Type: ${prop.dataType.join(', ')}`);
        console.log(`    Description: ${prop.description || 'No description'}`);
        if (prop.tokenization) {
          console.log(`    Tokenization: ${prop.tokenization}`);
        }
        console.log('');
      });
      
      // Try to get a sample object to see actual field names
      console.log('\n=== Sample Data ===');
      try {
        const sample = await client.graphql
          .get()
          .withClassName('VC_PE_Voyage_Binary_Production')
          .withLimit(1)
          .do();
          
        if (sample.data.Get.VC_PE_Voyage_Binary_Production && sample.data.Get.VC_PE_Voyage_Binary_Production.length > 0) {
          const sampleObj = sample.data.Get.VC_PE_Voyage_Binary_Production[0];
          console.log('Sample object keys:', Object.keys(sampleObj));
          console.log('\nSample object structure:');
          Object.entries(sampleObj).forEach(([key, value]: [string, any]) => {
            const valuePreview = typeof value === 'string' && value.length > 100 
              ? value.substring(0, 100) + '...' 
              : value;
            console.log(`  ${key}: ${typeof value} - ${valuePreview}`);
          });
        } else {
          console.log('No sample data found in collection');
        }
      } catch (sampleError: any) {
        console.log('Error getting sample data:', sampleError.message);
      }
    } else {
      console.log('VC_PE_Voyage_Binary_Production class not found!');
      console.log('\nAvailable classes:');
      schema.classes.forEach((cls: any) => {
        console.log(`- ${cls.class}`);
      });
    }
    
  } catch (error: any) {
    console.error('Error inspecting schema:', error.message);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  inspectSchema();
}

export { inspectSchema };
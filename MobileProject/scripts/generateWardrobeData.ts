import * as fs from 'fs';
import * as path from 'path';

const baseClothesDir = path.join(__dirname, '..', 'src', 'assets', 'data', 'clothes');
const outputDir = path.join(__dirname, '..', 'src', 'assets', 'data');

const importLine = `import { ImageSourcePropType } from 'react-native';\n\n`;
const itemType = `export interface ClothingItem {\n  id: string;\n  name: string;\n  category: string;\n  subcategory: string;\n  imagePath: ImageSourcePropType;\n}\n\n`;

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

fs.readdirSync(baseClothesDir).forEach(category => {
  const categoryPath = path.join(baseClothesDir, category);
  if (!fs.statSync(categoryPath).isDirectory()) return;

  const allItems: string[] = [];

  fs.readdirSync(categoryPath).forEach(subcategory => {
    const subPath = path.join(categoryPath, subcategory);
    if (!fs.statSync(subPath).isDirectory()) return;

    const files = fs.readdirSync(subPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    
    files.forEach((file, index) => {
      const id = `${subcategory}${index + 1}`;
      const item = `  {
    id: '${id}',
    name: '${capitalize(subcategory)}',
    category: '${category}',
    subcategory: '${subcategory}',
    imagePath: require('./data/clothes/${category}/${subcategory}/${file}')
  }`;
      allItems.push(item);
    });
  });

  const arrayName = `${category}Data`;
  const content = `${importLine}${itemType}const ${arrayName}: ClothingItem[] = [\n${allItems.join(',\n')}\n];\n\nexport default ${arrayName};\n`;
  const outputPath = path.join(outputDir, `${category}.ts`);
  fs.writeFileSync(outputPath, content);
  console.log(`✅ ${category}.ts oluşturuldu`);
});

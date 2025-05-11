import { ImageSourcePropType } from 'react-native';

export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  imagePath: ImageSourcePropType;
}

const accessoriesData: ClothingItem[] = [

];

export default accessoriesData;

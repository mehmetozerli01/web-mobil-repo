import React, { useState, useEffect } from 'react';
import { Product } from '../types';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data: Product[] = await response.json();
        
        // Filter products by category name (clothes or shoes)
        const filteredProducts = data.filter(product => 
          product.category.name.toLowerCase() === 'clothes' || 
          product.category.name.toLowerCase() === 'shoes'
        );
        
        setProducts(filteredProducts);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 shadow-md">
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="w-full h-48 object-cover rounded-md"
          />
          <h2 className="text-xl font-semibold mt-2">{product.title}</h2>
          <p className="text-gray-600">{product.category.name}</p>
          <p className="text-lg font-bold mt-2">${product.price}</p>
          <p className="text-sm text-gray-500 mt-2">{product.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductList; 
import React, { useState } from 'react';
import { Product } from '../types';
import { formatUGX } from '../utils/calculator';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface ProductsCatalogProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const ProductsCatalog: React.FC<ProductsCatalogProps> = ({
  products,
  setProducts,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [unitPriceUGX, setUnitPriceUGX] = useState(0);
  const [costPriceUGX, setCostPriceUGX] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(5);
  const [minStockThreshold, setMinStockThreshold] = useState(2);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || unitPriceUGX <= 0) {
      alert('Please enter product name and selling price in UGX.');
      return;
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      category,
      unitPriceUGX,
      costPriceUGX,
      stockQuantity,
      minStockThreshold,
    };

    setProducts((prev) => [newProduct, ...prev]);
    setIsModalOpen(false);
    setName('');
    setUnitPriceUGX(0);
  };

  const handleStockUpdate = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, stockQuantity: Math.max(0, p.stockQuantity + delta) }
          : p
      )
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Products & Stock Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track inventory levels, unit prices in UGX, cost margins, and low stock alerts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-900/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product / Service</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const isLowStock = p.stockQuantity <= p.minStockThreshold;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${
                isLowStock ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                    {p.category}
                  </span>
                  {isLowStock ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                      In Stock
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-2">{p.name}</h3>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs mb-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Selling Price:</span>
                    <span className="font-bold text-slate-900">{formatUGX(p.unitPriceUGX)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Cost Price:</span>
                    <span>{formatUGX(p.costPriceUGX)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 text-[11px] font-semibold border-t border-slate-200 pt-1">
                    <span>Profit Margin:</span>
                    <span>{formatUGX(p.unitPriceUGX - p.costPriceUGX)} / unit</span>
                  </div>
                </div>
              </div>

              {/* Stock Quantity Adjuster */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Qty Available:</span>

                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => handleStockUpdate(p.id, -1)}
                    className="w-6 h-6 bg-white rounded text-slate-700 font-bold hover:bg-rose-100 hover:text-rose-700 flex items-center justify-center text-xs shadow-sm"
                  >
                    -
                  </button>
                  <span className="font-bold text-xs text-slate-900 px-1">{p.stockQuantity}</span>
                  <button
                    onClick={() => handleStockUpdate(p.id, 1)}
                    className="w-6 h-6 bg-white rounded text-slate-700 font-bold hover:bg-emerald-100 hover:text-emerald-700 flex items-center justify-center text-xs shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900">Add Product or Service</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product / Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HP EliteBook Laptop or Screen Repair"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                >
                  <option value="Laptops">Laptops</option>
                  <option value="Phones">Phones</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Services & Repair">Services & Repair</option>
                  <option value="General Retail">General Retail</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price (UGX) *
                  </label>
                  <input
                    type="number"
                    required
                    value={unitPriceUGX}
                    onChange={(e) => setUnitPriceUGX(Number(e.target.value))}
                    placeholder="e.g. 1800000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost Price (UGX)
                  </label>
                  <input
                    type="number"
                    value={costPriceUGX}
                    onChange={(e) => setCostPriceUGX(Number(e.target.value))}
                    placeholder="e.g. 1400000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Alert Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minStockThreshold}
                    onChange={(e) => setMinStockThreshold(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

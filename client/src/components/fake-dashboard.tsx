import { interactionLogger } from "@/lib/interaction-logger";

const mockProducts = [
  {
    name: 'iPhone 14 Pro Max',
    description: '128GB Space Black',
    sku: 'IP14PM-128-SB',
    category: 'Electronics',
    stock: 45,
    price: '$1,099.00',
    status: 'In Stock',
    statusColor: 'bg-green-100 text-green-800'
  },
  {
    name: 'Samsung Smart TV 65"',
    description: '4K UHD LED',
    sku: 'SS65-4K-LED',
    category: 'Electronics',
    stock: 12,
    price: '$799.99',
    status: 'Low Stock',
    statusColor: 'bg-yellow-100 text-yellow-800'
  },
  {
    name: 'Nike Air Max 270',
    description: "Men's Running Shoes",
    sku: 'NK-AM270-M',
    category: 'Footwear',
    stock: 0,
    price: '$150.00',
    status: 'Out of Stock',
    statusColor: 'bg-red-100 text-red-800'
  }
];

const mockStats = {
  totalProducts: 2847,
  inStock: 2156,
  lowStock: 124,
  outOfStock: 567
};

export default function FakeDashboard() {
  const handleProductClick = (productName: string) => {
    interactionLogger.logProductView(productName);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Product Inventory Dashboard</h3>
        <p className="mt-1 text-sm text-gray-600">Current stock levels and product information</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{mockStats.totalProducts.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">{mockStats.inStock.toLocaleString()}</div>
          <div className="text-sm text-gray-600">In Stock</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{mockStats.lowStock.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-red-600">{mockStats.outOfStock.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockProducts.map((product, index) => (
              <tr 
                key={index}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleProductClick(product.name)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">IMG</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.statusColor}`}>
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

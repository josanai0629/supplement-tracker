'use client'

import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { TrendingUp, TrendingDown, Star, MessageCircle, DollarSign, Trophy } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ProductData {
  id: string
  name: string
  price: number
  review_count: number
  rating_value: number
  rank: number
  scraped_at: string
  platform: string
}

interface ChartData {
  date: string
  price: number
  review_count: number
  rating_value: number
  rank: number
}

const ProductDashboard: React.FC = () => {
  const [products, setProducts] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [productData, setProductData] = useState<ChartData[]>([])
  const [latestData, setLatestData] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      fetchProductData(selectedProduct)
    }
  }, [selectedProduct])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('supplement_products_search')
        .select('name')
        .order('name')

      if (error) throw error

      const uniqueProducts = Array.from(new Set(data.map(item => item.name)))
      setProducts(uniqueProducts)
      if (uniqueProducts.length > 0) {
        setSelectedProduct(uniqueProducts[0])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchProductData = async (productName: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('supplement_products_search')
        .select('*')
        .eq('name', productName)
        .order('scraped_at', { ascending: true })

      if (error) throw error

      const chartData: ChartData[] = data.map((item: ProductData) => ({
        date: format(new Date(item.scraped_at), 'MM/dd HH:mm', { locale: ja }),
        price: item.price,
        review_count: item.review_count,
        rating_value: parseFloat(item.rating_value?.toString() || '0'),
        rank: item.rank
      }))

      setProductData(chartData)
      setLatestData(data[data.length - 1])
    } catch (error) {
      console.error('Error fetching product data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendColor = (current: number, previous: number, isRank = false) => {
    if (isRank) {
      return current < previous ? 'text-green-600' : current > previous ? 'text-red-600' : 'text-gray-600'
    }
    return current > previous ? 'text-green-600' : current < previous ? 'text-red-600' : 'text-gray-600'
  }

  const getTrendIcon = (current: number, previous: number, isRank = false) => {
    if (isRank) {
      return current < previous ? <TrendingUp className="w-4 h-4" /> : current > previous ? <TrendingDown className="w-4 h-4" /> : null
    }
    return current > previous ? <TrendingUp className="w-4 h-4" /> : current < previous ? <TrendingDown className="w-4 h-4" /> : null
  }

  const getChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  const StatCard: React.FC<{
    title: string
    value: string | number
    change?: string
    trend?: 'up' | 'down' | 'neutral'
    icon: React.ReactNode
    color: string
  }> = ({ title, value, change, trend, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center space-x-1 ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
             trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
            <span className="text-sm font-medium">{change}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">サプリメント商品追跡ダッシュボード</h1>
          <p className="text-gray-600">商品の価格、レビュー、評価、ランキングの推移を可視化</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品を選択
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {products.map((product) => (
              <option key={product} value={product}>
                {product.length > 80 ? `${product.substring(0, 80)}...` : product}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          selectedProduct && productData.length > 0 && (
            <>
              {/* 現在の統計 */}
              {latestData && productData.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="価格"
                    value={`¥${latestData.price.toLocaleString()}`}
                    change={getChange(latestData.price, productData[productData.length - 2].price)}
                    trend={latestData.price > productData[productData.length - 2].price ? 'up' : 
                           latestData.price < productData[productData.length - 2].price ? 'down' : 'neutral'}
                    icon={<DollarSign className="w-6 h-6 text-white" />}
                    color="bg-green-500"
                  />
                  <StatCard
                    title="レビュー数"
                    value={latestData.review_count.toLocaleString()}
                    change={getChange(latestData.review_count, productData[productData.length - 2].review_count)}
                    trend={latestData.review_count > productData[productData.length - 2].review_count ? 'up' : 
                           latestData.review_count < productData[productData.length - 2].review_count ? 'down' : 'neutral'}
                    icon={<MessageCircle className="w-6 h-6 text-white" />}
                    color="bg-blue-500"
                  />
                  <StatCard
                    title="評価"
                    value={latestData.rating_value}
                    change={getChange(parseFloat(latestData.rating_value?.toString() || '0'), productData[productData.length - 2].rating_value)}
                    trend={parseFloat(latestData.rating_value?.toString() || '0') > productData[productData.length - 2].rating_value ? 'up' : 
                           parseFloat(latestData.rating_value?.toString() || '0') < productData[productData.length - 2].rating_value ? 'down' : 'neutral'}
                    icon={<Star className="w-6 h-6 text-white" />}
                    color="bg-yellow-500"
                  />
                  <StatCard
                    title="ランク"
                    value={`${latestData.rank}位`}
                    change={Math.abs(parseFloat(getChange(latestData.rank, productData[productData.length - 2].rank))).toString()}
                    trend={latestData.rank < productData[productData.length - 2].rank ? 'up' : 
                           latestData.rank > productData[productData.length - 2].rank ? 'down' : 'neutral'}
                    icon={<Trophy className="w-6 h-6 text-white" />}
                    color="bg-purple-500"
                  />
                </div>
              )}

              {/* グラフ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 価格推移 */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">価格推移</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={productData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                        tickFormatter={(value) => `¥${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`¥${value.toLocaleString()}`, '価格']}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* レビュー数推移 */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">レビュー数推移</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString(), 'レビュー数']}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Bar 
                        dataKey="review_count" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 評価推移 */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">評価推移</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={productData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        domain={[0, 5]}
                        stroke="#666"
                        fontSize={12}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value.toFixed(2), '評価']}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rating_value" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#f59e0b' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* ランク推移 */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ランク推移</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={productData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        reversed
                        stroke="#666"
                        fontSize={12}
                        tickFormatter={(value) => `${value}位`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}位`, 'ランク']}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rank" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#8b5cf6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 商品情報 */}
              {latestData && (
                <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">商品情報</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">商品名:</span> {latestData.name}</p>
                    <p><span className="font-medium">プラットフォーム:</span> {latestData.platform}</p>
                    <p><span className="font-medium">最終更新:</span> {format(new Date(latestData.scraped_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}</p>
                    {latestData.url && (
                      <p>
                        <span className="font-medium">URL:</span>{' '}
                        <a 
                          href={latestData.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          商品ページを開く
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  )
}

export default ProductDashboard
import { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, CheckCircle, XCircle, TrendingUp, Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/format-currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Period = 'today' | '7days' | 'month';

export default function AdminLaporanPage() {
  const [period, setPeriod] = useState<Period>('7days');
  const { storeAdmin } = useAuth();
  const storeId = storeAdmin?.store_id;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-laporan', storeId, period],
    queryFn: async () => {
      if (!storeId) return null;

      const now = new Date();
      let startDate: Date;
      if (period === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === '7days') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .gte('created_at', startDate.toISOString());

      const allOrders = orders || [];
      const completed = allOrders.filter(o => o.order_status === 'COMPLETED');
      const cancelled = allOrders.filter(o => o.order_status === 'CANCELED');
      const revenue = completed.reduce((sum, o) => sum + o.total, 0);

      // Daily chart data
      const dailyMap = new Map<string, number>();
      completed.forEach(o => {
        const day = new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        dailyMap.set(day, (dailyMap.get(day) || 0) + o.total);
      });
      const chartData = Array.from(dailyMap.entries()).map(([name, value]) => ({ name, value }));

      // Best sellers
      const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
      completed.forEach(o => {
        const items = Array.isArray(o.items) ? o.items as any[] : [];
        items.forEach((item: any) => {
          const existing = productSales.get(item.product_id) || { name: item.name, qty: 0, revenue: 0 };
          existing.qty += item.qty || 1;
          existing.revenue += (item.qty || 1) * (item.price || 0);
          productSales.set(item.product_id, existing);
        });
      });
      const bestSellers = Array.from(productSales.values())
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      return {
        totalOrders: allOrders.length,
        completedCount: completed.length,
        cancelledCount: cancelled.length,
        revenue,
        chartData,
        bestSellers,
      };
    },
    enabled: !!storeId,
  });

  const medals = ['🥇', '🥈', '🥉', '4', '5'];

  const stats = [
    { label: 'Total Pesanan', value: data?.totalOrders ?? 0, icon: Package, color: 'bg-primary' },
    { label: 'Selesai', value: data?.completedCount ?? 0, icon: CheckCircle, color: 'bg-success' },
    { label: 'Dibatalkan', value: data?.cancelledCount ?? 0, icon: XCircle, color: 'bg-destructive' },
    { label: 'Total Pendapatan', value: formatCurrency(data?.revenue ?? 0), icon: TrendingUp, color: 'bg-accent', isText: true },
  ];

  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
    return val.toString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Laporan Penjualan</h1>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="today">Hari Ini</TabsTrigger>
            <TabsTrigger value="7days">7 Hari</TabsTrigger>
            <TabsTrigger value="month">Bulan Ini</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(s => (
                <Card key={s.label}>
                  <CardHeader className="pb-2">
                    <div className={`h-10 w-10 ${s.color} rounded-lg flex items-center justify-center`}>
                      <s.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{s.isText ? s.value : (s.value as number).toLocaleString('id-ID')}</p>
                    <p className="text-sm font-medium">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pendapatan Harian</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.chartData && data.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(val: number) => formatCurrency(val)} />
                      <Bar dataKey="value" fill="hsl(16, 85%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Belum ada data</p>
                )}
              </CardContent>
            </Card>

            {/* Best Sellers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Produk Terlaris</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.bestSellers && data.bestSellers.length > 0 ? (
                  data.bestSellers.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 3 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {i < 3 ? medals[i] : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.qty} terjual</p>
                      </div>
                      <p className="text-sm font-semibold text-primary">{formatCurrency(p.revenue)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Belum ada data penjualan</p>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
              <Download className="h-4 w-4 mr-2" /> Export Laporan
            </Button>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

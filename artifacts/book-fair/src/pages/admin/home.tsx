import { useGetSalesSummary, useGetTopBooks, useGetSalesByPresenter } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, BookCopy, Users, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminHome() {
  const { data: summary, isLoading: loadingSummary } = useGetSalesSummary();
  const { data: topBooks, isLoading: loadingTopBooks } = useGetTopBooks();
  const { data: presenters, isLoading: loadingPresenters } = useGetSalesByPresenter();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of book fair performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={summary ? formatCurrency(summary.totalRevenue) : null}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          loading={loadingSummary}
        />
        <StatCard
          title="Units Sold"
          value={summary?.totalUnits.toLocaleString()}
          icon={<BookCopy className="w-5 h-5 text-secondary" />}
          loading={loadingSummary}
        />
        <StatCard
          title="Total Sales"
          value={summary?.totalSales.toLocaleString()}
          icon={<Users className="w-5 h-5 text-accent" />}
          loading={loadingSummary}
        />
        <StatCard
          title="Low Stock Alerts"
          value={summary?.lowStockCount.toLocaleString()}
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
          loading={loadingSummary}
          className={summary?.lowStockCount && summary.lowStockCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Books */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-serif">Top Books</CardTitle>
            <Link href="/admin/books">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingTopBooks ? (
              <div className="space-y-4 mt-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : topBooks?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No sales yet.</div>
            ) : (
              <div className="divide-y mt-2">
                {topBooks?.slice(0, 5).map((book) => (
                  <div key={book.productId} className="py-4 flex items-center gap-4">
                    <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <BookCopy className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{book.name}</p>
                      <p className="text-sm text-muted-foreground">{book.totalUnits} units sold</p>
                    </div>
                    <div className="font-bold text-lg">{formatCurrency(book.totalRevenue)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Presenter Leaderboard */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-serif">Presenter Leaderboard</CardTitle>
            <Link href="/admin/presenters">
              <Button variant="ghost" size="sm">Manage Users</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingPresenters ? (
              <div className="space-y-4 mt-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : presenters?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No presenters with sales yet.</div>
            ) : (
              <div className="divide-y mt-2">
                {presenters?.map((presenter, i) => (
                  <div key={presenter.userId} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{presenter.username}</p>
                        <p className="text-sm text-muted-foreground">{presenter.totalSales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(presenter.totalRevenue)}</div>
                      <div className="text-xs text-muted-foreground">{presenter.totalUnits} units</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading, className = "" }: { title: string, value: string | null | undefined, icon: React.ReactNode, loading: boolean, className?: string }) {
  return (
    <Card className={`shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-background rounded-md shadow-sm">
            {icon}
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24 mt-2" />
        ) : (
          <div className="text-3xl font-bold mt-2">{value || "0"}</div>
        )}
      </CardContent>
    </Card>
  );
}

import { useListSales } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";

export default function AdminSales() {
  const { data: sales, isLoading } = useListSales();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-serif font-bold">All Sales</h1>
        <p className="text-muted-foreground mt-1">Real-time transaction history</p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Presenter</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : sales?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No sales recorded yet.</TableCell></TableRow>
              ) : (
                sales?.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(sale.createdAt)}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{sale.productName}</TableCell>
                    <TableCell>{sale.username}</TableCell>
                    <TableCell className="text-muted-foreground">{sale.buyerName || "—"}</TableCell>
                    <TableCell className="text-right">{sale.quantity}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(sale.unitPrice)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{formatCurrency(sale.totalPrice)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

import { useListSales } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

export default function AdminSales() {
  const { t, lang } = useI18n();
  const { data: sales, isLoading } = useListSales();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-serif font-bold">{t("allSales")}</h1>
        <p className="text-muted-foreground mt-1">{t("realtimeHistory")}</p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("book")}</TableHead>
                <TableHead>{t("presenter")}</TableHead>
                <TableHead>{t("buyer")}</TableHead>
                <TableHead className="text-right">{t("qty")}</TableHead>
                <TableHead className="text-right">{t("price")}</TableHead>
                <TableHead className="text-right font-bold">{t("total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">{t("loading")}</TableCell></TableRow>
              ) : sales?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t("noSalesRecorded")}</TableCell></TableRow>
              ) : (
                sales?.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(sale.createdAt, lang)}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{sale.productName}</TableCell>
                    <TableCell>{sale.username}</TableCell>
                    <TableCell className="text-muted-foreground">{sale.buyerName || "—"}</TableCell>
                    <TableCell className="text-right">{sale.quantity}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(sale.unitPrice, lang)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{formatCurrency(sale.totalPrice, lang)}</TableCell>
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

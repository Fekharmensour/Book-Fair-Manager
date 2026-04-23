import {
  useListOrders,
  useUpdateOrder,
  useDeleteOrder,
  getListOrdersQueryKey,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Image as ImageIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrders() {
  const { t, lang } = useI18n();
  const { data: orders, isLoading } = useListOrders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateMutation = useUpdateOrder();
  const deleteMutation = useDeleteOrder();

  const statuses = [
    { value: "pending", label: t("statusPending"), variant: "secondary" as const },
    { value: "confirmed", label: t("statusConfirmed"), variant: "default" as const },
    { value: "done", label: t("statusDone"), variant: "outline" as const },
    { value: "cancelled", label: t("statusCancelled"), variant: "destructive" as const },
  ];

  const handleStatusChange = (id: string, status: string) => {
    updateMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: t("orderUpdated") });
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("confirmDeleteOrder"))) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: t("orderDeleted") });
        },
      }
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-serif font-bold">{t("customerOrders")}</h1>
        <p className="text-muted-foreground mt-1">{t("customerOrdersDesc")}</p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("book")}</TableHead>
                <TableHead>{t("customer")}</TableHead>
                <TableHead>{t("phone")}</TableHead>
                <TableHead className="text-right">{t("qty")}</TableHead>
                <TableHead className="text-right">{t("total")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {t("loading")}
                  </TableCell>
                </TableRow>
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t("noOrdersYet")}
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => {
                  const statusInfo = statuses.find((s) => s.value === order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDate(order.createdAt, lang)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                            {order.coverImage ? (
                              <img src={order.coverImage} alt={order.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-3 h-3 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium max-w-[180px] truncate">{order.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell dir="ltr" className="text-muted-foreground">{order.phone}</TableCell>
                      <TableCell className="text-right">{order.quantity}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatCurrency(order.totalPrice, lang)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusInfo && (
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          )}
                          <Select
                            value={order.status}
                            onValueChange={(v) => handleStatusChange(order.id, v)}
                          >
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

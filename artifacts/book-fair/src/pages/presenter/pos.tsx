import { useState } from "react";
import {
  useListProducts,
  useCreateSale,
  useListSales,
  getListProductsQueryKey,
  getListSalesQueryKey,
  getGetSalesSummaryQueryKey,
  getGetTopBooksQueryKey,
  getGetSalesByPresenterQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import PresenterLayout from "@/components/layout/presenter-layout";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Receipt, Search, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n";

export default function PresenterPOS() {
  const { t, lang, dir } = useI18n();
  const { user } = useAuth();
  const { data: products, isLoading } = useListProducts();
  const [search, setSearch] = useState("");

  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [qty, setQty] = useState(1);
  const [buyerName, setBuyerName] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createSale = useCreateSale();

  const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleOpenSale = (book: any) => {
    if (book.stock <= 0) return;
    setSelectedBook(book);
    setQty(1);
    setBuyerName("");
  };

  const handleSell = () => {
    if (!selectedBook || !user) return;

    createSale.mutate({
      data: {
        productId: selectedBook.id,
        userId: user.id,
        quantity: qty,
        buyerName: buyerName.trim() || undefined
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSalesSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTopBooksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSalesByPresenterQueryKey() });

        toast({
          title: t("saleSuccessful"),
          description: t("soldX", { qty, name: selectedBook.name }),
          className: "bg-primary text-primary-foreground border-none",
        });
        setSelectedBook(null);
      }
    });
  };

  return (
    <PresenterLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md relative">
            <Search className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
            <Input
              placeholder={t("searchBooks")}
              className={`h-12 text-lg rounded-xl shadow-sm border-border bg-card ${dir === "rtl" ? "pr-10" : "pl-10"}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <MySalesSheet userId={user?.id || ""} />
        </div>

        <ScrollArea className="flex-1 -mx-4 px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                <div key={i} className="bg-card rounded-xl aspect-[3/4] animate-pulse border" />
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg">{t("noBooksFound")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 pb-20">
              {filteredProducts?.map(book => (
                <button
                  key={book.id}
                  disabled={book.stock <= 0}
                  onClick={() => handleOpenSale(book)}
                  className={`text-left group relative bg-card border rounded-2xl overflow-hidden transition-all hover-elevate active-elevate-2 shadow-sm ${
                    book.stock <= 0 ? "opacity-50 cursor-not-allowed grayscale-[0.5]" : "hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <div className="aspect-[3/4] bg-muted relative w-full">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/30" /></div>
                    )}
                    {book.stock > 0 && book.stock <= 5 && (
                      <Badge variant="destructive" className={`absolute top-2 shadow-sm ${dir === "rtl" ? "left-2" : "right-2"}`}>{t("onlyLeft", { n: book.stock })}</Badge>
                    )}
                    {book.stock <= 0 && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center font-bold text-lg backdrop-blur-sm">{t("soldOut")}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold font-serif leading-tight line-clamp-2 min-h-[2.5rem]">{book.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">{formatCurrency(book.priceSell, lang)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <Dialog open={!!selectedBook} onOpenChange={(open) => !open && setSelectedBook(null)}>
        {selectedBook && (
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
            <div className="bg-muted p-6 flex items-start gap-4">
               <div className="w-16 h-24 rounded bg-background shadow-sm overflow-hidden flex-shrink-0">
                  {selectedBook.coverImage ? (
                    <img src={selectedBook.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>
                  )}
               </div>
               <div>
                 <DialogTitle className="text-xl font-serif leading-tight">{selectedBook.name}</DialogTitle>
                 <div className="text-muted-foreground mt-1">{formatCurrency(selectedBook.priceSell, lang)} {t("each")}</div>
                 <Badge variant="outline" className="mt-2 bg-background">{t("stock")}: {selectedBook.stock}</Badge>
               </div>
            </div>

            <div className="p-6 space-y-6 bg-card">
              <div className="flex items-center justify-between bg-muted/50 p-2 rounded-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-lg"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <div className="text-2xl font-bold font-mono w-16 text-center">{qty}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-lg text-primary"
                  onClick={() => setQty(Math.min(selectedBook.stock, qty + 1))}
                  disabled={qty >= selectedBook.stock}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">{t("buyerNameOptional")}</Label>
                <Input
                  placeholder={t("buyerPlaceholder")}
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  className="h-12 text-lg bg-background"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-lg font-medium text-muted-foreground">{t("total")}</span>
                <span className="text-3xl font-bold text-foreground">
                  {formatCurrency(selectedBook.priceSell * qty, lang)}
                </span>
              </div>

              <Button
                className="w-full h-14 text-lg font-bold rounded-xl active-elevate shadow-sm"
                onClick={handleSell}
                disabled={createSale.isPending}
              >
                {createSale.isPending ? t("processing") : t("completeSale")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </PresenterLayout>
  );
}

function MySalesSheet({ userId }: { userId: string }) {
  const { t, lang, dir } = useI18n();
  const { data: sales, isLoading } = useListSales({ userId });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-12 px-4 rounded-xl border-border bg-card shadow-sm font-medium hover-elevate gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          {t("mySales")}
        </Button>
      </SheetTrigger>
      <SheetContent side={dir === "rtl" ? "left" : "right"} className="w-full sm:max-w-md border-l-0 shadow-2xl flex flex-col p-0">
        <div className="p-6 border-b bg-card">
          <SheetTitle className="font-serif text-2xl">{t("mySalesHistory")}</SheetTitle>
        </div>
        <ScrollArea className="flex-1 bg-muted/10">
          <div className="p-6 space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">{t("loading")}</div>
            ) : sales?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>{t("noSalesYet")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sales?.map(sale => (
                  <div key={sale.id} className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-foreground pr-4 leading-tight">{sale.productName}</div>
                      <div className="font-bold text-primary whitespace-nowrap">{formatCurrency(sale.totalPrice, lang)}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">{t("qty")}: {sale.quantity}</Badge>
                        {sale.buyerName && <span>{t("to")}: {sale.buyerName}</span>}
                      </div>
                      <div>{formatDate(sale.createdAt, lang)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

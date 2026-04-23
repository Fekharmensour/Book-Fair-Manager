import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  useListProducts,
  useCreateOrder,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  BookOpen,
  ShoppingCart,
  Image as ImageIcon,
  Plus,
  Minus,
  Trash2,
  LogIn,
  Search,
} from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  coverImage: string | null;
  priceSell: number;
  stock: number;
  qty: number;
}

export default function Landing() {
  const { t, lang, dir } = useI18n();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useListProducts();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const filtered = useMemo(
    () =>
      products?.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );

  const cartTotal = cart.reduce((s, i) => s + i.priceSell * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (book: any) => {
    if (book.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((p) => p.id === book.id);
      if (existing) {
        if (existing.qty >= book.stock) return prev;
        return prev.map((p) =>
          p.id === book.id ? { ...p, qty: p.qty + 1 } : p,
        );
      }
      return [
        ...prev,
        {
          id: book.id,
          name: book.name,
          coverImage: book.coverImage,
          priceSell: book.priceSell,
          stock: book.stock,
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === id
            ? { ...p, qty: Math.max(0, Math.min(p.stock, p.qty + delta)) }
            : p,
        )
        .filter((p) => p.qty > 0),
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCheckout = async () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: t("nameRequired") });
      return;
    }
    if (!phone.trim()) {
      toast({ variant: "destructive", title: t("phoneRequired") });
      return;
    }

    try {
      for (const item of cart) {
        await createOrder.mutateAsync({
          data: {
            productId: item.id,
            customerName: name.trim(),
            phone: phone.trim(),
            quantity: item.qty,
          },
        });
      }
      toast({
        title: t("orderPlaced"),
        description: t("orderPlacedDesc"),
        className: "bg-primary text-primary-foreground border-none",
      });
      setCart([]);
      setName("");
      setPhone("");
      setSheetOpen(false);
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("orderFailed"),
        description: err?.error || "",
      });
    }
  };

  const cartIdMap = new Map(cart.map((i) => [i.id, i.qty]));

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 hover-elevate p-2 -m-2 rounded-md">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="font-serif font-bold text-xl hidden sm:block">{t("appName")}</h1>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="default" size="sm" className="h-9 gap-2 relative">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("cart")}</span>
                  {cartCount > 0 && (
                    <Badge className="bg-background text-primary border-0 h-5 min-w-5 px-1.5">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side={dir === "rtl" ? "left" : "right"}
                className="w-full sm:max-w-md p-0 flex flex-col"
              >
                <div className="p-6 border-b bg-card">
                  <SheetTitle className="font-serif text-2xl">{t("yourOrder")}</SheetTitle>
                </div>
                {cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                    <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg">{t("cartEmpty")}</p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setSheetOpen(false)}
                    >
                      {t("continueShopping")}
                    </Button>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1 bg-muted/10">
                      <div className="p-4 space-y-3">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="bg-card rounded-xl border p-3 flex gap-3 shadow-sm"
                          >
                            <div className="w-14 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                              {item.coverImage ? (
                                <img
                                  src={item.coverImage}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="font-medium leading-tight line-clamp-2">
                                  {item.name}
                                </div>
                                <div className="text-sm text-primary font-bold mt-1">
                                  {formatCurrency(item.priceSell, lang)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1 bg-muted/50 rounded-md">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQty(item.id, -1)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-8 text-center font-mono text-sm">
                                    {item.qty}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQty(item.id, +1)}
                                    disabled={item.qty >= item.stock}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="border-t bg-card p-6 space-y-4">
                      <div className="space-y-2">
                        <Label>{t("fullName")}</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t("fullName")}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("phoneNumber")}</Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+213 ..."
                          className="h-11"
                          dir="ltr"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-muted-foreground">{t("total")}</span>
                        <span className="text-2xl font-bold">
                          {formatCurrency(cartTotal, lang)}
                        </span>
                      </div>
                      <Button
                        className="w-full h-12 text-lg font-bold"
                        onClick={handleCheckout}
                        disabled={createOrder.isPending}
                      >
                        {createOrder.isPending ? t("placingOrder") : t("placeOrder")}
                      </Button>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>
            {user ? (
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setLocation(user.isAdmin ? "/admin" : "/pos")}
              >
                {user.isAdmin ? t("dashboard") : t("mySales")}
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-9 gap-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("staffLogin")}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-card to-muted/20 border-b">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
            {t("ourBooks")}
          </h2>
          <p className="text-muted-foreground mt-3 text-lg max-w-xl mx-auto">
            {t("browseAndOrder")}
          </p>
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
            <Input
              placeholder={t("searchBooks")}
              className={`h-12 text-base shadow-sm bg-card ${dir === "rtl" ? "pr-10" : "pl-10"}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl aspect-[3/4] animate-pulse border"
              />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">{t("noBooksFound")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 pb-16">
            {filtered?.map((book) => {
              const inCart = cartIdMap.get(book.id) ?? 0;
              const soldOut = book.stock <= 0;
              return (
                <div
                  key={book.id}
                  className={`bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col ${
                    soldOut ? "opacity-60" : "hover:shadow-md transition-shadow"
                  }`}
                >
                  <div className="aspect-[3/4] bg-muted relative">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    {!soldOut && book.stock <= 5 && (
                      <Badge
                        variant="destructive"
                        className={`absolute top-2 shadow-sm ${dir === "rtl" ? "left-2" : "right-2"}`}
                      >
                        {t("onlyLeft", { n: book.stock })}
                      </Badge>
                    )}
                    {soldOut && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center font-bold text-lg backdrop-blur-sm">
                        {t("soldOut")}
                      </div>
                    )}
                    {inCart > 0 && (
                      <Badge
                        className={`absolute top-2 shadow-sm bg-primary text-primary-foreground border-0 ${dir === "rtl" ? "right-2" : "left-2"}`}
                      >
                        {inCart} {t("inCart")}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold font-serif leading-tight line-clamp-2 min-h-[2.5rem]">
                      {book.name}
                    </h3>
                    <div className="text-lg font-bold text-primary mt-2">
                      {formatCurrency(book.priceSell, lang)}
                    </div>
                    <Button
                      className="w-full mt-3 gap-2"
                      disabled={soldOut || inCart >= book.stock}
                      onClick={() => addToCart(book)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {t("sellNow")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

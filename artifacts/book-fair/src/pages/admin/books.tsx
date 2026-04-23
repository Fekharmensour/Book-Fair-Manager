import { useState } from "react";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import { Plus, Edit2, Trash2, Image as ImageIcon, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

export default function AdminBooks() {
  const { t, lang } = useI18n();
  const { data: products, isLoading } = useListProducts();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", coverImage: "", stock: 10, priceBuy: 0, priceSell: 0 });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", coverImage: "", stock: 10, priceBuy: 0, priceSell: 0 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      coverImage: product.coverImage || "",
      stock: product.stock,
      priceBuy: product.priceBuy,
      priceSell: product.priceSell
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      description: formData.description || null,
      coverImage: formData.coverImage || null
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: t("bookUpdated") });
          setIsFormOpen(false);
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: t("bookCreated") });
          setIsFormOpen(false);
        }
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(t("confirmDeleteBook", { name }))) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: t("bookDeleted") });
        }
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">{t("booksInventory")}</h1>
          <p className="text-muted-foreground mt-1">{t("manageTitlesPricing")}</p>
        </div>
        <Button onClick={handleOpenCreate} className="hover-elevate">
          <Plus className="w-4 h-4 mr-2" /> {t("addBook")}
        </Button>
      </div>

      <div className="flex items-center bg-card border rounded-lg px-3 py-2 shadow-sm w-full max-w-md">
        <Search className="w-5 h-5 text-muted-foreground mr-2" />
        <input
          type="text"
          placeholder={t("searchBooks")}
          className="bg-transparent border-none outline-none flex-1 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-16">{t("cover")}</TableHead>
                <TableHead>{t("title")}</TableHead>
                <TableHead className="text-right">{t("cost")}</TableHead>
                <TableHead className="text-right">{t("price")}</TableHead>
                <TableHead className="text-right">{t("stockLabel")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">{t("loading")}</TableCell></TableRow>
              ) : filteredProducts?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("noBooksFound")}</TableCell></TableRow>
              ) : (
                filteredProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-10 h-12 bg-muted rounded overflow-hidden">
                        {product.coverImage ? (
                          <img src={product.coverImage} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(product.priceBuy, lang)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(product.priceSell, lang)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={product.stock <= 5 ? "destructive" : "secondary"}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id, product.name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? t("editBook") : t("addNewBook")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("title")}</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={t("bookTitlePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("descriptionOptional")}</Label>
              <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder={t("shortDescription")} />
            </div>
            <div className="space-y-2">
              <Label>{t("coverUrlOptional")}</Label>
              <Input value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("costPrice")}</Label>
                <Input type="number" min="0" step="0.01" required value={formData.priceBuy} onChange={e => setFormData({...formData, priceBuy: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>{t("sellingPrice")}</Label>
                <Input type="number" min="0" step="0.01" required value={formData.priceSell} onChange={e => setFormData({...formData, priceSell: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>{t("stockLabel")}</Label>
                <Input type="number" min="0" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>{t("cancel")}</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? t("saveChanges") : t("createBook")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

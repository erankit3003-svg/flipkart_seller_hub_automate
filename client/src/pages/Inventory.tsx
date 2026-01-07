import Layout from "@/components/Layout";
import { useProducts, useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Loader2, Edit2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, type Product } from "@shared/schema";
import { z } from "zod";

// Form schema with coercion for numeric inputs
const productFormSchema = insertProductSchema.extend({
  price: z.coerce.number(),
  stock: z.coerce.number(),
  lowStockThreshold: z.coerce.number(),
});

export default function Inventory() {
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useProducts({ search });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InsertProduct>({
    resolver: zodResolver(productFormSchema),
  });

  const onSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...data }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingProduct(null);
          reset();
        }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          reset();
        }
      });
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 5,
      category: product.category || "",
      description: product.description || "",
      imageUrl: product.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    reset({
      name: "",
      sku: "",
      price: 0,
      stock: 0,
      lowStockThreshold: 5,
      category: "",
      description: "",
      imageUrl: "",
    });
    setIsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Inventory</h1>
            <p className="text-muted-foreground">Manage your product catalog and stock levels</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} className="shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" {...register("name")} placeholder="e.g. Wireless Mouse" />
                      {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" {...register("sku")} placeholder="e.g. WM-001" />
                      {errors.sku && <span className="text-xs text-red-500">{errors.sku.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input id="price" type="number" {...register("price")} />
                      {errors.price && <span className="text-xs text-red-500">{errors.price.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input id="stock" type="number" {...register("stock")} />
                      {errors.stock && <span className="text-xs text-red-500">{errors.stock.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="threshold">Low Stock Alert</Label>
                      <Input id="threshold" type="number" {...register("lowStockThreshold")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" {...register("category")} placeholder="Electronics" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" {...register("description")} placeholder="Product details..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" {...register("imageUrl")} placeholder="https://..." />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      {editingProduct ? "Save Changes" : "Create Product"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name / SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                    No products found. Add your first one!
                  </TableCell>
                </TableRow>
              ) : (
                products?.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.sku}</div>
                    </TableCell>
                    <TableCell>{product.category || "-"}</TableCell>
                    <TableCell>₹{Number(product.price).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={product.stock <= (product.lowStockThreshold || 5) ? "text-red-600 font-bold" : ""}>
                          {product.stock}
                        </span>
                        {product.stock <= (product.lowStockThreshold || 5) && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
import { Package } from "lucide-react";

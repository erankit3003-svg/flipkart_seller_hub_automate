import Layout from "@/components/Layout";
import { useOrders, useGenerateInvoice } from "@/hooks/use-orders";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Orders() {
  const [search, setSearch] = useState("");
  const { data: orders, isLoading } = useOrders({ search });
  const invoiceMutation = useGenerateInvoice();

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CREATED": return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "PACKED": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
      case "SHIPPED": return "bg-orange-100 text-orange-700 hover:bg-orange-200";
      case "DELIVERED": return "bg-green-100 text-green-700 hover:bg-green-200";
      case "CANCELLED": return "bg-red-100 text-red-700 hover:bg-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Orders</h1>
            <p className="text-muted-foreground">Manage and track your customer orders</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Order ID or Buyer Name..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
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
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{format(new Date(order.orderDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{order.buyerName}</TableCell>
                    <TableCell>₹{Number(order.totalAmount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => invoiceMutation.mutate(order.id)}
                        disabled={invoiceMutation.isPending}
                        title="Generate Invoice"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </Link>
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

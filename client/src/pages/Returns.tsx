import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Returns() {
  const { data: returns, isLoading } = useQuery({
    queryKey: [api.returns.list.path],
    queryFn: async () => {
      const res = await fetch(api.returns.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch returns");
      return api.returns.list.responses[200].parse(await res.json());
    },
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Returns</h1>
          <p className="text-muted-foreground">Track RTOs and Customer Returns</p>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Return ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : returns?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                    No returns found
                  </TableCell>
                </TableRow>
              ) : (
                returns?.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{item.returnId}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.reason}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'APPROVED' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.createdAt ? format(new Date(item.createdAt), "MMM dd, yyyy") : "-"}
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

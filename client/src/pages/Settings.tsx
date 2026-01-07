import Layout from "@/components/Layout";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettingsSchema, type InsertSettings } from "@shared/schema";
import { useEffect } from "react";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<InsertSettings>({
    resolver: zodResolver(insertSettingsSchema),
  });

  const isSandbox = watch("isSandbox");

  useEffect(() => {
    if (settings) {
      reset({
        sellerName: settings.sellerName,
        sellerAddress: settings.sellerAddress || "",
        gstin: settings.gstin || "",
        flipkartClientId: settings.flipkartClientId || "",
        flipkartClientSecret: settings.flipkartClientSecret || "",
        isSandbox: settings.isSandbox || true,
        logoUrl: settings.logoUrl || "",
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: InsertSettings) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your seller profile and API integrations</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Seller Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sellerName">Seller / Business Name</Label>
                <Input id="sellerName" {...register("sellerName")} placeholder="e.g. My Awesome Shop" />
                {errors.sellerName && <span className="text-xs text-red-500">{errors.sellerName.message}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input id="gstin" {...register("gstin")} placeholder="GSTIN Number" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input id="address" {...register("sellerAddress")} placeholder="123 Market St, City, State" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel mt-6">
            <CardHeader>
              <CardTitle>Flipkart API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Sandbox Mode</Label>
                  <p className="text-sm text-muted-foreground">Use test environment for development</p>
                </div>
                <Switch 
                  checked={isSandbox}
                  onCheckedChange={(checked) => setValue("isSandbox", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">Application ID (Client ID)</Label>
                <Input id="clientId" {...register("flipkartClientId")} type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientSecret">Application Secret (Client Secret)</Label>
                <Input id="clientSecret" {...register("flipkartClientSecret")} type="password" />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-border pt-6">
              <Button type="submit" disabled={updateMutation.isPending} className="shadow-lg shadow-primary/20">
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Configuration
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </Layout>
  );
}

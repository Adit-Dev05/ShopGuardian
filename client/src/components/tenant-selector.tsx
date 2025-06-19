import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
}

interface TenantSelectorProps {
  selectedTenant?: string;
  onTenantChange: (tenantId: string) => void;
}

export default function TenantSelector({ selectedTenant, onTenantChange }: TenantSelectorProps) {
  const { data: tenants = [], isLoading } = useQuery<Tenant[]>({
    queryKey: ['/api/tenants'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-gray-400" />
        <div className="animate-pulse bg-gray-300 h-8 w-32 rounded"></div>
      </div>
    );
  }

  if (tenants.length <= 1) {
    return null; // Don't show selector if only one or no tenants
  }

  return (
    <div className="flex items-center space-x-2">
      <Building2 className="h-4 w-4 text-gray-600" />
      <Select value={selectedTenant} onValueChange={onTenantChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Organizations</SelectItem>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
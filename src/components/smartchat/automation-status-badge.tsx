import { Badge } from '@/components/ui/badge';

export function AutomationStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? 'Ativo' : 'Inativo'}
    </Badge>
  );
}

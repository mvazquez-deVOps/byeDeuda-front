
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { User } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Loader2, Pencil, Eye, Search, Briefcase, Users, DollarSign, Download } from 'lucide-react';
import { EditUserModal } from './edit-user-modal';
import { startImpersonation } from '@/app/actions';
import { getUsersWithFinancials } from '@/lib/admin-actions';
import { useToast } from '../ui/use-toast';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(0)}k`;
    }
    return `$${value}`;
};

export function UserDebtTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        role: 'all',
        plan: 'all',
        priority: 'all',
    });
    
    useEffect(() => {
        setLoading(true);
        getUsersWithFinancials()
            .then(setUsers)
            .catch(err => {
                console.error("Failed to fetch users with financials:", err);
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los datos de los usuarios.' });
            })
            .finally(() => setLoading(false));
    }, [toast]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = searchTerm === '' ||
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = filters.role === 'all' ||
                (filters.role === 'clients' && user.role === 'user') ||
                (filters.role === 'staff' && (user.role === 'agent' || user.role === 'superadmin'));

            const matchesPlan = filters.plan === 'all' ||
                (filters.plan === 'paid' && user.plan !== 'Básico' && user.plan !== 'N/A') ||
                (filters.plan === 'free' && user.plan === 'Básico');

            const matchesPriority = filters.priority === 'all' ||
                (filters.priority === 'high' && (user.totalDebt || 0) > 50000);

            if (filters.role === 'staff' && matchesRole) return true;

            return matchesSearch && matchesRole && matchesPlan && matchesPriority;
        });
    }, [users, searchTerm, filters]);

    const kpiData = useMemo(() => {
        const clients = users.filter(u => u.role === 'user');
        const totalDebt = clients.reduce((acc, user) => acc + (user.totalDebt || 0), 0);
        const paidUsers = clients.filter(u => u.plan !== 'Básico' && u.plan !== 'N/A').length;
        const highValueLeads = clients.filter(u => (u.totalDebt || 0) > 100000).length;
        return { totalDebt, paidUsers, highValueLeads };
    }, [users]);
    
    const exportToCSV = () => {
        const headers = ['Nombre', 'Email', 'Plan', 'Deuda Total', 'Fecha Registro'];
        const csvRows = [
            headers.join(','),
            ...filteredUsers
                .filter(u => u.role === 'user')
                .map(user => [
                    `"${user.name || ''}"`,
                    `"${user.email}"`,
                    `"${user.plan || 'Básico'}"`,
                    user.totalDebt || 0,
                    user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
                ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `reporte_crm_byedeuda_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleImpersonate = async (user: User) => {
        toast({ title: 'Iniciando Modo Espejo...', description: `Navegando como ${user.name}.` });
        try {
            await startImpersonation(user.uid, user.name || 'Usuario sin nombre');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error al suplantar', description: 'No se pudo iniciar el modo espejo.' });
        }
    };
    
    const getPlanBadgeVariant = (plan?: string) => {
        if (!plan || plan === 'N/A') return 'outline';
        if (plan === 'Asesoría Personalizada VIP') return 'default';
        if (plan !== 'Básico') return 'secondary';
        return 'outline';
    };

    const getPlanBadgeClass = (plan?: string) => {
        if (plan === 'Asesoría Personalizada VIP') return 'bg-amber-500/80 text-white border-amber-500/50';
        return '';
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Analizando datos del CRM...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deuda Total Gestionada</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(kpiData.totalDebt)}</div>
                        <p className="text-xs text-muted-foreground">Suma de todas las carteras de clientes.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Premium/VIP</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{kpiData.paidUsers}</div>
                        <p className="text-xs text-muted-foreground">Clientes con suscripciones activas.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leads de Alto Valor</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpiData.highValueLeads}</div>
                        <p className="text-xs text-muted-foreground">Clientes con carteras superiores a $100k.</p>
                    </CardContent>
                </Card>
            </div>
        
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Base de Datos de Clientes</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Filtra, ordena y gestiona todos los usuarios.</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Input
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-[250px] pl-10"
                            />
                            <Button onClick={exportToCSV} variant="outline"><Download className="mr-2" /> Exportar CSV</Button>
                        </div>
                    </div>
                     <Tabs value={filters.role} onValueChange={(value) => setFilters(f => ({...f, role: value}))} className="mt-4">
                        <TabsList>
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="clients">Clientes</TabsTrigger>
                            <TabsTrigger value="staff">Staff</TabsTrigger>
                            <TabsTrigger value="paid">Solo Pagados</TabsTrigger>
                            <TabsTrigger value="high">Alto Valor</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                     {filteredUsers.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg">
                            <h3 className="text-xl font-semibold text-primary">No se encontraron usuarios</h3>
                            <p className="text-muted-foreground mt-2">Intenta con otra búsqueda o ajusta los filtros.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Usuario</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Cartera (Prioridad)</TableHead>
                                    <TableHead>Detalle</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map(user => (
                                    <TableRow key={user.uid}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                    <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div>{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getPlanBadgeVariant(user.plan)} className={cn('capitalize', getPlanBadgeClass(user.plan))}>
                                                {user.plan || 'Básico'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={cn("font-semibold", (user.totalDebt || 0) > 100000 && "text-destructive")}>
                                            {formatCurrency(user.totalDebt || 0)}
                                        </TableCell>
                                        <TableCell>{user.debtCount} Deudas</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => handleImpersonate(user)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Ver como usuario</p></TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                         <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Editar usuario</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {selectedUser && (
                <EditUserModal 
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    user={selectedUser}
                />
            )}
        </div>
    );
}

    
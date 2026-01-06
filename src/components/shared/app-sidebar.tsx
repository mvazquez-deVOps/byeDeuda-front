
'use client';

import React, { useState } from 'react';
import Logo from './logo';
import { useAuth, setSessionCookie } from '../auth/auth-provider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  User,
  ChevronDown,
  UserPlus,
  Users,
  BookOpen,
  LifeBuoy,
  FileScan,
  Mail,
  Swords,
  Inbox,
  ChevronLeft,
  ChevronRight,
  PenSquare
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/init-firebase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['user', 'agent', 'superadmin'] },
  { href: '/dashboard/inbox', icon: Mail, label: 'Buzón', roles: ['user'], badge: '3' },
  { href: '/dashboard/legal-assistant', icon: MessageSquare, label: 'Asistente Legal', roles: ['user'] },
  { href: '/dashboard/legal-shield', icon: FileScan, label: 'Escudo Legal', roles: ['user'] },
  { href: '/dashboard/dojo', icon: Swords, label: 'Dojo de Negociación', roles: ['user'] },
  { href: '/dashboard/community', icon: Users, label: 'Comunidad', roles: ['user'] },
  { href: '/dashboard/education', icon: BookOpen, label: 'Educación', roles: ['user'] },
  { href: '/dashboard/subscription', icon: CreditCard, label: 'Suscripción', roles: ['user'] },
  { href: '/dashboard/support', icon: LifeBuoy, label: 'Soporte', roles: ['user'] },
  { href: '/admin', icon: Shield, label: 'Panel de Admin', roles: ['superadmin'] },
  { href: '/admin/inbox', icon: Inbox, label: 'Buzón Maestro', roles: ['superadmin', 'agent'] },
  { href: '/admin/agents', icon: UserPlus, label: 'Crear Usuario', roles: ['superadmin'] },
  { href: '/admin/content', icon: PenSquare, label: 'Gestor de Contenido', roles: ['superadmin'] },
];

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    await setSessionCookie(null);
    router.push('/login');
  };

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuario';
  }

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  if (!user) return null;

  const getVisibleNavItems = () => {
    return navItems.filter(item => user.role && item.roles.includes(user.role));
  }
  
  const displayName = getDisplayName();

  return (
    <div className={cn("relative flex flex-col h-full bg-card border-r border-border transition-all duration-300", isCollapsed ? 'w-20' : 'w-64')}>
        <div className="flex items-center justify-between p-4 border-b border-border h-20">
            {!isCollapsed && <Logo />}
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="shrink-0">
                {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
        </div>
      
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <ul className="flex flex-col gap-2">
          <TooltipProvider>
            {getVisibleNavItems().map((item) => (
                <li key={item.href}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href={item.href}>
                                <Button 
                                    variant={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) ? 'secondary' : 'ghost'} 
                                    className={cn("w-full justify-start", isCollapsed && "justify-center")}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                                    {!isCollapsed && item.badge && <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">{item.badge}</span>}
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        {isCollapsed && (
                            <TooltipContent side="right">
                                <p>{item.label}</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </li>
            ))}
          </TooltipProvider>
        </ul>
      </nav>

        <div className="p-4 border-t border-border">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start items-center gap-3 p-2 h-auto text-left">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatarUrl} alt={displayName} />
                            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                        </Avatar>
                        {!isCollapsed && (
                            <div className="flex flex-col text-sm overflow-hidden">
                                <span className="font-medium truncate">{displayName}</span>
                                <span className="text-muted-foreground/80 text-xs truncate">{user.email}</span>
                            </div>
                        )}
                        {!isCollapsed && <ChevronDown className="ml-auto w-4 h-4 text-foreground/70" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Configuración</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, ClipboardCheck, LogOut, Menu, X, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

interface AdminLayoutProps {
    onLogout: () => void;
}

export default function AdminLayout({ onLogout }: AdminLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: "/admin/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
        { path: "/admin/classes", icon: BookOpen, label: "Quản lý lớp học" },
        { path: "/admin/students", icon: Users, label: "Quản lý học viên" },
        { path: "/admin/sessions", icon: Calendar, label: "Quản lý ca học" },
        { path: "/admin/attendance", icon: ClipboardCheck, label: "Xem điểm danh" },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-white">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        Hệ thống
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Quản trị viên</p>
                </div>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-400" onClick={() => setIsMobileOpen(false)}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsMobileOpen(false)}>
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </div>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <Button
                    variant="destructive"
                    className="w-full justify-start gap-3 bg-slate-800 hover:bg-red-600 text-white border-0"
                    onClick={onLogout}
                >
                    <LogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex transition-all duration-300">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:block fixed inset-y-0 z-50 w-64 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="h-full">
                    <SidebarContent />
                </div>
            </aside>

            {/* Mobile Sidebar (Sheet) */}
            <div className="md:hidden">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetContent side="left" className="p-0 w-64 border-r-0">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content Wrapper */}
            <div
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : "md:ml-0"
                    }`}
            >
                {/* Header (Both Mobile and Desktop) */}
                <header className="bg-white h-16 border-b px-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-3">
                        {/* Toggle Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (window.innerWidth >= 768) {
                                    setSidebarOpen(!isSidebarOpen);
                                } else {
                                    setIsMobileOpen(true);
                                }
                            }}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <span className="font-semibold text-gray-800 text-lg">Quản trị hệ thống</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

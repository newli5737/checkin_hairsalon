import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Users, Calendar, CheckCircle2, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Tổng quan</h2>
                    <p className="text-muted-foreground mt-1">Chào mừng quay trở lại hệ thống quản trị.</p>
                </div>
                <Button onClick={() => navigate("/admin/students")} className="bg-indigo-600 hover:bg-indigo-700">
                    Thêm học viên mới
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow border-t-4 border-t-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Tổng học viên
                        </CardTitle>
                        <div className="p-2 bg-indigo-50 rounded-full">
                            <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">120</div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span className="text-green-600 font-medium">+12%</span> so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-t-4 border-t-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Ca học hôm nay
                        </CardTitle>
                        <div className="p-2 bg-green-50 rounded-full">
                            <Calendar className="w-4 h-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">3</div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span className="text-gray-600 font-medium">Đang diễn ra: 1</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-t-4 border-t-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Tỷ lệ điểm danh
                        </CardTitle>
                        <div className="p-2 bg-blue-50 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">95%</div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span className="text-green-600 font-medium">+5%</span> so với hôm qua
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <h3 className="text-lg font-semibold text-gray-900 mt-4">Truy cập nhanh</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-gray-600 hover:text-indigo-700"
                    onClick={() => navigate("/admin/students")}
                >
                    <Users className="w-6 h-6" />
                    <span className="font-medium">Quản lý học viên</span>
                </Button>

                <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:border-green-500 hover:bg-green-50 transition-all text-gray-600 hover:text-green-700"
                    onClick={() => navigate("/admin/sessions")}
                >
                    <Calendar className="w-6 h-6" />
                    <span className="font-medium">Quản lý ca học</span>
                </Button>

                <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-700"
                    onClick={() => navigate("/admin/attendance")}
                >
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-medium">Xem điểm danh</span>
                </Button>

                <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:border-purple-500 hover:bg-purple-50 transition-all text-gray-600 hover:text-purple-700"
                    onClick={() => navigate("/")}
                >
                    <ArrowRight className="w-6 h-6" />
                    <span className="font-medium">Vào trang Học viên</span>
                </Button>
            </div>
        </div>
    );
}

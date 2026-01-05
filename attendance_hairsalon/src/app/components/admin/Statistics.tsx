import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { statisticsApi, trainingClassApi } from "../../services/api";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Navigation,
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import { Skeleton } from "../ui/skeleton";

interface OverviewStats {
  startDate: string;
  endDate: string;
  totalSessions: number;
  totalAttendances: number;
  onTimeCount: number;
  lateCount: number;
  farCheckInCount: number;
  onTimeRate: number;
  lateRate: number;
  farCheckInRate: number;
}

interface AbsenceStudent {
  student: {
    id: string;
    studentCode: string;
    fullName: string;
    avatarUrl?: string;
  };
  class: {
    id: string;
    name: string;
    code: string;
  };
  absentDays: number;
  totalDays: number;
  attendanceRate: number;
}

interface FarCheckInStudent {
  student: {
    id: string;
    studentCode: string;
    fullName: string;
    avatarUrl?: string;
  };
  class: {
    id: string;
    name: string;
    code: string;
  };
  totalFarCheckIns: number;
  maxDistance: number;
  avgDistance: number;
  farCheckIns: Array<{
    date: string;
    sessionName: string;
    checkInTime: string;
    locationNote: string;
    distance: number;
  }>;
}

export default function Statistics() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  // Date range - default to this week
  const [startDate, setStartDate] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));

  // Stats data
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [absenceStats, setAbsenceStats] = useState<AbsenceStudent[]>([]);
  const [farCheckInStats, setFarCheckInStats] = useState<FarCheckInStudent[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate, selectedClassId]);

  const fetchClasses = async () => {
    try {
      const data = await trainingClassApi.getAll();
      setClasses(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách lớp học");
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      const classId = selectedClassId === "all" ? undefined : selectedClassId;

      const [overviewData, absenceData, farData] = await Promise.all([
        statisticsApi.getOverview(startDate, endDate, classId),
        statisticsApi.getWeeklyAbsence(startDate, endDate, classId),
        statisticsApi.getFarCheckIns(startDate, endDate, classId),
      ]);

      setOverview(overviewData);
      setAbsenceStats(absenceData.students || []);
      setFarCheckInStats(farData.students || []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  const setDateRange = (range: 'today' | 'week' | 'month') => {
    const today = new Date();
    switch (range) {
      case 'today':
        setStartDate(format(today, 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'week':
        setStartDate(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        break;
      case 'month':
        setStartDate(format(subDays(today, 30), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
    }
  };

  if (loading && !overview) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            Thống kê & Báo cáo
          </h1>
          <p className="text-gray-500 mt-1">Phân tích hiệu suất điểm danh học viên</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={startDate === format(new Date(), 'yyyy-MM-dd') ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange('today')}
          >
            Hôm nay
          </Button>
          <Button
            variant={startDate === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange('week')}
          >
            Tuần này
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRange('month')}
          >
            30 ngày
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-indigo-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Lớp học</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả lớp</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng ca học</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalSessions}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đúng giờ</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {overview.onTimeRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{overview.onTimeCount} lượt</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đi muộn</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {overview.lateRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{overview.lateCount} lượt</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Check-in xa</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {overview.farCheckInRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{overview.farCheckInCount} lượt</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Absence Stats */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="w-5 h-5" />
            Học viên vắng mặt nhiều nhất
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {absenceStats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <XCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Không có dữ liệu vắng mặt</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {absenceStats.slice(0, 6).map((stat) => (
                <Card key={stat.student.id} className="border hover:border-red-300 transition-colors hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {stat.student.avatarUrl ? (
                          <img src={stat.student.avatarUrl} alt={stat.student.fullName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <Users className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{stat.student.fullName}</h4>
                        <p className="text-xs text-gray-500">{stat.student.studentCode}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {stat.class.name}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Vắng mặt:</span>
                        <span className="font-bold text-red-600">{stat.absentDays}/{stat.totalDays} ngày</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${((stat.totalDays - stat.absentDays) / stat.totalDays) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-gray-500">
                        Tỷ lệ có mặt: {stat.attendanceRate.toFixed(1)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Far Check-in Stats */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Navigation className="w-5 h-5" />
            Học viên check-in xa lớp học
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {farCheckInStats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Tất cả học viên đều check-in đúng vị trí</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farCheckInStats.slice(0, 6).map((stat) => (
                <Card key={stat.student.id} className="border hover:border-amber-300 transition-colors hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {stat.student.avatarUrl ? (
                          <img src={stat.student.avatarUrl} alt={stat.student.fullName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <MapPin className="w-6 h-6 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{stat.student.fullName}</h4>
                        <p className="text-xs text-gray-500">{stat.student.studentCode}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {stat.class.name}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Số lần:</span>
                        <Badge className="bg-amber-500">{stat.totalFarCheckIns}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Xa nhất:</span>
                        <span className="font-bold text-amber-700">{stat.maxDistance}m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Trung bình:</span>
                        <span className="font-semibold text-gray-700">{stat.avgDistance}m</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

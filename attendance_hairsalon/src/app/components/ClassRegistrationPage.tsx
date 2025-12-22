import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { trainingClassApi, studentApi } from '../services/api';

const ClassRegistrationPage = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const data = await trainingClassApi.getAll();
            setClasses(data);
        } catch (error) {
            console.error('Failed to fetch classes', error);
            toast.error('Không thể tải danh sách lớp học');
        }
    };

    const handleRegister = async () => {
        if (!selectedClass) {
            toast.error('Vui lòng chọn lớp học');
            return;
        }

        setIsLoading(true);
        try {
            await studentApi.updateProfile({
                trainingClassId: selectedClass
            });

            toast.success('Đăng ký lớp học thành công');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Đăng ký lớp học thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Đăng ký lớp học</CardTitle>
                    <CardDescription>
                        Bạn chưa tham gia lớp học nào. Vui lòng chọn lớp để tiếp tục.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Lớp học</Label>
                            <Select onValueChange={setSelectedClass} value={selectedClass}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn lớp học" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.location} - {cls.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleRegister} disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ClassRegistrationPage;

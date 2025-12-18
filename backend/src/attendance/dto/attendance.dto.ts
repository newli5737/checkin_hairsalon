import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CheckInDto {
    @IsString()
    @IsNotEmpty({ message: 'Session ID không được để trống' })
    sessionId: string;

    @IsString()
    @IsNotEmpty({ message: 'Ảnh khuôn mặt không được để trống' })
    imageBase64: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Vĩ độ không được để trống' })
    lat: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Kinh độ không được để trống' })
    lng: number;
}

export class CheckOutDto {
    @IsString()
    @IsNotEmpty({ message: 'Session ID không được để trống' })
    sessionId: string;

    @IsString()
    @IsNotEmpty({ message: 'Ảnh khuôn mặt không được để trống' })
    imageBase64: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Vĩ độ không được để trống' })
    lat: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Kinh độ không được để trống' })
    lng: number;
}

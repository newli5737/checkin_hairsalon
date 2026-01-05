import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Res, Req, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.login(loginDto);
        this.setTokenCookies(res, result.accessToken, result.refreshToken);
        return { user: result.user };
    }

    @Post('register')
    async register(
        @Body() registerDto: any,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.register(registerDto);
        this.setTokenCookies(res, result.accessToken, result.refreshToken);
        return { user: result.user };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const refreshToken = (req as any).cookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token');
        }

        const { accessToken } = await this.authService.refreshAccessToken(refreshToken);

        const isProduction = process.env.NODE_ENV === 'production';

        const cookieOptions = {
            httpOnly: true,
            secure: isProduction, // true in production, false in development
            sameSite: isProduction ? 'none' as const : 'lax' as const, // 'none' for cross-origin in production, 'lax' for localhost
            maxAge: 30 * 60 * 1000, // 30 minutes
        };

        res.cookie('accessToken', accessToken, cookieOptions);

        return { message: 'Token refreshed' };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const refreshToken = (req as any).cookies?.refreshToken;

        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return { message: 'Đăng xuất thành công' };
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async changePassword(@Request() req, @Body() body: any) {
        return this.authService.changePassword(req.user.userId, body);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    private setTokenCookies(
        res: Response,
        accessToken: string,
        refreshToken: string
    ) {
        const isProduction = process.env.NODE_ENV === 'production';

        const cookieOptions = {
            httpOnly: true,
            secure: isProduction, // true in production, false in development
            sameSite: isProduction ? 'none' as const : 'lax' as const, // 'none' for cross-origin in production, 'lax' for localhost
        };

        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 30 * 60 * 1000, // 30 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
}

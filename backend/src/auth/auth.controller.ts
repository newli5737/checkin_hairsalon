import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Request, UnauthorizedException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto, @Request() req, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(loginDto);

        // Detect if we are on HTTPS (Cloudflare Tunnel)
        const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

        const cookieOptions: any = {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax', // 'none' is mandatory for cross-site cookies over HTTPS
            path: '/',
            maxAge: 30 * 60 * 1000 // 30 mins
        };

        // If it's HTTPS but not recognized as secure by Express, force it if we see the header
        if (req.headers['x-forwarded-proto'] === 'https' || req.headers['host']?.includes('cloudflare')) {
            cookieOptions.secure = true;
            cookieOptions.sameSite = 'none';
        }

        res.cookie('accessToken', result.accessToken, cookieOptions);
        res.cookie('refreshToken', result.refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days for persistent session
        });

        return {
            user: result.user,
            message: 'Đăng nhập thành công'
        };
    }

    @Post('register')
    async register(@Body() registerDto: any, @Request() req, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register(registerDto);

        const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

        const cookieOptions: any = {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax',
            path: '/',
            maxAge: 30 * 60 * 1000
        };

        if (req.headers['x-forwarded-proto'] === 'https' || req.headers['host']?.includes('cloudflare')) {
            cookieOptions.secure = true;
            cookieOptions.sameSite = 'none';
        }

        res.cookie('accessToken', result.accessToken, cookieOptions);
        res.cookie('refreshToken', result.refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        return {
            user: result.user,
            message: 'Đăng ký thành công'
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Request() req: any, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token');
        }

        const { accessToken } = await this.authService.refreshAccessToken(refreshToken);

        const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

        const cookieOptions: any = {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax',
            path: '/',
            maxAge: 30 * 60 * 1000
        };

        if (req.headers['x-forwarded-proto'] === 'https' || req.headers['host']?.includes('cloudflare')) {
            cookieOptions.secure = true;
            cookieOptions.sameSite = 'none';
        }

        res.cookie('accessToken', accessToken, cookieOptions);

        return {
            message: 'Token refreshed'
        };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req: any, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refreshToken'];
        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        // Clear cookies
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });

        return { message: 'Đăng xuất thành công' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getMe(@Request() req: any) {
        return this.authService.getMe(req.user.userId);
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
}

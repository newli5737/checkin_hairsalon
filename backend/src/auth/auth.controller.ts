import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
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
    async login(@Body() loginDto: LoginDto) {
        const result = await this.authService.login(loginDto);
        // Return tokens in response body instead of cookies
        return {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        };
    }

    @Post('register')
    async register(@Body() registerDto: any) {
        const result = await this.authService.register(registerDto);
        // Return tokens in response body instead of cookies
        return {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() body: { refreshToken: string }) {
        if (!body.refreshToken) {
            throw new UnauthorizedException('No refresh token');
        }

        const { accessToken } = await this.authService.refreshAccessToken(body.refreshToken);

        return {
            accessToken,
            message: 'Token refreshed'
        };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@Body() body: { refreshToken: string }) {
        if (body.refreshToken) {
            await this.authService.logout(body.refreshToken);
        }

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
}

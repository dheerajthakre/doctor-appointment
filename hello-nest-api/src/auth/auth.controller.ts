@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req, @Query('role') role: UserRole) {
    return this.authService.googleLogin(req.user, role);
  }
}

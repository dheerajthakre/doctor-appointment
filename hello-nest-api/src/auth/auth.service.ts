@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async googleLogin(profile, role: UserRole) {
    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      user = await this.usersService.createUser({
        email: profile.email,
        name: profile.name,
        googleId: profile.googleId,
        role,
      });
    }

    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    return {
      accessToken: token,
      user,
    };
  }
}

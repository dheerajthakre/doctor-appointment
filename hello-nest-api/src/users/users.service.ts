@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  createUser(data: Partial<User>) {
    return this.userRepo.save(data);
  }

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }
}

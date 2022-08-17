export interface IAccountService {
  getUsername(): string
  setUsername(username: string): void
  getPassword(): string
  setPassword(password: string): void
  getHost(): string
  setHost(host: string): void
  getPort(): number
  setPort(port: number): void
  getLocalDataPath(): string
  setLocalDataPath(path: string): void
}

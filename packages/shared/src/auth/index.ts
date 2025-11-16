import type { JWTPayload, AuthUser, GoogleOAuthUser } from '../types/index.js'

export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class AuthUtils {
  private static JWT_SECRET: string

  static init(jwtSecret: string) {
    this.JWT_SECRET = jwtSecret
  }

  /**
   * Google OAuth ユーザー情報からAuthUserを作成
   */
  static mapGoogleUserToAuthUser(googleUser: GoogleOAuthUser, role: 'member' | 'admin' = 'member'): AuthUser {
    return {
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      avatar_url: googleUser.picture,
      role
    }
  }

  /**
   * メールアドレスの有効性をチェック
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * JWTペイロードを作成
   */
  static createJWTPayload(user: AuthUser, expiresInSeconds: number = 24 * 60 * 60): JWTPayload {
    const now = Math.floor(Date.now() / 1000)
    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + expiresInSeconds
    }
  }

  /**
   * 管理者権限をチェック
   */
  static isAdmin(user: AuthUser): boolean {
    return user.role === 'admin'
  }

  /**
   * ユーザーがアクティブかチェック
   */
  static isActiveUser(user: { is_active: boolean }): boolean {
    return user.is_active === true
  }

  /**
   * セキュアなランダム文字列を生成
   */
  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * パスワードレスでのセキュアトークン生成
   */
  static generateSecureToken(): string {
    return this.generateRandomString(64)
  }
}

/**
 * Google OAuth設定
 */
export interface GoogleOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

/**
 * Google OAuth URLを生成
 */
export function createGoogleOAuthUrl(config: GoogleOAuthConfig, state?: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  })

  if (state) {
    params.set('state', state)
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Google OAuth トークン交換
 */
export async function exchangeGoogleOAuthCode(
  code: string, 
  config: GoogleOAuthConfig
): Promise<{ access_token: string; id_token?: string }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    throw new AuthError('Failed to exchange OAuth code', 'OAUTH_EXCHANGE_FAILED')
  }

  return response.json()
}

/**
 * Google ユーザー情報を取得
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleOAuthUser> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new AuthError('Failed to get user info', 'USER_INFO_FAILED')
  }

  return response.json()
}
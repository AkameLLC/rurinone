import type { 
  User, 
  StreamerProfile, 
  StreamStatus, 
  News, 
  ApprovedEmail,
  DatabaseResult 
} from '../types/index.js'

/**
 * CloudFlare D1 データベースクライアント
 */
export class DatabaseClient {
  constructor(private db: any) {} // CloudFlare D1 database binding

  /**
   * ユーザー関連の操作
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first()
    
    return result || null
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(id).first()
    
    return result || null
  }

  async createUser(user: Omit<User, 'created_at'>): Promise<DatabaseResult> {
    return await this.db.prepare(
      `INSERT INTO users (id, email, name, avatar_url, role, is_active, last_login) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      user.id,
      user.email, 
      user.name,
      user.avatar_url || null,
      user.role,
      user.is_active,
      user.last_login || null
    ).run()
  }

  async updateUserLastLogin(id: string): Promise<DatabaseResult> {
    return await this.db.prepare(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(id).run()
  }

  async updateUser(id: string, updates: Partial<User>): Promise<DatabaseResult> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updates)
    
    return await this.db.prepare(
      `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(...values, id).run()
  }

  /**
   * 承認済みメールアドレス関連の操作
   */
  async isEmailApproved(email: string): Promise<boolean> {
    const result = await this.db.prepare(
      'SELECT 1 FROM approved_emails WHERE email = ?'
    ).bind(email).first()
    
    return !!result
  }

  async addApprovedEmail(email: string, approvedBy?: string, notes?: string): Promise<DatabaseResult> {
    return await this.db.prepare(
      'INSERT INTO approved_emails (email, approved_by, notes) VALUES (?, ?, ?)'
    ).bind(email, approvedBy || null, notes || null).run()
  }

  async getApprovedEmails(): Promise<ApprovedEmail[]> {
    const result = await this.db.prepare(
      'SELECT * FROM approved_emails ORDER BY approved_at DESC'
    ).all()
    
    return result.results || []
  }

  /**
   * 配信者プロフィール関連の操作
   */
  async getStreamerProfiles(): Promise<StreamerProfile[]> {
    const result = await this.db.prepare(`
      SELECT sp.*, u.name as user_name, u.email as user_email
      FROM streamer_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
      ORDER BY sp.created_at DESC
    `).all()
    
    return result.results || []
  }

  async getStreamerProfileById(id: number): Promise<StreamerProfile | null> {
    const result = await this.db.prepare(
      'SELECT * FROM streamer_profiles WHERE id = ?'
    ).bind(id).first()
    
    return result || null
  }

  async getStreamerProfileByUserId(userId: string): Promise<StreamerProfile | null> {
    const result = await this.db.prepare(
      'SELECT * FROM streamer_profiles WHERE user_id = ?'
    ).bind(userId).first()
    
    return result || null
  }

  async createStreamerProfile(profile: Omit<StreamerProfile, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult> {
    return await this.db.prepare(`
      INSERT INTO streamer_profiles (
        user_id, display_name, description, avatar_url, 
        twitter_handle, youtube_channel, twitch_channel, join_phase
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      profile.user_id,
      profile.display_name,
      profile.description || null,
      profile.avatar_url || null,
      profile.twitter_handle || null,
      profile.youtube_channel || null,
      profile.twitch_channel || null,
      profile.join_phase
    ).run()
  }

  async updateStreamerProfile(id: number, updates: Partial<StreamerProfile>): Promise<DatabaseResult> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updates)
    
    return await this.db.prepare(
      `UPDATE streamer_profiles SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(...values, id).run()
  }

  /**
   * 配信状態関連の操作
   */
  async getStreamStatus(streamerId: number): Promise<StreamStatus | null> {
    const result = await this.db.prepare(
      'SELECT * FROM stream_status WHERE streamer_id = ?'
    ).bind(streamerId).first()
    
    return result || null
  }

  async updateStreamStatus(streamerId: number, status: Partial<StreamStatus>): Promise<DatabaseResult> {
    const existing = await this.getStreamStatus(streamerId)
    
    if (existing) {
      const fields = Object.keys(status).map(key => `${key} = ?`).join(', ')
      const values = Object.values(status)
      
      return await this.db.prepare(
        `UPDATE stream_status SET ${fields}, last_updated = CURRENT_TIMESTAMP WHERE streamer_id = ?`
      ).bind(...values, streamerId).run()
    } else {
      return await this.db.prepare(`
        INSERT INTO stream_status (
          streamer_id, is_live, platform, title, viewer_count, stream_url
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        streamerId,
        status.is_live || false,
        status.platform || null,
        status.title || null,
        status.viewer_count || null,
        status.stream_url || null
      ).run()
    }
  }

  /**
   * ニュース関連の操作
   */
  async getPublishedNews(): Promise<News[]> {
    const result = await this.db.prepare(`
      SELECT n.*, u.name as author_name
      FROM news n
      JOIN users u ON n.created_by = u.id
      WHERE n.published = true
      ORDER BY n.created_at DESC
    `).all()
    
    return result.results || []
  }

  async getNewsById(id: number): Promise<News | null> {
    const result = await this.db.prepare(
      'SELECT * FROM news WHERE id = ?'
    ).bind(id).first()
    
    return result || null
  }

  async getNewsBySlug(slug: string): Promise<News | null> {
    const result = await this.db.prepare(
      'SELECT * FROM news WHERE slug = ? AND published = true'
    ).bind(slug).first()
    
    return result || null
  }

  async createNews(news: Omit<News, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult> {
    return await this.db.prepare(`
      INSERT INTO news (
        title, slug, content, excerpt, featured_image, published, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      news.title,
      news.slug,
      news.content,
      news.excerpt || null,
      news.featured_image || null,
      news.published,
      news.created_by
    ).run()
  }

  async updateNews(id: number, updates: Partial<News>): Promise<DatabaseResult> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updates)
    
    return await this.db.prepare(
      `UPDATE news SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(...values, id).run()
  }

  async deleteNews(id: number): Promise<DatabaseResult> {
    return await this.db.prepare(
      'DELETE FROM news WHERE id = ?'
    ).bind(id).run()
  }
}

/**
 * データベース接続のファクトリ関数
 */
export function createDatabaseClient(db: any): DatabaseClient {
  return new DatabaseClient(db)
}
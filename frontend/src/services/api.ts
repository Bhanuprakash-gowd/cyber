import { ScanResult, ThreatArticle, CommunityReport, SystemStats, AppNotification } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        let errMessage = `HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch (_) {}
        throw new Error(errMessage);
      }
      return await response.json();
    } catch (error: any) {
      console.error(`API Error on ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Health
  async getHealth(): Promise<any> {
    return this.request('/api/health');
  }

  // Scanners
  async analyzeUrl(url: string, userId?: string): Promise<ScanResult> {
    return this.request('/api/analyze-url', {
      method: 'POST',
      body: JSON.stringify({ url, user_id: userId })
    });
  }

  async analyzeEmail(text: string, channel: string = 'email', userId?: string): Promise<ScanResult> {
    return this.request('/api/analyze-email', {
      method: 'POST',
      body: JSON.stringify({ text, channel, user_id: userId })
    });
  }

  // History & Reports
  async getHistory(userId?: string): Promise<{ scans: ScanResult[]; count: number }> {
    const query = userId ? `?user_id=${userId}` : '';
    return this.request(`/api/history${query}`);
  }

  async getReport(scanId: string): Promise<ScanResult> {
    return this.request(`/api/report/${scanId}`);
  }

  async deleteScan(scanId: string, userId?: string): Promise<any> {
    const query = userId ? `?user_id=${userId}` : '';
    return this.request(`/api/history/${scanId}${query}`, { method: 'DELETE' });
  }

  // Stats & Analytics
  async getStats(): Promise<SystemStats> {
    return this.request('/api/stats');
  }

  async getAnalytics(): Promise<any> {
    return this.request('/api/analytics');
  }

  // News
  async getThreatNews(category?: string, search?: string): Promise<{ articles: ThreatArticle[]; count: number }> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    return this.request(`/api/news?${params.toString()}`);
  }

  async getSingleNews(id: string): Promise<ThreatArticle> {
    return this.request(`/api/news/${id}`);
  }

  // Community
  async getCommunityReports(status?: string, category?: string): Promise<{ reports: CommunityReport[]; count: number }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category && category !== 'All') params.append('category', category);
    return this.request(`/api/community/reports?${params.toString()}`);
  }

  async submitCommunityReport(data: Partial<CommunityReport>, userId?: string): Promise<any> {
    return this.request('/api/community/reports', {
      method: 'POST',
      body: JSON.stringify({ ...data, user_id: userId })
    });
  }

  async flagCommunityReport(reportId: string): Promise<any> {
    return this.request(`/api/community/reports/${reportId}/flag`, { method: 'POST' });
  }

  async moderateReport(reportId: string, status: string, adminSecret: string): Promise<any> {
    return this.request(`/api/community/reports/${reportId}/moderate`, {
      method: 'POST',
      headers: { 'X-Admin-Secret': adminSecret },
      body: JSON.stringify({ status })
    });
  }

  // AI Assistant
  async sendChatMessage(message: string, context?: any, history?: any[]): Promise<{ reply: string; source: string; model?: string }> {
    return this.request('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context, history })
    });
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: AppNotification[]; count: number }> {
    return this.request('/api/notifications');
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request(`/api/notifications/${id}/read`, { method: 'POST' });
  }

  // Admin Feeds
  async getFeedSources(): Promise<any> {
    return this.request('/api/feed-sources');
  }

  async syncFeedSources(): Promise<any> {
    return this.request('/api/feed-sources/sync', { method: 'POST' });
  }

  // Model Info
  async getModelInfo(): Promise<any> {
    return this.request('/api/model/info');
  }

  // Export URLs
  getExportCsvUrl(userId?: string): string {
    return `${API_BASE}/api/export/csv${userId ? `?user_id=${userId}` : ''}`;
  }

  getExportPdfUrl(scanId: string): string {
    return `${API_BASE}/api/export/pdf/${scanId}`;
  }
}

export const api = new ApiService();

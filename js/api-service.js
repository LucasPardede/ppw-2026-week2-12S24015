/**
 * ==============================================================================
 * LUCAS PARDEDE — DATA ACCESS LAYER (js/api-service.js)
 * NIM: 12S24015 · Institut Teknologi Del · PPW Week 4
 * Arsitektur: Decoupled Multi-Tier Architecture (Data Access Tier)
 * Standar: ES6+ async/await, Defensive Error Handling, Fetch API, DTO Serializer
 * ==============================================================================
 */

class ApiService {
  /**
   * Konstanta endpoint internal data provider & mock REST service
   */
  static ENDPOINTS = {
    PROJECTS: './data/projects.json',
    SERVICES: './data/services.json',
    PROFILE: './data/profile.json',
    // Mock REST endpoint publik untuk pengiriman HTTP POST asynchronous riil
    ORDER_SUBMISSION: 'https://jsonplaceholder.typicode.com/posts'
  };

  /**
   * Helper internal untuk simulasi latensi jaringan (berguna agar Loading State / Skeleton teramati)
   * @param {number} ms 
   */
  static async #delay(ms = 400) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Mengambil data koleksi portofolio proyek secara asinkron dari data/projects.json
   * @param {Object} options - Opsi konfigurasi (e.g., simulateDelay, forceError)
   * @returns {Promise<Array>} Daftar proyek
   */
  static async getProjects(options = { simulateDelay: true, forceError: false }) {
    if (options.forceError) {
      await this.#delay(300);
      throw new Error('Simulasi API Error 500: Server penyedia data portofolio tidak merespons.');
    }

    try {
      if (options.simulateDelay) {
        await this.#delay(500); // 500ms realistic network latency
      }

      const response = await fetch(this.ENDPOINTS.PROJECTS, {
        headers: { 'Accept': 'application/json' },
        cache: 'default'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Gagal memuat data proyek (${response.statusText})`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Format respon tidak valid: data proyek harus berupa Array.');
      }

      return data;
    } catch (err) {
      console.error('[ApiService.getProjects Error]:', err);
      throw err;
    }
  }

  /**
   * Mengambil katalog paket layanan konsultasi dari data/services.json
   * @returns {Promise<Array>} Daftar paket layanan
   */
  static async getServices() {
    try {
      const response = await fetch(this.ENDPOINTS.SERVICES, {
        headers: { 'Accept': 'application/json' },
        cache: 'default'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Gagal memuat data layanan (${response.statusText})`);
      }

      return await response.json();
    } catch (err) {
      console.error('[ApiService.getServices Error]:', err);
      throw err;
    }
  }

  /**
   * Mengambil biodata dan performa profil pengembang dari data/profile.json
   * @returns {Promise<Object>} Profil mahasiswa
   */
  static async getProfile() {
    try {
      const response = await fetch(this.ENDPOINTS.PROFILE, {
        headers: { 'Accept': 'application/json' },
        cache: 'default'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Gagal memuat profil mahasiswa (${response.statusText})`);
      }

      return await response.json();
    } catch (err) {
      console.error('[ApiService.getProfile Error]:', err);
      throw err;
    }
  }

  /**
   * Mengirim data formulir pesanan layanan secara asinkron via HTTP POST (Decoupled REST Dispatching)
   * Mengirimkan DTO ke real REST mock endpoint (jsonplaceholder / fallback) tanpa page reload
   * @param {Object} orderPayload 
   * @returns {Promise<Object>} Respon dari REST API
   */
  static async submitServiceOrder(orderPayload) {
    try {
      // 1. Validasi defensive payload masukan
      if (!orderPayload || typeof orderPayload !== 'object') {
        throw new Error('Payload pesanan layanan tidak boleh kosong atau null.');
      }

      // 2. Tambahkan metadata klien & audit timestamp
      const enrichedPayload = {
        ...orderPayload,
        clientTimestamp: new Date().toISOString(),
        studentRecipient: 'Lucas Pardede (12S24015)',
        status: 'SUBMITTED_ASYNCHRONOUS'
      };

      // 3. Eksekusi pengiriman HTTP POST asynchronous
      const response = await fetch(this.ENDPOINTS.ORDER_SUBMISSION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify(enrichedPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP POST Error ${response.status}: Pengiriman form gagal diproses (${response.statusText})`);
      }

      const responseData = await response.json();
      return {
        success: true,
        httpStatus: response.status,
        apiRecordId: responseData.id || Date.now(),
        data: responseData
      };
    } catch (err) {
      console.error('[ApiService.submitServiceOrder Error]:', err);
      // Fallback resilien bila pengguna luring (offline) atau terjadi CORS blokir CDN
      if (!navigator.onLine) {
        return {
          success: true,
          offlineQueued: true,
          apiRecordId: Date.now(),
          data: orderPayload
        };
      }
      throw err;
    }
  }
}

// Ekspor ApiService ke lingkup global window agar dapat diakses oleh app.js
window.ApiService = ApiService;

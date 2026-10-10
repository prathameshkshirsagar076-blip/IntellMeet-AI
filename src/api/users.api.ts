import { apiClient } from './client';
import type { GetUsersParams, GetUsersResponse } from '../types/user';

export const usersApi = {
  /**
   * Fetch paginated list of team members / users.
   * Supports keyword search ('k'), pagination ('page', 'limit'), and cancellation ('signal').
   */
  async getUsers(params: GetUsersParams = {}): Promise<GetUsersResponse> {
    const { k, page = 1, limit = 10, signal } = params;
    const query = new URLSearchParams();

    if (k && k.trim()) {
      query.set('k', k.trim());
    }

    if (page && page > 0) {
      query.set('page', String(page));
    }

    if (limit && limit > 0) {
      query.set('limit', String(limit));
    }

    const queryString = query.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';

    return apiClient.get<GetUsersResponse>(endpoint, { signal });
  },
};

export default usersApi;

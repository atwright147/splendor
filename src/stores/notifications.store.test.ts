import { act, renderHook } from '@testing-library/react';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { type Notification, useNotificationStore } from './notifications.store';

vi.mock('uuid', () => ({ v4: vi.fn() }));

import { v4 as uuidv4 } from 'uuid';

describe('useNotificationStore()', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useNotificationStore());
    act(() => result.current.clear());

    vi.clearAllMocks();
  });

  it('should add a notification', () => {
    const { result } = renderHook(() => useNotificationStore());

    const testNotification: Notification = {
      message: 'Test notification',
      type: 'info',
    };

    act(() => {
      result.current.add(testNotification);
    });

    const { notifications } = result.current;
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject(testNotification);
  });

  it('should generate a unique ID for each notification', () => {
    const mockUuidv4 = uuidv4 as Mock;
    const mockUuid = 'mockUuid-1';
    mockUuidv4.mockReturnValue(mockUuid);

    const { result } = renderHook(() => useNotificationStore());

    const testNotification: Notification = {
      message: 'Test notification',
      type: 'info',
    };

    act(() => result.current.add(testNotification));

    const { notifications } = result.current;
    expect(notifications[0].id).toBe(mockUuid);
  });

  it('should remove a notification', () => {
    const mockUuids = ['mockUuid-1', 'mockUuid-2', 'mockUuid-3'];

    const mockUuidv4 = uuidv4 as Mock;
    mockUuidv4
      .mockReturnValueOnce(mockUuids[0])
      .mockReturnValueOnce(mockUuids[1])
      .mockReturnValueOnce(mockUuids[2]);

    const { result } = renderHook(() => useNotificationStore());

    const testNotification1: Notification = {
      message: 'Test notification 1',
      type: 'info',
    };
    const testNotification2: Notification = {
      message: 'Test notification 2',
      type: 'success',
    };
    const testNotification3: Notification = {
      message: 'Test notification 3',
      type: 'error',
    };

    act(() => result.current.add(testNotification1));
    act(() => result.current.add(testNotification2));
    act(() => result.current.add(testNotification3));

    expect(result.current.notifications).toHaveLength(3);

    act(() => result.current.remove(mockUuids[1]));

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[0]).toEqual({
      ...testNotification1,
      id: mockUuids[0],
    });
    expect(result.current.notifications[1]).toEqual({
      ...testNotification3,
      id: mockUuids[2],
    });
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useNotificationStore());

    const testNotification1: Notification = {
      message: 'Test notification 1',
      type: 'info',
    };
    const testNotification2: Notification = {
      message: 'Test notification 2',
      type: 'success',
    };

    act(() => result.current.add(testNotification1));
    act(() => result.current.add(testNotification2));
    act(() => result.current.clear());

    expect(result.current.notifications).toHaveLength(0);
  });
});

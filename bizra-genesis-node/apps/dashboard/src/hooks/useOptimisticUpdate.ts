/**
 * BIZRA Dignity-First UX - Optimistic Update Hook
 * Document ID: BIZRA-DASHBOARD-v1.0.0-DIGNITY
 *
 * Hook for implementing optimistic UI updates with strict backend validation.
 * Provides dignity-first UX patterns with graceful error handling and rollback.
 */

import { useState, useCallback } from 'react';

export interface OptimisticUpdateOptions<T> {
    onUpdate: (data: T) => Promise<T>;
    onRollback?: (previousData: T) => void;
    onError?: (error: string) => void;
    validate?: (data: T) => boolean;
}

export interface OptimisticUpdateResult<T> {
    update: (newData: T) => Promise<void>;
    updating: boolean;
    error: string | null;
}

/**
 * Hook for optimistic UI updates with backend validation
 */
export function useOptimisticUpdate<T>(
    initialData: T,
    options: OptimisticUpdateOptions<T>
): [T, OptimisticUpdateResult<T>] {
    const [data, setData] = useState<T>(initialData);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = useCallback(async (newData: T) => {
        // Validate data if validator provided
        if (options.validate && !options.validate(newData)) {
            const errorMsg = 'Invalid data provided';
            setError(errorMsg);
            options.onError?.(errorMsg);
            return;
        }

        const previousData = data;
        setUpdating(true);
        setError(null);

        // Optimistic update - immediately update UI
        setData(newData);

        try {
            // Attempt backend validation/update
            const validatedData = await options.onUpdate(newData);

            // Success - update with validated data from backend
            setData(validatedData);
            setUpdating(false);
        } catch (err) {
            // Failure - rollback to previous state
            setData(previousData);
            setUpdating(false);

            const errorMessage = err instanceof Error ? err.message : 'Update failed';
            setError(errorMessage);

            // Call rollback handler if provided
            options.onRollback?.(previousData);

            // Call error handler if provided
            options.onError?.(errorMessage);
        }
    }, [data, options]);

    return [
        data,
        {
            update,
            updating,
            error,
        },
    ];
}

/**
 * Hook for optimistic task completion with PoI logging
 */
export function useOptimisticTaskCompletion() {
    return useOptimisticUpdate(
        { completed: false, taskId: '' },
        {
            onUpdate: async (data: { completed: boolean; taskId: string }) => {
                // Simulate backend validation delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // In real implementation, this would call bizraApi.updateTask(data.taskId, { completed: data.completed })
                // and potentially log PoI event
                return data;
            },
            onError: (error) => {
                console.error('Task completion failed:', error);
            },
        }
    );
}

/**
 * Hook for optimistic resource allocation
 */
export function useOptimisticResourceAllocation(initialAllocation: any) {
    return useOptimisticUpdate(
        initialAllocation,
        {
            onUpdate: async (allocation) => {
                // Simulate backend validation delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // In real implementation, this would call bizraApi.saveResourceAllocation()
                return allocation;
            },
            validate: (allocation) => {
                // Basic validation - ensure values are within reasonable bounds
                return (
                    allocation.compute_cores >= 0 &&
                    allocation.memory_gb >= 0 &&
                    allocation.storage_gb >= 0 &&
                    allocation.gpu_percentage >= 0 && allocation.gpu_percentage <= 100
                );
            },
            onError: (error) => {
                console.error('Resource allocation failed:', error);
            },
        }
    );
}
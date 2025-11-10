import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setError, setProjectStatus } from '../modules/workSpace/redux/statusSlice';

// This custom hook polls the status of multiple projects at regular intervals.
// It fetches the status from a given endpoint and updates the Redux store.

const useMultiProjectStatusPoller = (projectIds = []) => {
    const dispatch = useDispatch();
    const toastIds = useRef({});
    const projectStatuses = useSelector((state) => state.status.projects);

    const fetchStatus = useCallback(async (projectId) => {
        if (!projectId) return;

        try {
            const res = await fetch(`/api/status/${projectId}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Status check failed');

            const { status, progress } = data;
            if (typeof status === 'undefined' || typeof progress === 'undefined') return;

            dispatch(setProjectStatus({ projectId, status, progress }));

            const toastContent = (
                <div style={{ maxWidth: 250 }}>
                    <strong>Project {projectId}</strong> - {status}
                    <div style={{ height: 6, background: '#ddd', borderRadius: 4, marginTop: 6 }}>
                        <div
                            style={{
                                width: `${progress}%`,
                                height: 6,
                                background: '#4caf50',
                                borderRadius: 4,
                                transition: 'width 0.3s',
                            }}
                        />
                    </div>
                    <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{progress}% complete</p>
                </div>
            );

            if (status === 'completed' || progress === 100) {
                toast.dismiss(toastIds.current[projectId]);
                delete toastIds.current[projectId];
                return;
            }

            if (toastIds.current[projectId]) {
                toast.update(toastIds.current[projectId], { render: toastContent });
            } else {
                toastIds.current[projectId] = toast.info(toastContent, {
                    autoClose: false,
                    closeOnClick: false,
                    draggable: false,
                    toastId: `project-toast-${projectId}`,
                });
            }
        } catch (error) {
            console.error(`Error fetching status for ${projectId}:`, error);
            dispatch(setError(error.message));
            toast.error(`Failed to fetch status for Project ${projectId}`);
        }
    }, [dispatch]);

    useEffect(() => {
        if (!projectIds.length) return;

        const validProjectIds = projectIds.filter(Boolean);
        validProjectIds.forEach(fetchStatus); // Initial run

        const interval = setInterval(() => {
            validProjectIds.forEach(fetchStatus);
        }, 30000);

        return () => clearInterval(interval);
    }, [projectIds, fetchStatus]);
};

export default useMultiProjectStatusPoller;
